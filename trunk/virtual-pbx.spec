%define CORE_DIR /opt/VirtualPBX
%define ASTERISK_VARLIB_HOME %{_datadir}/asterisk
Name: virtual-pbx
Summary: Dynamic IVR / SOHO VirtualPBX
Version: 2
Release: 1
License: GPL
BuildRoot: %{_tmppath}/%{name}-%{version}-build
Packager: Igor Okunev <igor.okunev@gmail.com>
Source0:  virtual-pbx-%{release}.tar.gz
Group:    System Environment/Services
BuildArch: noarch

Requires: mysql
Requires: mysql-server
Requires: memcached
Requires: sox >= 14.3.2
Requires: ffmpeg
Requires: lame
Requires: mpg123
Requires: libmad
Requires: perl = 5.8.8
Requires: perl(DBI)
Requires: perl(DBD::mysql)
Requires: perl(Digest::MD5)
Requires: perl(Email::Send)
Requires: perl(MIME::Lite)
Requires: perl(MIME::Types)
Requires: perl(Email::Date::Format)
Requires: perl(Cache::Memcached)
Requires: perl(Net::SSLeay)
Requires: perl(XML::SAX)
Requires: perl(Env::C)
Requires: perl(IO::Socket::SSL)
Requires: perl(Gearman::Client)
Requires: perl(Gearman::Worker)
Requires: perl(Authen::SASL)

%description
Dynamic IVR / SOHO VirtualPBX - CORE files


####################################################
#
%package voip
Summary: Dynamic IVR / SOHO VirtualPBX VOIP application
Group:   System Environment/Services

Requires: asterisk >= 1.6.0.28
Requires: virtual-pbx-sound-files >= 1-1_5226
Requires: virtual-pbx = %{version}-%{release}
Requires: festival
Requires: libshout
Requires: lynx
Requires: mysql-connector-odbc
Requires: unixODBC
Requires: perl(Asterisk::AGI) >= 0.09
Requires: perl(Time::HiRes)

%description voip
Dynamic IVR / SOHO VirtualPBX - VOIP applications


####################################################
#
%package voip-fagi
Summary: Dynamic IVR / SOHO VirtualPBX FastAGI utils
Group:   System Environment/Services

Requires: virtual-pbx-voip
Requires: perl(Authen::Radius)
Requires: freeradius

%description voip-fagi
Dynamic IVR / SOHO VirtualPBX - FastAGI utils


####################################################
#
%package web
Summary: Dynamic IVR / SOHO VirtualPBX - WEB interface
Group:   System Environment/Services

Requires: virtual-pbx = %{version}-%{release}
Requires: httpd
Requires: mod_perl
Requires: mod_ssl
Requires: perl(Apache::DBI)
Requires: perl(XML::Simple)
Requires: perl(XML::Parser)
Requires: perl(JSON::XS)

%description web
Dynamic IVR / SOHO VirtualPBX  - WEB interface


####################################################
#
%package management
Summary: Dynamic IVR / SOHO VirtualPBX - Management utilites
Group:   System Environment/Services

Requires: virtual-pbx = %{version}-%{release}
%description management
Dynamic IVR / SOHO VirtualPBX  - Management utilites


####################################################
#
%package sound-files
Summary: Dynamic IVR / SOHO VirtualPBX Sound files
Group:   System Environment/Services

%description sound-files
Dynamic IVR / SOHO VirtualPBX - Sound files


####################################################
#
%package devel
Summary: Dynamic IVR / SOHO VirtualPBX devel
Group:   System Environment/Services

%description devel
Dynamic IVR / SOHO VirtualPBX - devel


####################################################
#
%package balancer
Summary: Dynamic IVR / SOHO VirtualPBX Load balancer
Group:   System Environment/Services
Requires: kamailio

%description balancer
Dynamic IVR / SOHO VirtualPBX - Load balancer


####################################################
#
%prep
rm -rf $RPM_BUILD_ROOT
mkdir $RPM_BUILD_ROOT

%setup -q -n virtual-pbx

%install
mkdir -p $RPM_BUILD_ROOT/%ASTERISK_VARLIB_HOME/sounds
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/httpd/conf.d
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/asterisk/xvb
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/logrotate.d
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/cron.d
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/cron.hourly
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/cron.monthly
mkdir -p $RPM_BUILD_ROOT/%{_sysconfdir}/rc.d/init.d
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/doc
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/db
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/recordings
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/podcasts
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/data

#start-devel
perl contrib/utils/build/proj-obf.pl
perl contrib/utils/viewlogs.pl dump project.files.sub $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/data/sub
perl contrib/utils/viewlogs.pl dump project.files.var $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/data/var
cp test-script.pl $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/
#end-devel

