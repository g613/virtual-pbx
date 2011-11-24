#!/usr/bin/perl
########################################################################
#
# $Id: reg_uac.pl,v 1.5 2011-11-23 18:36:57 gosha Exp $
#
# Copyright (c) 2011 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################
package VirtualPBX;

use strict;

use lib qw( /opt/VirtualPBX/lib );

use XVB::Core;
use XVB::Database;
use XVB::MC;

use IO::Socket::INET;
use Digest::MD5 qw(md5_hex);
use MIME::Base64 qw(encode_base64);
use Fcntl qw(:flock);
use POSIX qw(SIGALRM);

########################################################################
							main();
########################################################################


########################################################################
#
sub new {
	my ( $class, $config_file ) = @_;

	my $obj = bless { _CONF	=> {}, _DB => { PERSISTENT_CONNECTION => 1 } }, $class;

	$obj->core_cfg_init( $config_file );

	return $obj;
}

########################################################################
#
sub main {
	my $obj = new VirtualPBX( '/opt/VirtualPBX/etc/xvb.cfg' );

	unless ( $ARGV[0] eq 'daemon' ) {
		print get_asterisk_conf( $obj );
	} else {
		#
		# check others process
		#
		open( LOCK, '>>' . $obj->core_cfg_get( 'PATH_WORK_DIR' ) .'/.reg_uac.lock' ) || die $!;
		eval {
			local $SIG{__DIE__}  = 'DEFAULT';
			POSIX::sigaction(SIGALRM,POSIX::SigAction->new(sub {die 'Timeout'})) || die "Can't set alarm";
			alarm(5);
			flock LOCK, LOCK_EX;
			alarm 0;
		};
		alarm 0;

		if ( $@ ) {
			$obj->core_log( 'Already running' ) if $obj->core_log_level(16);
			close LOCK;
			return;
		}

		if ( lc($obj->core_cfg_get( 'SIP_UAC_TYPE' )) ne 'asterisk' ) {
			return uac_perl_daemon( $obj );
		} else {
			return uac_asterisk_daemon( $obj );
		}
	}
}

########################################################################
#
sub get_regs {
	my $obj = shift;

	#
	# regs
	#
	my $regs = $obj->cache( 'sh-sip-regs' );
	
	unless ( $regs ) {
		my $sql = 'select 
							s.name,
							s.transport,
							s.host,
							s.fromdomain,
							s.port,
							s.username,
							s.secret,
							s.INC_EXT,
							s.DATA_ID,
							s.SUBSCR_ID,
							a.ACCESS_CODE,
							a.VOICENUMBER
					from 
						'. $obj->core_cfg_get( 'TABLES_SIPPEERS' ) .' s,
						'. $obj->core_cfg_get( 'TABLES_ACCOUNT' ) .' a,
						'. $obj->core_cfg_get( 'TABLES_GROUP' ) .' g
					where 
						s.NEED_REG = 1 and
						s.SUBSCR_ID = a.ID and
						a.GROUP_ID = g.GROUP_ID and
						g.CUSTOM_REGS = 1 and
						length(s.username) > 0
					order by
						s.DATA_ID';

		$regs = $obj->db_get_array_hashref( $sql );
	}

	$obj->cache( 'sh-sip-regs', $regs, $obj->core_cfg_get( 'TIMEOUT_MEM_CACHED_UAC_REG' ) );

	return $regs;
}

########################################################################
#
sub get_asterisk_conf {
	my $obj = shift;

	return '' if lc($obj->core_cfg_get( 'SIP_UAC_TYPE' )) ne 'asterisk';

	my $regs = get_regs( $obj );

	my $out_data = '';

	foreach my $r_ref ( @$regs ) {
		if ( length($r_ref->{'secret'}) ) {
			$out_data .= 'register => '. $r_ref->{'username'} .':'. $r_ref->{'secret'};
		} else {
			$out_data .= 'register => '. $r_ref->{'username'};
		}
		$out_data .= '@'.
					$r_ref->{'name'}		.':'. 
					#$r_ref->{'host'}		.':'. 
					#$r_ref->{'port'}		.'/'. 
					$r_ref->{'VOICENUMBER'} .'*'. $r_ref->{'ACCESS_CODE'} .'*'. $r_ref->{'INC_EXT'} ."\n";
	}

	return $out_data;
}

