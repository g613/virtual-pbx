#!/usr/bin/perl
########################################################################
#
# $Id: icecast-db-init.pl,v 1.3 2011-02-20 15:32:14 gosha Exp $
#
#		(c) Okunev Igor <igor[at]prv.mts-nn.ru>
#					2011 
#
########################################################################

use strict;

use Digest::MD5 qw(md5_hex);

########################################################################
							main( @ARGV );
########################################################################


#
# main
#
sub main {
	my ( $home, $channel_cnt, $server, $rebuild ) = @_;

	undef $/;
	my $data = <DATA>;
	$/ = "\n";

	my ( $ices_data, $ezstream_data ) = split(/=====/,$data);
	my %chan_cache;

	system "mkdir -p .icecast-init/ices2";
	system "mkdir -p .icecast-init/ezstream";

	open ( SQL, '>.icecast-init/init.sql' ) || die "Can't open sql file: $!\n";
	open ( XML, '>.icecast-init/init.xml' ) || die "Can't open xml file: $!\n";

	if ( $rebuild ) {
		open( ICE_CONF, "<$rebuild" ) || die "Can't open icecast config: $!\n";
		while ( <ICE_CONF> ) {
			if ( m{<mount><mount-name>/([^<]+)</mount-name><password>([^<]+)</password><hidden>1</hidden></mount>} ) {
				my $md5_1 = $1;
				my $md5_2 = $2;
				$chan_cache{$md5_1} = 1;
				create_lock_file( $ices_data, 'ices2', $md5_1, $md5_2 );
				create_lock_file( $ezstream_data, 'ezstream', $md5_1, $md5_2 );
			}
		}
		close ICE_CONF;
	} else {
		for ( my $i=1; $i<=$channel_cnt; $i++ ) {
			my $ind = rand(100_000) .'-'. time;
			my $md5_1 = md5_hex("$ind-$i");
			my $md5_2 = md5_hex("$i-$ind");
			if (  length($md5_1) == 0 or length($md5_2) == 0 or $chan_cache{$md5_1} or -e "$home/ices2/$md5_1.xml" ) {
				$channel_cnt++;
			} else {
				print XML "\t<mount><mount-name>/$md5_1</mount-name><password>$md5_2</password><hidden>1</hidden></mount>\n";
				print SQL "insert into VPBX_ICECAST_POOL(CONF_FILE, LEASE_TIMESTAMP) values('$md5_1',".time.");\n";
				$chan_cache{$md5_1} = 1;
				create_lock_file( $ices_data, 'ices2', $md5_1, $md5_2 );
				create_lock_file( $ezstream_data, 'ezstream', $md5_1, $md5_2 );
			}
		}
	}
}

sub create_lock_file {
	my ( $l_data, $format, $md5_1, $md5_2 ) = @_;

	open ( CHAN_LOCK, ">.icecast-init/$format/$md5_1.xml" ) || die $!;
	$l_data =~ s#\[% PASSWORD %\]#$md5_2#gs;
	$l_data =~ s#\[% MOUNT %\]#$md5_1#gs;
	print CHAN_LOCK $l_data;
	close CHAN_LOCK;
}

__DATA__
<?xml version="1.0"?>
<ices>
    <background>0</background>
    <logpath>/tmp/</logpath>
    <logfile>ices.log</logfile>
    <loglevel>1</loglevel>
    <consolelog>0</consolelog>
    <stream>
        <metadata>
            <name>VirtualPBX broadcasting</name>
            <genre>Live calls</genre>
            <description>VirtualPBX broadcasting</description>
            <url>http://code.google.com/p/virtual-pbx/</url>
        </metadata>
        <input>
            <module>stdinpcm</module>
            <param name="rate">8000</param>
            <param name="channels">1</param>
            <param name="metadata">0</param>
        </input>
        <instance>
            <hostname>127.0.0.1</hostname>
            <port>8000</port>
            <password>[% PASSWORD %]</password>
            <mount>/[% MOUNT %]</mount>
            <yp>0</yp>
            <encode>  
                <quality>0</quality>
                <samplerate>8000</samplerate>
                <channels>1</channels>
            </encode>
            <downmix>0</downmix>
        </instance>
    </stream>
</ices>
=====
<ezstream>
	<url>http://127.0.0.1:8000/[% MOUNT %]</url>
	<sourcepassword>[% PASSWORD %]</sourcepassword>
	<format>MP3</format>
	<filename>stdin</filename>

	<svrinfoname>VirtualPBX broadcasting</svrinfoname>
	<srrinfourl>http://code.google.com/p/virtual-pbx/</srrinfourl>
	<svrinfogenre>Live Calls</svrinfogenre>
	<svrinfodescription>VirtualPBX broadcasting</svrinfodescription>
	<svrinfobitrate>64</svrinfobitrate>
	<svrinfochannels>1</svrinfochannels>
	<svrinfosamplerate>8000</svrinfosamplerate>
	<svrinfopublic>0</svrinfopublic>
</ezstream> 