mv agi-bin $RPM_BUILD_ROOT/%CORE_DIR/
mv etc $RPM_BUILD_ROOT/%CORE_DIR/
mv lib $RPM_BUILD_ROOT/%CORE_DIR/
mv templates $RPM_BUILD_ROOT/%CORE_DIR/
mv web $RPM_BUILD_ROOT/%CORE_DIR/
mkdir -p $RPM_BUILD_ROOT/%CORE_DIR/web/cgi-bin
mv cgi-bin/VirtualPBX-UI.cgi $RPM_BUILD_ROOT/%CORE_DIR/web/cgi-bin/ui
mv cgi-bin/VirtualPBX-AI.cgi $RPM_BUILD_ROOT/%CORE_DIR/web/cgi-bin/ai

cp contrib/utils/db_backup.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-0-db_backup.pl
cp contrib/utils/MemCached.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.hourly/xvb-0-MemCached.pl
mv contrib/utils/journals_clean.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-1-journals_clean.pl
mv contrib/utils/cdr_reports.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-2-cdr_reports.pl
mv contrib/utils/cdr_clean.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-3-cdr_clean.pl
mv contrib/utils/msg_clean.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-4-msg_clean.pl
mv contrib/utils/podcast_get.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.hourly/xvb-1-podcast_get.pl
cp contrib/utils/billing_processor.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.daily/xvb-5-billing_processor_daily.pl
mv contrib/utils/billing_processor.pl $RPM_BUILD_ROOT/%{_sysconfdir}/cron.monthly/xvb-0-billing_processor_monthly.pl
mv contrib/virtual-pbx.cron $RPM_BUILD_ROOT/%{_sysconfdir}/cron.d/

mv contrib/utils/viewlogs.pl $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/
date > $RPM_BUILD_ROOT/%CORE_DIR/devel/%{release}/data/build-date

cp contrib/XVB.pdf $RPM_BUILD_ROOT/%CORE_DIR/web/
cp contrib/XVB-AI.pdf $RPM_BUILD_ROOT/%CORE_DIR/web/
mv contrib/XVB.pdf $RPM_BUILD_ROOT/%CORE_DIR/doc/
mv contrib/XVB.odt $RPM_BUILD_ROOT/%CORE_DIR/doc/
mv contrib/XVB-AI.pdf $RPM_BUILD_ROOT/%CORE_DIR/doc/
mv contrib/XVB-AI.odt $RPM_BUILD_ROOT/%CORE_DIR/doc/

