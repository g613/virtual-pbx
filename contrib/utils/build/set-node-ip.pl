#!/usr/bin/perl
#
# $Id: set-node-ip.pl,v 1.1 2011-02-21 12:04:35 gosha Exp $
#
use strict;

my %files = (
				'/opt/VirtualPBX/etc/xvb.cfg'	=> [ 's#^(SERVER\s*=\s*https://).*#$1$node_ip#', undef ],
				'/etc/icecast.xml'				=> [ 's#(<!--fixme--><bind-address>)([^<]+)(</bind-address>)#$1$node_ip$3#', '/etc/rc.d/init.d/icecast restart' ]
);

my $ip_str = `ifconfig | grep 'inet addr' | grep -v '127.0.0.1'`;

my $node_ip = 'virtual-pbx';

if ( $ip_str =~ /inet addr:([^\s]+)/) {
	$node_ip = $1;
	system "echo 'update VPBX_NODES set DOWNLOAD_IP=\"$node_ip\",NODE_IP=\"$node_ip\",NODE_STAT_URL=\"https://$node_ip/rrd/sar.html\" where NODE_ID=\"DEFAULT_NODE\";' | mysql -uxvb -ppass1xvb xvb";
	foreach my $file ( keys %files ) {
		system "cp -a $file $file.bak";
		open( IN, "<$file.bak" ) || die $!;
		open( OUT, ">$file" ) || die $!;
		while ( <IN> ) {
			eval $files{$file}->[0];
			print OUT $_;
		}
		close IN;
		close OUT;
		if ( defined $files{$file}->[1] ) {
			system $files{$file}->[1]
		}
	}
}

system "/usr/local/bin/create-issue.sh $node_ip > /etc/issue"
