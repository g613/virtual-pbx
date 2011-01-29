#!/usr/bin/perl
########################################################################
#
# $Id: viewlogs.pl,v 1.2 2009-11-19 23:01:20 gosha Exp $
#
# Copyright (c) 2009 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################

use strict;

my $build = shift @ARGV;

my %orig_keys;

if ( $build eq 'dump' ) {
	my ( $in_file, $out_file ) = @ARGV;
	dbmopen( %orig_keys, $in_file, 0644 ) || die $!;
	open(OUT_FILE, ">$out_file" ) || die $!;
	foreach my $key ( keys %orig_keys ) {
		print OUT_FILE $key, "\t:\t", $orig_keys{$key}, "\n";
	}
	dbmclose(%orig_keys);
	close(OUT_FILE);
	exit;
} else {
	open(IN_FILE,"</opt/VirtualPBX/devel/$build/data/sub") || die $!;
	while ( <IN_FILE> ) {
		chomp;
		my ( $old, $new ) = split(/\t:\t/,$_,2);
		$orig_keys{$new} = $old;
	}
	close(IN_FILE);
}

while ( <STDIN> ) {
	s#^(\d+/\d+\s+\d+:\d+:\d+\s+\[\d+\]\s+\[XVB.*::)([^:]+)(:\d+:\d+\])#$1$orig_keys{$2}$3#;
	print $_;
}

