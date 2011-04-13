#!/usr/bin/perl
########################################################################
#
# $Id: google-voice-search.pl,v 1.1 2011-04-13 06:06:39 gosha Exp $
#
# Copyright (c) 2011 Okunev Igor <igor[at]prv.mts-nn.ru>
#
########################################################################

require LWP::UserAgent;

my ( $file, $lang ) = @ARGV;

my ( $url, $use_converter );

unless ( $file ) {
	die "Usage: $0 file.flac lang\n\twhere lang is ru or en\n";
}

if ( lc($lang) eq 'ru' ) {
	$url = "https://www.google.com/speech-api/v1/recognize?xjerr=1&client=chromium&lang=ru-RU";
} else {
	$url = "https://www.google.com/speech-api/v1/recognize?xjerr=1&client=chromium&lang=en-US";
}

#
# to FLAC
#
unless ( $file =~ /\.flac$/i ) {
	system "ffmpeg -y -i $file $file.flac 2> /dev/null";
	if ( $? ) {
		die "Can't convert file $file to $file.flac: $?\n";
	} else {
		$file .= '.flac';
		$use_converter = 1;
	}
}

my $file_info = `file $file`;

if ( $file_info =~ /FLAC audio.*\s(\d+)\s*kHz/ ) {
	$file_info = $1.'000';
} else {
	unlink $file if $use_converter;
	die "Incorrect FLAC file: $file_info\n";
}

open( FILE, "<$file" ) || die "Can't open input file[$file]: $!\n";
undef $/; my $audio = <FILE>; $/ = "\n";
close(FILE);

unlink $file if $use_converter;

my $ua = LWP::UserAgent->new( debug => 1 );

my $response = $ua->post($url, Content_Type => "audio/x-flac; rate=$file_info", Content => $audio);

if ( $response->is_success ) {
	print $response->content;
} else {
	use Data::Dumper;
	delete $response->{'_request'}->{'_content'};
	print STDERR Dumper($response);
}