mv contrib/fagi.rc $RPM_BUILD_ROOT/%{_sysconfdir}/rc.d/init.d/xvb-fagi
mv contrib/perl-worker.rc $RPM_BUILD_ROOT/%{_sysconfdir}/rc.d/init.d/xvb-perl-worker
mv contrib/gearman-worker.rc $RPM_BUILD_ROOT/%{_sysconfdir}/rc.d/init.d/xvb-gearman-worker
mv sounds/*.tgz $RPM_BUILD_ROOT/%ASTERISK_VARLIB_HOME/sounds/
mv contrib/asterisk/extensions.conf $RPM_BUILD_ROOT/%{_sysconfdir}/asterisk/xvb/xvb.conf
mv contrib/httpd.conf $RPM_BUILD_ROOT/%{_sysconfdir}/httpd/conf.d/xvb.conf
mv contrib/logrotate.conf $RPM_BUILD_ROOT/%{_sysconfdir}/logrotate.d/xvb.conf
mv contrib/BOM.txt $RPM_BUILD_ROOT/%CORE_DIR/etc/BOM-EN.txt
mv contrib/BOM-*.txt $RPM_BUILD_ROOT/%CORE_DIR/etc/
mv contrib $RPM_BUILD_ROOT/%CORE_DIR/

mv 3rdparty $RPM_BUILD_ROOT/%CORE_DIR/

#
# clean CVS tree
#
cd $RPM_BUILD_ROOT/
find -name CVS -type d | xargs rm -rf
cd - > /dev/null

#
# template obfuscate
#
find $RPM_BUILD_ROOT/%CORE_DIR/templates -name 'voicebox_info.tt' -type f |
	while read f_name
	do
		perl $RPM_BUILD_ROOT/%CORE_DIR/contrib/utils/build/tt_preprocess.pl $f_name
	done

export XVB_VERSION=%{release}
cd $RPM_BUILD_ROOT/%CORE_DIR/templates
find -name '*.tt' -exec perl ../contrib/utils/build/html_clean.pl {} ';'
find -name '*.bak' -exec rm -f {} ';'
ln -s xvb.RU-Male xvb.RU-Male-Dmitri
ln -s xvb.RU-Male xvb.RU-Female-Olga
ln -s xvb.RU-Male xvb.RU-Female
ln -s . default
ln -s . xvb.EN-Male
ln -s . xvb.EN-Female
ln -s . single/xvb.EN-Male
ln -s . single/xvb.EN-Female

cd - > /dev/null

#
# clean contrib/utils
#
rm -rf $RPM_BUILD_ROOT/%CORE_DIR/contrib/utils/build
rm -f $RPM_BUILD_ROOT/%CORE_DIR/contrib/Diagram.dia

#
# Unpack sounds
#
cd $RPM_BUILD_ROOT/%ASTERISK_VARLIB_HOME/sounds
find -name '*.tgz' -exec tar -xzvf {} ';'
rm $RPM_BUILD_ROOT/%ASTERISK_VARLIB_HOME/sounds/*.tgz

####################################################
#
%pre
# stop services
#service memcached stop || true


####################################################
#
%pre voip
#service asterisk stop || true


####################################################
#
%pre voip-fagi
service xvb-fagi stop || true


####################################################
#
%pre web
service httpd stop || true


####################################################
#
%post
# update DB structure
perl %CORE_DIR/contrib/utils/rpm/db_update.pl
perl %CORE_DIR/contrib/utils/rpm/cfg_update.pl

#
mkdir -p /var/log/VirtualPBX/backup && chown -R asterisk.asterisk /var/log/VirtualPBX

# auto start
chkconfig mysqld on
chkconfig memcached on

# start services
#service memcached start
# CleanUP cache
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup tariffs
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup reports
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_TARIFF
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_CURRENCY
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_VBOX_TYPE
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_NODES
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_VBOXES_DIALOUT_TYPE
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_TZ
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_DTMF_PATTERN
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_LANG
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_VBOXES_RECORD_FTYPE
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_MOH
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_DATE_FORMAT
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_CID_TYPE
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_CID_ACTIONS
perl %CORE_DIR/contrib/utils/nodes_admin/mc_cleanup lists-VPBX_SIPPEERS_TEMPLATES

####################################################
#
%post sound-files
#
# install sounds
#
find %ASTERISK_VARLIB_HOME/sounds/ -name '*.wav16' -exec perl %CORE_DIR/contrib/utils/rpm/wave-install.pl {} ';'

ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.RU-Male/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.RU-Male &> /dev/null
ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.EN-Female/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.EN-Female &> /dev/null
ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.EN-Male/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.EN-Male &> /dev/null
# with out tts
ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.RU-Male-Dmitri/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.RU-Male-Dmitri &> /dev/null
ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.RU-Female-Olga/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.RU-Female-Olga &> /dev/null
ln -s %ASTERISK_VARLIB_HOME/sounds/xvb.RU-Female/digits %ASTERISK_VARLIB_HOME/sounds/digits/xvb.RU-Female &> /dev/null
#
ln -s %ASTERISK_VARLIB_HOME/sounds %CORE_DIR

#
# install MOH
#
find $RPM_BUILD_ROOT/%CORE_DIR/contrib/moh -name '*.wav16' -exec perl %CORE_DIR/contrib/utils/rpm/wave-install.pl {} ';'

# fix MOH
if [ -f %{_sysconfdir}/asterisk/musiconhold.conf ]; then
	STR=`grep 'VirtualPBX' %{_sysconfdir}/asterisk/musiconhold.conf`
	if [ "x$STR" = "x" ]; then
		cat %CORE_DIR/contrib/asterisk/musiconhold.conf >> %{_sysconfdir}/asterisk/musiconhold.conf
	fi
fi

#
# install BackgroundMOH
#
find $RPM_BUILD_ROOT/%CORE_DIR/contrib/bg-moh -name '*.wav16' -exec perl %CORE_DIR/contrib/utils/rpm/wave-install.pl {} ';'
rm -rf $RPM_BUILD_ROOT/%CORE_DIR/contrib/bg-moh/by_name

####################################################
#
%post voip

# fix features
if [ -f %{_sysconfdir}/asterisk/features.conf ]; then
	STR=`grep 'VirtualPBX' %{_sysconfdir}/asterisk/features.conf`
	if [ "x$STR" = "x" ]; then
		cat %CORE_DIR/contrib/asterisk/feautures.conf >> %{_sysconfdir}/asterisk/features.conf
	fi
fi

touch /etc/asterisk/xvb/xvb-phone-service.conf || true

chkconfig asterisk on

STR=`service asterisk status | grep running`
if [ "x$STR" = "x" ]; then
	service asterisk start;
else
	asterisk -rx 'dialplan reload';
	asterisk -rx 'features reload';
	# moh reload
	STR=`rpm -qv asterisk | grep '1.8'`
	if [ "x$STR" = "x" ]; then
		asterisk -rx 'moh reload';
	fi
	# perl-worker
	STR=`ps ax | grep [V]irtualPBX-perl-worker`
	if [ "x$STR" != "x" ]; then
		killall VirtualPBX.agi || true
	fi
	# gearman-worker
	STR=`ps ax | grep [gG]earman-worker.pl`
	if [ "x$STR" != "x" ]; then
		killall gearman-worker.pl || true
	fi
fi



####################################################
#
%post voip-fagi
# init auth cache
perl %CORE_DIR/contrib/utils/MemCached.pl

chkconfig xvb-fagi on
service xvb-fagi start


####################################################
#
%post web
# apache password
touch $RPM_BUILD_ROOT/%CORE_DIR/web/.htpasswd
# download spool init
mkdir -p /tmp/xvb-download && chmod 777 /tmp/xvb-download 

chkconfig httpd on
service httpd start


####################################################
#
%postun


####################################################
#
%files
%defattr(-,asterisk,asterisk,0750)
%attr(440,asterisk,asterisk) %config(noreplace) %CORE_DIR/etc/*.cfg
%attr(440,root,root) %config(noreplace) %{_sysconfdir}/logrotate.d/*.conf
%attr(755,root,root) %CORE_DIR/contrib/utils/backup_restore.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/callblast.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/db_backup.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/file2moh.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/mc_view.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/MemCached.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/node_stat.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/check_updates.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/icecast-db-init.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/google-voice-search.pl
%attr(755,root,root) %CORE_DIR/contrib/utils/ices2
%attr(755,root,root) %CORE_DIR/contrib/utils/nodes_admin/*
%attr(755,root,root) %CORE_DIR/contrib/utils/rpm/*
%CORE_DIR/lib/*
%CORE_DIR/templates/*
%CORE_DIR/doc/XVB.odt
%CORE_DIR/doc/XVB.pdf
%CORE_DIR/doc/XVB-AI.odt
%CORE_DIR/doc/XVB-AI.pdf
%CORE_DIR/contrib/xvb.sql
%CORE_DIR/contrib/icecast.xml
%CORE_DIR/contrib/spec-files/*.gz
%CORE_DIR/etc/BOM-*.txt
%attr(775,asterisk,asterisk) %dir %CORE_DIR/db


####################################################
#
%files voip
%attr(440,asterisk,asterisk) %config(noreplace) %{_sysconfdir}/asterisk/xvb/*.conf
%attr(755,root,root) %{_sysconfdir}/cron.hourly/xvb-1-podcast_get.pl
%attr(644,root,root) %{_sysconfdir}/cron.d/virtual-pbx.cron
%attr(755,asterisk,asterisk) %CORE_DIR/agi-bin/*.agi
%attr(755,root,root) %CORE_DIR/contrib/utils/safe_xvb_perl_worker
%attr(755,root,root) %{_sysconfdir}/rc.d/init.d/xvb-perl-worker
%attr(755,root,root) %CORE_DIR/contrib/utils/safe_xvb_gearman_worker
%attr(755,root,root) %CORE_DIR/contrib/utils/gearman-worker.pl
%attr(755,root,root) %{_sysconfdir}/rc.d/init.d/xvb-gearman-worker
%CORE_DIR/contrib/asterisk/feautures.conf
%CORE_DIR/contrib/asterisk/extconfig.conf
%CORE_DIR/3rdparty/*
%CORE_DIR/contrib/odbc/*
%attr(775,asterisk,asterisk) %dir %CORE_DIR/recordings
%attr(775,asterisk,asterisk) %dir %CORE_DIR/podcasts


####################################################
#
%files voip-fagi
%attr(755,root,root) %CORE_DIR/contrib/utils/safe_xvb_agi
%attr(755,root,root) %CORE_DIR/contrib/utils/Fagi.pl
%attr(755,root,root) %{_sysconfdir}/rc.d/init.d/xvb-fagi
%attr(755,root,root) %{_sysconfdir}/cron.hourly/xvb-0-MemCached.pl


####################################################
#
%files web
%attr(644,root,root) %config(noreplace) %{_sysconfdir}/httpd/conf.d/*.conf
%attr(755,asterisk,asterisk) %CORE_DIR/web/cgi-bin/*
%CORE_DIR/web/*
%CORE_DIR/contrib/sudoers
%CORE_DIR/contrib/nginx.conf


####################################################
#
%files management
%attr(755,root,root) %{_sysconfdir}/cron.daily/*
%attr(755,root,root) %{_sysconfdir}/cron.monthly/*


####################################################
#
%files sound-files
%ASTERISK_VARLIB_HOME/sounds
%CORE_DIR/contrib/moh/*
%CORE_DIR/contrib/bg-moh/*
%CORE_DIR/contrib/asterisk/musiconhold.conf


####################################################
#
%files devel
%attr(644,root,root) %CORE_DIR/devel/%{release}/data/*
%attr(755,root,root) %CORE_DIR/devel/%{release}/*.pl

####################################################
#
%files balancer
%attr(644,root,root) %CORE_DIR/contrib/openser/*
%changelog
