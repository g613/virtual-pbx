#!/usr/bin/perl
########################################################################
#
# $Id: tt_preprocess.pl,v 1.13 2010-09-23 10:33:54 gosha Exp $
#
#    2010 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################

use strict;

my $in_file = $ARGV[0];
open ( IN, "<$in_file" ) || die $!;

undef $/;
my $data = <IN>;
$/ = "\n";
close IN;

my $dir = $in_file;
$dir =~ s#\.tt$##;
system "mkdir $dir";

my @chunks = split /(\[\%[ \t]+(?:IF|END|FOREACH)[ \t][^%]*\%\])/, $data;

foreach my $vb_type ( 1 .. 27 ) {
	my $need_print = 1;
	my $if_cnt = 0;
	my $if_ind_bad;
	my $if_ind_good;
	open ( OUT, ">$dir/vb_$vb_type.tt") || die $!;

	foreach my $str ( @chunks ) {
		if ( $str =~ /^\[\%[ \t]+(?:IF|FOREACH)[ \t][^%]*\%\]/ ) {
			if ( $str =~ /IF\s+VBOX_PREF.TYPE\s+eq\s+['"](\d+)['"]/ ) {
				if ( $1 ne $vb_type ) {
					$need_print = 0;
					$if_ind_bad = $if_cnt;
				} else {
					$if_ind_good = $if_cnt;
				}
			} else {
				print OUT $str if $need_print;
			}
			$if_cnt++;
		} elsif ( $str =~ /^\[\%[ \t]+END[ \t][^%]*\%\]/ ) {
			$if_cnt--;
			if ( defined $if_ind_bad and  $if_cnt == $if_ind_bad ) {
				$need_print = 1;
				undef $if_ind_bad;
			} elsif ( defined $if_ind_good and $if_cnt == $if_ind_good ) {
				undef $if_ind_good;
			} else {
				print OUT $str if $need_print;
			}
		} elsif( $need_print ) {
			print OUT $str;
		}
	}
	close OUT;
}
