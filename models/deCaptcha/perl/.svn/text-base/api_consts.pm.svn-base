#!/usr/bin/perl -w

package api_consts;
require Exporter;
@ISA = qw(Exporter);

@EXPORT = qw( ccERR_OK ccERR_GENERAL ccERR_STATUS ccERR_NET_ERROR
	ccERR_TEXT_SIZE ccERR_OVERLOAD ccERR_BALANCE ccERR_TIMEOUT
	ccERR_UNKNOWN ptoDEFAULT ptoLONG pto30SEC pto60SEC pto90SEC
	ptUNSPECIFIED
	CC_PROTO_VER CC_RAND_SIZE CC_MAX_TEXT_SIZE CC_MAX_LOGIN_SIZE
	CC_MAX_PICTURE_SIZE CC_HASH_SIZE cmdCC_UNUSED cmdCC_LOGIN cmdCC_BYE
	cmdCC_RAND cmdCC_HASH cmdCC_PICTURE cmdCC_TEXT cmdCC_OK cmdCC_FAILED
	cmdCC_OVERLOAD cmdCC_BALANCE cmdCC_TIMEOUT cmdCC_PICTURE2
	cmdCC_PICTUREFL cmdCC_TEXT2 SIZEOF_CC_PACKET SIZEOF_CC_PICT_DESCR
	TRUE FALSE );

#	ERROR CODES
use constant ccERR_OK =>		0;			#	everything went OK
use constant ccERR_GENERAL =>		-1;			#	general internal error
use constant ccERR_STATUS =>		-2;			#	status is not correct
use constant ccERR_NET_ERROR =>		-3;			#	network data transfer error
use constant ccERR_TEXT_SIZE =>		-4;			#	text is not of an appropriate size
use constant ccERR_OVERLOAD =>		-5;			#	server's overloaded
use constant ccERR_BALANCE =>		-6;			#	not enough funds to complete the request
use constant ccERR_TIMEOUT =>		-7;			#	requiest timed out
use constant ccERR_UNKNOWN =>		-200;			#	unknown error

#	picture processing TIMEOUTS
use constant ptoDEFAULT =>		0;			#	default timeout, server-specific
use constant ptoLONG =>			1;			#	long timeout for picture, server-specfic
use constant pto30SEC =>		2;			#	30 seconds timeout for picture
use constant pto60SEC =>		3;			#	60 seconds timeout for picture
use constant pto90SEC =>		4;			#	90 seconds timeout for picture

#	picture processing TYPES
use constant ptUNSPECIFIED =>		0;			#	picture type unspecified

use constant CC_PROTO_VER =>		1;			#	protocol version
use constant CC_RAND_SIZE =>		256;			#	size of the random sequence for authentication procedure
use constant CC_MAX_TEXT_SIZE =>	100;			#	maximum characters in returned text for picture
use constant CC_MAX_LOGIN_SIZE =>	100;			#	maximum characters in login string
use constant CC_MAX_PICTURE_SIZE =>	200000;			#	200 K bytes for picture seems sufficient for all purposes
use constant CC_HASH_SIZE =>		32;

use constant cmdCC_UNUSED =>		0;		
use constant cmdCC_LOGIN =>		1;			#	login
use constant cmdCC_BYE =>		2;			#	end of session
use constant cmdCC_RAND =>		3;			#	random data for making hash with login+password
use constant cmdCC_HASH =>		4;			#	hash data
use constant cmdCC_PICTURE =>		5;			#	picture data, deprecated
use constant cmdCC_TEXT =>		6;			#	text data, deprecated
use constant cmdCC_OK =>		7;			#
use constant cmdCC_FAILED =>		8;			#
use constant cmdCC_OVERLOAD =>		9;			#
use constant cmdCC_BALANCE =>		10;			#	zero balance
use constant cmdCC_TIMEOUT =>		11;			#	time out occured
use constant cmdCC_PICTURE2 =>		12;			#	picture data
use constant cmdCC_PICTUREFL =>		13;			#	picture failure
use constant cmdCC_TEXT2 =>		14;			#	text data

use constant SIZEOF_CC_PACKET =>	6;		
use constant SIZEOF_CC_PICT_DESCR =>	20;		

use constant TRUE => 1;
use constant FALSE => 0;

1;
