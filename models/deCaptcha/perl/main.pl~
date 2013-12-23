#!/usr/bin/perl -w
use strict;
use lib substr(__FILE__, 0, rindex (__FILE__, "/"));
use ccproto_client;
use api_consts;

my $HOST =	'';        #HOST
my $PORT =	0;         #PORT
my $USERNAME =	'';    #LOGIN
my $PASSWORD =	'';    #PASSWORD

my $PIC_FILE_NAME = "/tmp/sorry-cropped.jpg";

my $ccp = new ccproto();
$ccp->init();

exit 1 if( $ccp->login( $HOST, $PORT, $USERNAME, $PASSWORD ) < 0 );

my $major_id = 0;
my $minor_id = 0;

my $pict;
{
    local $/;
    open(IN, "<$PIC_FILE_NAME") || die "Cannot open: $!";
    binmode(IN);
    $pict = <IN>;
}

my $text      = '';
my $pict_to	  = ptoDEFAULT;
my $pict_type = ptUNSPECIFIED;

my $res = $ccp->picture2( $pict, \$pict_to, \$pict_type, \$text, \$major_id, \$minor_id );

# most common return codes
if ($res == ccERR_OK) {
    print '{"status":200, "text":"' . $text . '", "major_id":"' . $major_id . '", "minor_id": "' . $minor_id . '"}';
} elsif ($res == ccERR_BALANCE) {
    print '{"status":500, "error":"not enough funds to process a picture, balance is depleted"}';
} elsif ($res == ccERR_TIMEOUT) {
    print '{"status":500, "error":"picture has been timed out on server (payment not taken)"}';
} elsif ($res == ccERR_OVERLOAD) {
    print '{"status":500, "error":"temporarily server-side error"}';
} elsif ($res == ccERR_STATUS) {    # local errors
    print "local error.";
    print " either ccproto_init() or ccproto_login() has not been successfully called prior to ccproto_picture()";
    print " need ccproto_init() and ccproto_login() to be called";
} elsif ($res == ccERR_NET_ERROR) {  # network errors
    print "network troubles, better to call ccproto_login() again";
} elsif ($res == ccERR_TEXT_SIZE) { # server-side errors
    print "size of the text returned is too big";
} elsif ($res == ccERR_GENERAL) {
    print "server-side error, better to call ccproto_login() again";
} elsif ($res == ccERR_UNKNOWN) {
    print " unknown error, better to call ccproto_login() again";
} else {
    # any other known errors?
}
exit 0;
