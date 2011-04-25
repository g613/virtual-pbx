#!/usr/bin/perl
########################################################################
#
# $Id: html_clean.pl,v 1.13 2011-04-20 07:28:34 gosha Exp $
#
# Copyright (c) 2009 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################
$^I = '.bak';

undef $/; $_ = <>;

if ( $ARGV =~ /statements\.tt$/ ) {
	# workaround - MIME::Lite->as_string deforms long strings...
	s#\n\s+#\n#gs;
} else {
	s#>\s+<#><#gs;
	s#\%\]\s+#%] #gs;
	s#\s+\[\%# [%#gs;
	s#>\s+#> #gs;
	s#\s+<# <#gs;
}

if ( $ENV{'XVB_VERSION'} ) {
	my $date = gmtime;
	s#</html>#<p align='center' class='copyright'><br><a href='/xvb/XVB.pdf?a=msg_download'>VirtualPBX</a> build: $ENV{'XVB_VERSION'} ( $date GMT )<br><br><b><a href='http://home.sinn.ru/~gosha'>-- (c) 2009-2011  Igor Okunev</a> --</b></p></html>#;
}

print;

