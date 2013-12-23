#!/usr/bin/perl -w

use strict;

#
#	CC protocol class
#

package ccproto;
	use Digest::MD5 qw(md5_hex);
	use Digest::SHA qw(sha256);
	use Digest;
	use IO::Socket::INET;
	use ccproto;
	use api_consts;

	use constant sCCC_INIT =>		1;		#	initial status, ready to issue LOGIN on client
	use constant sCCC_LOGIN =>		2;		#	LOGIN is sent, waiting for RAND (login accepted) or CLOSE CONNECTION (login is unknown)	
	use constant sCCC_HASH =>		3;		#	HASH is sent, server may CLOSE CONNECTION (hash is not recognized)
	use constant sCCC_PICTURE =>		4;


	sub new {
		my $class = shift;
		my $this = { };
		bless $this, $class;

		$this->{status}	= undef;
		$this->{s}	= undef;

		return $this;
	}

	#
	#
	#
	sub init() {
		my ($this) = @_;
		$this->{status} = sCCC_INIT;
	} # init()

	#
	#
	#
	sub login {
		my ($this, $hostname, $port, $login, $pwd) = @_;
		$this->{status} = sCCC_INIT;

		my $errnum = 0;
		my $errstr = '';

		my $sock = IO::Socket::INET->new(PeerAddr => "$hostname:$port");
		if (! defined($sock)) {
			print STDERR "We have an open socket error: $!\n";
			return ccERR_NET_ERROR;
		}
		$this->{s} = $sock;

		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );

		$pack->setCmd( cmdCC_LOGIN );
		$pack->setSize( length( $login ) );
		$pack->setData( $login );

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		if( $pack->unpackFrom( $this->{s}, cmdCC_RAND, CC_RAND_SIZE ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		my $shabuf = '';
		$shabuf .= $pack->getData();
		$shabuf .= md5_hex( $pwd );
		$shabuf .= $login;
		
		$pack->setCmd( cmdCC_HASH );
		$pack->setSize( CC_HASH_SIZE );
		$pack->setData( sha256($shabuf) );
		
		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}
		
		if( $pack->unpackFrom( $this->{s}, cmdCC_OK ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		$this->{status} = sCCC_PICTURE;

		return ccERR_OK;
	} # login()

	#
	#	picture2
	#
	#	$pict,		#	IN		picture binary data
	#	\$pict_to 	#	IN/OUT	timeout specifier to be used, on return - really used specifier, see ptoXXX constants, ptoDEFAULT in case of unrecognizable
	#	\$pict_type 	#	IN/OUT	type specifier to be used, on return - really used specifier, see ptXXX constants, ptUNSPECIFIED in case of unrecognizable
	#	\$text				#	OUT	text
	#	\$major_id	#	OUT	OPTIONAL	major part of the picture ID
	#	\$minor_id	#	OUT OPTIONAL	minor part of the picture ID

	sub picture2 {
		my ($this, $pict, $pict_to, $pict_type, $text, $major_id, $minor_id) = @_;
		if( $this->{status} != sCCC_PICTURE ) {
			return ccERR_STATUS;
		}

		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );
		$pack->setCmd( cmdCC_PICTURE2 );

		my $desc = new cc_pict_descr();
		$desc->setTimeout( ptoDEFAULT );
		$desc->setType( $$pict_type );
		$desc->setMajorID( 0 );
		$desc->setMinorID( 0 );
		$desc->setData( $pict );
		$desc->calcSize();
		
		$pack->setData( $desc->pack() );
		$pack->calcSize();

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		if( $pack->unpackFrom( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}
		
	
		my $cmd = $pack->getCmd();
		if ($cmd == cmdCC_TEXT2) {
			$desc->unpack( $pack->getData() );
			$$pict_to	= $desc->getTimeout();
			$$pict_type	= $desc->getType();
			$$text		= $desc->getData();
			if( defined( $major_id ) ) {
				$$major_id	= $desc->getMajorID();
			}
			if( defined( $minor_id ) ) {
				$$minor_id	= $desc->getMinorID();
			}
			return ccERR_OK;

		} elsif ($cmd == cmdCC_BALANCE) {
			# balance depleted
			return ccERR_BALANCE;
		
		} elsif ($cmd == cmdCC_OVERLOAD) {
			# server's busy
			return ccERR_OVERLOAD;
		
		} elsif ($cmd == cmdCC_TIMEOUT) {
			# picture timed out
			return ccERR_TIMEOUT;
		
		} elsif ($cmd == cmdCC_FAILED) {
			# server's error
			return ccERR_GENERAL;
		} else {
			# unknown error
			return ccERR_UNKNOWN;
		}
	} # picture2()

	#
	#
	#
	sub picture_bad2 {
		my ($this, $major_id, $minor_id) = @_;
		my $pack = new cc_packet();

		$pack->setVer( CC_PROTO_VER );
		$pack->setCmd( cmdCC_PICTUREFL );

		my $desc = new cc_pict_descr();
		$desc->setTimeout( ptoDEFAULT );
		$desc->setType( ptUNSPECIFIED );
		$desc->setMajorID( $major_id );
		$desc->setMinorID( $minor_id );
		$desc->calcSize();
		
		$pack->setData( $desc->pack() );
		$pack->calcSize();

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		return ccERR_NET_ERROR;
	} # picture_bad2()
	
	#
	# balance( \$balance	) {
	#
	sub balance {
		my ($this, $balance) = @_;
		if( $this->{status} != sCCC_PICTURE ) {
			return ccERR_STATUS;
		}

		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );
		$pack->setCmd( cmdCC_BALANCE );
		$pack->setSize( 0 );

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		if( $pack->unpackFrom( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}
		
		if( $pack->getCmd() == cmdCC_BALANCE ) {
			$$balance = $pack->getData();
			return ccERR_OK;
		} else {
			# unknown error
			return ccERR_UNKNOWN;
		}
	} # balance()
	#
	#
	#
	sub close {
		my ($this) = @_;
		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );

		$pack->setCmd( cmdCC_BYE );
		$pack->setSize( 0 );

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		$this->{s}->close;
		$this->{status} = sCCC_INIT;

		return ccERR_NET_ERROR;
	} # close()


	#*
	#	deprecated subs section. still operational, but better not be used
	#

	#
	# sub picture( $pict, &$text ) {
	#
	#
	sub picture {
		my ($this, $pict, $text) = @_;
		if( $this->{status} != sCCC_PICTURE ) {
			return ccERR_STATUS;
		}

		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );

		$pack->setCmd( cmdCC_PICTURE );
		$pack->setSize( length( $pict ) );
		$pack->setData( $pict );

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		if( $pack->unpackFrom( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}
		
		my $cmd = $pack->getCmd();
		if ($cmd == cmdCC_TEXT) {
			$$text = $pack->getData();
			return ccERR_OK;

		} elsif ($cmd == cmdCC_BALANCE) {
			# balance depleted
			return ccERR_BALANCE;
		
		} elsif ($cmd == cmdCC_OVERLOAD) {
			# server's busy
			return ccERR_OVERLOAD;
		
		} elsif ($cmd == cmdCC_TIMEOUT) {
			# picture timed out
			return ccERR_TIMEOUT;
		
		} elsif ($cmd == cmdCC_FAILED) {
			# server's error
			return ccERR_GENERAL;
		
		} else {
			# unknown error
			return ccERR_UNKNOWN;
		}
	} # picture()

	#
	#
	#
	sub picture_bad {
		my ($this) = @_;
		my $pack = new cc_packet();
		$pack->setVer( CC_PROTO_VER );

		$pack->setCmd( cmdCC_FAILED );
		$pack->setSize( 0 );

		if( $pack->packTo( $this->{s} ) == FALSE ) {
			return ccERR_NET_ERROR;
		}

		return ccERR_NET_ERROR;
	} # picture_bad()

1;
