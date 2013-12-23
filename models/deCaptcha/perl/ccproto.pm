#!/usr/bin/perl -w
#

use strict;

#
#	packet class
#


package cc_packet;
	use api_consts;
use Data::Dumper;

	sub new {
		my $class = shift;
		my $this = { };

		$this->{ver}	= CC_PROTO_VER;	#	version of the protocol
		$this->{cmd}	= cmdCC_BYE;	#	command, see cc_cmd_t
		$this->{size}	= 0;			#	data size in consequent bytes 
		$this->{data}	= '';			#	packet payload

		bless $this, $class;
		return $this;
	}


	#
	#
	#
	sub checkPackHdr {
		my ($this, $cmd, $size) = @_;

#                print "TEST" . Dumper($this);

		if( $this->{ver} != CC_PROTO_VER ) {
			return FALSE;
		} elsif( defined( $cmd ) && ($this->{cmd} != $cmd) ) {
			return FALSE;
		} elsif( defined( $size ) && ($this->{size} != $size) ) {
			return FALSE;
		}

		return TRUE;
	}

	#
	#
	#
	sub pack {
		my ($this) = @_;
		return pack( 'CCV', $this->{ver}, $this->{cmd}, $this->{size} ) . $this->{data};
	}

	#
	#
	#
	sub packTo {
		my ($this, $handle) = @_;

		my $pkt = $this->pack();
		my $ret = $handle->send($pkt);
		return ($ret > 0) ? TRUE : FALSE;
	}

	#
	#
	#
	sub unpackHeader {
		my ($this, $bin) = @_;
		my @arr = unpack( 'CCV', $bin );
		$this->{ver}	= $arr[0];
		$this->{cmd}	= $arr[1];
		$this->{size}	= $arr[2];
	}

	#
	#
	#
	sub unpackFrom {
		my ($this, $handle, $cmd, $size) = @_;
		my $bin;

		$handle->recv($bin, SIZEOF_CC_PACKET);
		if (! defined($bin)) {
			return FALSE;
		}
		$this->unpackHeader( $bin );

		if( $this->checkPackHdr( $cmd, $size ) == FALSE ) {
			return FALSE;
		}

		if( $this->{size} > 0 ) {
			$handle->recv($bin, $this->{size});
			if (! defined($bin)) {
				return FALSE;
			}
			$this->{data} = $bin;
		}
		return TRUE;
	}

	#
	#
	#
	sub setVer {
		my ($this, $ver) = @_;
		$this->{ver} = $ver;
	}

	#
	#
	#
	sub getVer {
		my ($this) = @_;
		return $this->{ver};
	}

	#
	#
	#
	sub setCmd {
		my ($this, $cmd) = @_;
		$this->{cmd} = $cmd;
	}

	#
	#
	#
	sub getCmd {
		my ($this) = @_;
		return $this->{cmd};
	}

	#
	#
	#
	sub setSize {
		my ($this, $size) = @_;
		$this->{size} = $size;
	}

	#
	#
	#
	sub getSize {
		my ($this) = @_;
		return $this->{size};
	}

	#
	#
	#
	sub calcSize {
		my ($this) = @_;
		$this->{size} = length( $this->{data} );
		return $this->{size};
	}

	#
	#
	#
	sub getFullSize {
		my ($this) = @_;
		return SIZEOF_CC_PACKET + $this->{size};
	}

	#
	#
	#
	sub setData {
		my ($this, $data) = @_;
		$this->{data} = $data;
	}

	#
	#
	#
	sub getData{
		my ($this) = @_;
		return $this->{data};
	}

#
#	picture description class
#
package cc_pict_descr;
	use api_consts;

	sub new {
		my $class = shift;
		my $this = { };
		bless $this, $class;

		$this->{timeout}	= ptoDEFAULT;
		$this->{type}		= ptUNSPECIFIED;
		$this->{size}		= 0;
		$this->{major_id}	= 0;
		$this->{minor_id}	= 0;
		$this->{data}		= '';

		return $this;
	}

	#
	#
	#
	sub pack {
		my ($this) = @_;
		return pack( 'VVVVV', $this->{timeout}, $this->{type}, $this->{size}, $this->{major_id}, $this->{minor_id} ) . $this->{data};
	}

	#
	#
	#
	sub unpack {
		my ($this, $bin) = @_;
		my @arr = unpack( 'VVVVV', $bin );
		$this->{timeout}	= $arr[0];
		$this->{type}		= $arr[1];
		$this->{size}		= $arr[2];
		$this->{major_id}	= $arr[3];
		$this->{minor_id}	= $arr[4];
		$this->{data}		= substr( $bin, SIZEOF_CC_PICT_DESCR );
	}

	#
	#
	#
	sub setTimeout {
		my ($this, $to) = @_;
		$this->{timeout} = $to;
	}

	#
	#
	#
	sub getTimeout {
		my ($this) = @_;
		return $this->{timeout};
	}

	#
	#
	#
	sub setType {
		my ($this, $type) = @_;
		$this->{type} = $type;
	}

	#
	#
	#
	sub getType {
		my ($this) = @_;
		return $this->{type};
	}

	#
	#
	#
	sub setSize {
		my ($this, $size) = @_;
		$this->{size} = $size;
	}

	#
	#
	#
	sub getSize {
		my ($this) = @_;
		return $this->{size};
	}

	#
	#
	#
	sub calcSize {
		my ($this) = @_;
		$this->{size} = length( $this->{data} );
		return $this->{size};
	}

	#
	#
	#
	sub getFullSize {
		my ($this) = @_;
		return SIZEOF_CC_PICT_DESCR + $this->{size};
	}

	#
	#
	#
	sub setMajorID {
		my ($this, $major_id) = @_;
		$this->{major_id} = $major_id;
	}

	#
	#
	#
	sub getMajorID {
		my ($this) = @_;
		return $this->{major_id};
	}

	#
	#
	#
	sub setMinorID {
		my ($this, $minor_id) = @_;
		$this->{minor_id} = $minor_id;
	}

	#
	#
	#
	sub getMinorID {
		my ($this) = @_;
		return $this->{minor_id};
	}

	#
	#
	#
	sub setData {
		my ($this, $data) = @_;
		$this->{data} = $data;
	}

	#
	#
	#
	sub getData() {
		my ($this) = @_;
		return $this->{data};
	}


1;
