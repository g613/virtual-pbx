#!/usr/bin/perl
########################################################################
#
# $Id: radiusgw.pl,v 1.2 2012-03-26 20:01:46 gosha Exp $
#
#		2012 (c) Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################
use strict;

use Asterisk::AGI;
use Authen::Radius;

=pod
extension.conf:

exten => _2XXX/_2XXX,1,Set(RADIUS_GW_PAIRS=User-Name:${CALLERID(num)}|User-Password:${EXTEN})
exten => _2XXX/_2XXX,n,AGI(/usr/local/bin/radiusgw.pl)

agi set debug on

-- Executing [2200@preprocess:2] AGI("SIP/10.1.5.1-0000072f", "/usr/local/bin/radiusgw.pl") in new stack
-- Launched AGI Script /usr/local/bin/radiusgw.pl
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_request: /usr/local/bin/radiusgw.pl
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_channel: SIP/10.1.5.1-0000072f
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_language: en
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_type: SIP
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_uniqueid: 1332790156.1839
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_version: 1.6.2.18
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_callerid: 2299
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_calleridname: 2299
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_callingpres: 0
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_callingani2: 0
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_callington: 0
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_callingtns: 0
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_dnid: 2200
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_rdnis: unknown
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_context: preprocess
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_extension: 2200
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_priority: 2
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_enhanced: 0.0
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_accountcode:
<SIP/10.1.5.1-0000072f>AGI Tx >> agi_threadid: -1214432368
<SIP/10.1.5.1-0000072f>AGI Tx >>
<SIP/10.1.5.1-0000072f>AGI Rx << GET VARIABLE RADIUS_GW_HOST
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=0
<SIP/10.1.5.1-0000072f>AGI Rx << GET VARIABLE RADIUS_GW_SECRET
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=0
<SIP/10.1.5.1-0000072f>AGI Rx << GET VARIABLE RADIUS_GW_DICT
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=0
<SIP/10.1.5.1-0000072f>AGI Rx << GET VARIABLE RADIUS_GW_PAIRS
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1 (User-Name:2299|User-Password:2200)
<SIP/10.1.5.1-0000072f>AGI Rx << SET VARIABLE RADIUS_GW_STATUS 2
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1
<SIP/10.1.5.1-0000072f>AGI Rx << SET VARIABLE RADIUS_GW_ATTR_current_storage_size 1490
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1
<SIP/10.1.5.1-0000072f>AGI Rx << SET VARIABLE RADIUS_GW_ATTR_role Host
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1
<SIP/10.1.5.1-0000072f>AGI Rx << SET VARIABLE RADIUS_GW_ATTR_conference_language EN
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1
<SIP/10.1.5.1-0000072f>AGI Rx << SET VARIABLE RADIUS_GW_ATTR_conference_country US
<SIP/10.1.5.1-0000072f>AGI Tx >> 200 result=1
-- <SIP/10.1.5.1-0000072f>AGI Script /usr/local/bin/radiusgw.pl completed, returning 0

=cut

########################################################
				main();
########################################################
sub main {

	my $agi = Asterisk::AGI->new( use_sigs => 1 );

	my $agi_input = { $agi->ReadParse() };

	my $rad_host	= $agi->get_variable( 'RADIUS_GW_HOST' ) || '127.0.0.1:1812';
	my $rad_secret	= $agi->get_variable( 'RADIUS_GW_SECRET' ) || 'testing';
	my $rad_dir		= $agi->get_variable( 'RADIUS_GW_DICT' ) || '';
	#my $rad_dir		= $agi->get_variable( 'RADIUS_GW_DICT' ) || '/opt/VirtualPBX/etc/raddb/dictionary';

	Authen::Radius->load_dictionary($rad_dir);

	my $radius = new Authen::Radius(
				Host	=> $rad_host,
				Secret	=> $rad_secret,
				Timeout	=> 3
			);

	my $attr = $agi->get_variable( 'RADIUS_GW_PAIRS' );

	unless ( $attr ) {
		$agi->set_variable( 'RADIUS_GW_STATUS', '-1' );
		$agi->set_variable( 'RADIUS_GW_ERROR', 'Missing params' );
		return -1;
	}

	foreach my $l_atr ( split( /\|/, $attr ) ) {
		my ( $k, $v ) = split( /:/, $l_atr );
		$radius->add_attributes (
				{ Name => $k, Value => $v },
			);
	}

	$radius->send_packet(ACCESS_REQUEST);

	my $reply = $radius->recv_packet();

	$agi->set_variable( 'RADIUS_GW_STATUS', $reply );

	if ( $reply != 2 ) {
		my $error = Authen::Radius::strerror();
		if ($error ne 'none') {
			$agi->set_variable( 'RADIUS_GW_ERROR', $error );
			return -1;
		}
		return 0;
	}

	for my $attr ( $radius->get_attributes() ) {
		$agi->set_variable( 'RADIUS_GW_ATTR_'.$attr->{'Name'}, $attr->{'Value'} );
	}

	return 1;
}

