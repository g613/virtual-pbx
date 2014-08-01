########################################################################
#
# $Id: CIDNorm.pm,v 1.2 2014/07/19 18:30:19 gosha Exp $
#
#	Copyright (c) Igor Okunev <igor[at]prv.mts-nn.ru>
#
#						2012 - 2014
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

	if ( $obj->{'_CDR'}->{'CALL_TYPE'} ne 'transit' and $obj->{'_CDR'}->{'CALL_TYPE'} ne 'internal' ) {
		$obj->{'_AGI'}->set_variable( 'CALLERID(num)', $obj->{'_CDR'}->{'CALLER_ID'} );
	}
}

1;

