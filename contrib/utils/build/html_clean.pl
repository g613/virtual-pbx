#!/usr/bin/perl
########################################################################
#
# $Id: html_clean.pl,v 1.14 2011-05-05 07:03:09 gosha Exp $
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
	s#(</body>)?\s*</html>#<p align='center' class='copyright'><br><a href='/xvb/XVB.pdf?a=msg_download'>XVB - VirtualPBX</a> v.2, build: $ENV{'XVB_VERSION'} ( $date GMT )<br><br><b><a href='http://home.sinn.ru/~gosha'>-- (c) 2009-2011  Igor Okunev</a> --</b></p>$1</html>#;
}

print;

