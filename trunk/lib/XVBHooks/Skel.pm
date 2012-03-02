########################################################################
#
# $Id: Skel.pm,v 1.2 2012-03-02 11:25:26 gosha Exp $
#
#	Copyright (c) Igor Okunev <igor[at]prv.mts-nn.ru>
#
#						2012
#
########################################################################
package XVBHooks::Skel;

use strict;

use vars qw( %hooks );

%hooks = (
				start	=> \&call_start,
				stop	=> \&call_stop
);

#
# call start hook
#
sub call_start {
	my $obj = shift;

	$obj->{'_AGI'}->verbose(	'Start call with type: '. 
								$obj->{'_CDR'}->{'CALL_TYPE'} .
								' for ac: '. 
								$obj->{'_USER_CREDS'}->{'ACCESS_CODE'} );
}

#
# call stop hook
#
sub call_stop {
	my $obj = shift;

	$obj->{'_AGI'}->verbose(	'Stop call, duration: '. 
								(time - $obj->{'_CDR'}->{'CALL_START'}) );
}

1;

