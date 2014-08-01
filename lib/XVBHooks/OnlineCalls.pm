########################################################################
#
# $Id: OnlineCalls.pm,v 1.4 2014/07/19 18:30:19 gosha Exp $
#
#	Copyright (c) Igor Okunev <igor[at]prv.mts-nn.ru>
#
#						2013
#
########################################################################
package XVBHooks::OnlineCalls;

use strict;

require 'Mongo'.'DB.pm';

use vars qw( %hooks );


#
# DB scheme
#
# use xvb;
# db.cdrs.insert( { ast_id: "0000000", user_id:"0", xvb_id: "0000000", timestamp: 0, callerid:"io", called:"613", node:"DEFAULT"} );
# db.cdrs.ensureIndex( { ast_id:1} );
# db.cdrs.ensureIndex( { xvb_id:1} );
# db.cdrs.ensureIndex( { user_id:1} );

%hooks = (
				start	=> \&call_start,
				stop	=> \&call_stop
);

#
# call start hook
#
sub call_start {
	my $obj = shift;

	my $ast_callid = $obj->{'_AGI'}->get_variable('CHANNEL');
	my $xvb_callid = $obj->{'_CDR'}->{'CALL_ID'};

	$obj->{'_MONGO_DB'} = MongoDB::Connection->new(host => '127.0.0.1', port => 27017);

	if ( $obj->{'_MONGO_DB'} ) {
		my $cdrs = $obj->{'_MONGO_DB'}->xvb->cdrs;
		my $rc = $cdrs->insert( {	ast_id 		=> $ast_callid,
						timestamp	=> time, 
						xvb_id		=> $xvb_callid, 
						user_id		=> $obj->{'_USER_CREDS'}->{'ACCESS_CODE'},
						callerid	=> $obj->{'_CDR'}->{'CALLER_ID'},
						calledid	=> $obj->{'_CDR'}->{'CALLED_ID'},
						call_type	=> $obj->{'_CDR'}->{'CALL_TYPE'},
						node		=> $obj->{'_CONF'}->{'common_server_id'} } );
	}
}

#
# call stop hook
#
sub call_stop {
	my $obj = shift;

	my $ast_callid = $obj->{'_AGI'}->get_variable('CHANNEL');

	if ( $obj->{'_MONGO_DB'} ) {
		my $cdrs = $obj->{'_MONGO_DB'}->xvb->cdrs;

		my $rc = $cdrs->remove( { ast_id => $ast_callid } );
	}
}

1;

