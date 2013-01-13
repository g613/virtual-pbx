#!/usr/bin/perl
########################################################################
#
# $Id: html_clean.pl,v 1.23 2012-12-30 21:01:15 gosha Exp $
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

my $xvb_version = $ENV{'XVB_VERSION'} ;

if ( $xvb_version ) {
	$xvb_version =~ s#^1_##;
	my $date = gmtime;
	if ( $ARGV =~ /xvb.RU-/ ) {
		s#(</body>)?\s*</html>#<p align='center' class='copyright'><br><a href='/xvb/XVB.pdf?a=msg_download'>XVB - VirtualPBX</a> v.2, build: $xvb_version ( $date GMT ) / <a href='http://virtual-pbx.ru/ru-prices.html'>Commercial Support</a><br><br>-- (c) 2009-2013 by <b>Igor Okunev</b>. All rights reserved. --</p>$1</html>#;
	} else {
		s#(</body>)?\s*</html>#<p align='center' class='copyright'><br><a href='/xvb/XVB-EN.pdf?a=msg_download'>XVB - VirtualPBX</a> v.2, build: $xvb_version ( $date GMT ) / <a href='http://virtual-pbx.ru/en/prices.html'>Commercial Support</a><br><br>-- (c) 2009-2013 by <b>Igor Okunev</b>. All rights reserved. --</p>$1</html>#;
	}
}

print;

