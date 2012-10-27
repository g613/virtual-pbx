########################################################################
#
# $Id: CIDNorm.pm,v 1.1 2012-10-20 19:02:07 gosha Exp $
#
#	Copyright (c) Igor Okunev <igor[at]prv.mts-nn.ru>
#
#						2012
#
########################################################################
package XVBHooks::CIDNorm;

use strict;

use vars qw( %hooks );

%hooks = (
				start	=> \&call_start,
				stop	=> 0
);

#
# call start hook
#
sub call_start {
	my $obj = shift;

	$obj->{'_AGI'}->set_variable( 'CALLERID(num)', $obj->{'_CDR'}->{'CALLER_ID'} );
}

1;

