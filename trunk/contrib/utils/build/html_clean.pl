#!/usr/bin/perl
########################################################################
#
# $Id: html_clean.pl,v 1.12 2011-01-05 13:27:07 gosha Exp $
#
# Copyright (c) 2009 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################
$^I = '.bak';

undef $/; $_ = <>;

s#>\s+<#><#gs;
s#\%\]\s+#%] #gs;
s#\s+\[\%# [%#gs;
s#>\s+#> #gs;
s#\s+<# <#gs;

if ( $ENV{'XVB_VERSION'} ) {
	my $date = gmtime;
	s#</html>#<p align='center' class='copyright'><br><a href='/xvb/XVB.pdf?a=msg_download'>VirtualPBX</a> build: $ENV{'XVB_VERSION'} ( $date GMT )<br><br><b><a href='http://home.sinn.ru/~gosha'>-- (c) 2009-2011  Igor Okunev</a> --</b></p></html>#;
}

print;