########################################################################
#
sub uac_perl_daemon {
	my $obj = shift;

	#
	#check Net::SIP version
	#
	eval join( 'use', ( '', 'Net::SIP 0.64;', "Net::SIP::Util ':all';", 'Net::SIP::Debug;' ) );

	if ( $@ ) {
		$obj->core_log( "Please install Net::SIP module [ $@ ]" );
		return;
	}

	my ( %reg_time, %reg_retry );

	if ( $obj->core_log_level(128) ) {
		Net::SIP::Debug->level( 1000 );
	} else {
		Net::SIP::Debug->level( 0 );
	}

	# create user agent
	my $ua;
	
	unless ( $obj->core_cfg_get( 'SIP_UAC_GW_OUT' ) ) {
		$ua = Net::SIP::Simple->new( outgoing_proxy => $obj->core_cfg_get( 'SIP_UAC_GW_IN' ) );
	} else {
		my @gw = split( /\s*,\s*/, $obj->core_cfg_get( 'SIP_UAC_GW_OUT' ) );
		my @legs;
		foreach my $gw ( @gw ) {
			if ( ! grep { $_->can_deliver_to( $gw ) } @legs ) {
				my $sock = create_socket_to($gw,'udp') || die "cannot create socket to $gw / udp";
				push @legs, Net::SIP::Leg->new( sock => $sock );
			}
		}
		$ua = Net::SIP::Simple->new( legs => \@legs );
	} 

	#
	# get user regs data
	#
	my $regs = get_regs( $obj );
	my $regs_time = time;

	dbmopen( %reg_time, $obj->core_cfg_get( 'PATH_WORK_DIR' ) .'/reg_time.db', 0644 ) || die "Can't open DBM file: $!\n";
	dbmopen( %reg_retry, $obj->core_cfg_get( 'PATH_WORK_DIR' ) .'/reg_retry.db', 0644 ) || die "Can't open DBM file: $!\n";

	#
	# init from MC
	#
	foreach my $r_ref ( @$regs ) {
		my $db_key = $r_ref->{'username'} .':'. $r_ref->{'secret'} .'@'. $r_ref->{'host'} .':'. $r_ref->{'port'};
		my $cache_key = $r_ref->{'SUBSCR_ID'}.'-'.$r_ref->{'DATA_ID'};

		my $cur_time = $obj->cache( 'sh-sip-regs-time-' . $cache_key );

		if ( $cur_time and $cur_time > $reg_time{ $db_key } ) {
			$reg_time{ $db_key } = $cur_time || 0;
		}
	}

	#
	# retry configure
	#
	my $retry_max = $obj->core_cfg_get( 'SIP_UAC_REG_RETRY_CNT' ) || 10;
	my $retry_timeout = $obj->core_cfg_get( 'TIMEOUT_UAC_REG_RETRY' ) || 90;

	#
	# reg TTL
	#
	my $reg_ttl = $obj->core_cfg_get( 'TIMEOUT_UAC_REG_TTL' ) || 30;

	while ( 1 ) {
		my $start_time = time;

		foreach my $r_ref ( @$regs ) {
			my $db_key = $r_ref->{'username'} .':'. $r_ref->{'secret'} .'@'. $r_ref->{'host'} .':'. $r_ref->{'port'};
			my $cache_key = $r_ref->{'SUBSCR_ID'}.'-'.$r_ref->{'DATA_ID'};

			if ( time > $reg_time{ $db_key } ) {
				my $expire;
				eval {
					local $SIG{__DIE__}  = 'DEFAULT';
					POSIX::sigaction(SIGALRM,POSIX::SigAction->new(sub {die 'Timeout'})) || die "Can't set alarm";
					alarm(3);
					$expire = $ua->register( 
												registrar		=> $r_ref->{'host'} .':'. $r_ref->{'port'},
												contact			=> 'sip:'. $r_ref->{'VOICENUMBER'} .'*'. $r_ref->{'ACCESS_CODE'} .'*'. $r_ref->{'INC_EXT'} .'@'. ($obj->core_cfg_get( 'SIP_UAC_GW_IN' ) || '127.0.0.1'),
												from			=> 'sip:'. $r_ref->{'username'} .'@'. $r_ref->{'fromdomain'},
												auth			=> [ $r_ref->{'username'}, $r_ref->{'secret'} ],
												expires			=> ($obj->core_cfg_get( 'TIMEOUT_UAC_DEFAULT_EXPIRES' ) || 900)
										 ) || die $ua->error;
					alarm 0;
				};
				alarm 0;

				if ( ! $@ and $expire > 2 ) {
					$obj->core_log( [ 'Registerd ok: %s@%s:%s, expire=%s',
											$r_ref->{'username'},
											$r_ref->{'host'},
											$r_ref->{'port'},
											$expire ] ) if $obj->core_log_level(16);
					$reg_time{ $db_key } = time + int($expire*0.5);
					$reg_retry{ $db_key } = 0;
					$obj->cache( 'sh-sip-regs-time-'. $cache_key, $reg_time{ $db_key }, $obj->core_cfg_get( 'TIMEOUT_MEM_CACHED_UAC_REG' ) );
				} else {
					$obj->core_log( [ 'Registration failed: %s@%s:%s, retry=%s, code=%s ',
											$r_ref->{'username'},
											$r_ref->{'host'},
											$r_ref->{'port'},
											$reg_retry{ $db_key },
											($ua->error||$@) ] ) if $obj->core_log_level(1);
					$reg_retry{ $db_key } = $reg_retry{ $db_key } + 1 if $reg_retry{ $db_key } < $retry_max;
					$reg_time{ $db_key } = time + $retry_timeout * $reg_retry{ $db_key };
					$obj->cache( 'sh-sip-regs-time-'. $cache_key, $reg_time{ $db_key }, $obj->core_cfg_get( 'TIMEOUT_MEM_CACHED_UAC_REG' ) );
				}
			}
		}

		if ( $regs_time + $reg_ttl < time ) {
			$regs = get_regs( $obj );
			$regs_time = time;
		}

		sleep 1 if time == $start_time;
	}
}


########################################################################
#
sub uac_asterisk_daemon {
	my $obj = shift;

	#
	# reg TTL
	#
	my $reg_ttl = $obj->core_cfg_get( 'TIMEOUT_UAC_REG_TTL' ) || 30;

	#
	# cache
	#
	my $reg_data = '';

	while ( 1 ) {
		my $tmp_data = get_asterisk_conf( $obj );
		if ( $tmp_data ne $reg_data ) {
			$obj->core_run_system( "/usr/sbin/asterisk -rx 'sip reload'" );
			$reg_data = $tmp_data;
		}
		sleep $reg_ttl;
	}
}
