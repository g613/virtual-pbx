Summary: The Open Source PBX
Name: asterisk
Version: 1.6.0.28
Release: XVB.5
License: GPLv2
Group: Applications/Internet
URL: http://www.asterisk.org/
Packager: Igor Okunev

Source0: asterisk-%{version}.tar.gz
Source1: asterisk_logrotate-1.2.txt
Source2: app_fax-1_6_0_17.c

Patch100: agi-dial-1.6.0.patch
Patch101: app_mp3.c.patch
#Patch102: format_wav.c.patch
Patch103: format_wav16.c.patch

BuildRoot: %{_tmppath}/%{name}-%{version}-root-%(%{__id_u} -n)

%define buildsubdir %{name}-%{version}

%description
Asterisk is an Open Source PBX and telephony development platform that
can both replace a conventional PBX and act as a platform for developing
custom telephony applications for delivering dynamic content over a
telephone similarly to how one can deliver dynamic content through a
web browser using CGI and a web server.

Asterisk talks to a variety of telephony hardware including BRI, PRI, 
POTS, and IP telephony clients using the Inter-Asterisk eXchange
protocol (e.g. gnophone or miniphone).  For more information and a
current list of supported hardware, see www.asteriskpbx.com.

%package        devel
Summary:        Header files for building Asterisk modules
Group:          Development/Libraries

%description devel
This package contains the development  header files that are needed
to compile 3rd party modules.

%prep
%setup0 -q
%patch100 -p0
%patch101 -p0
#%patch102 -p0
%patch103 -p0

%configure

ASTCFLAGS="%{optflags}" make DEBUG= OPTIMIZE= ASTVARRUNDIR=%{_localstatedir}/run/asterisk ASTDATADIR=%{_datadir}/asterisk NOISY_BUILD=1

%install
rm -rf %{buildroot}

ASTCFLAGS="%{optflags}" make install DEBUG= OPTIMIZE= DESTDIR=%{buildroot} ASTVARRUNDIR=%{_localstatedir}/run/asterisk ASTDATADIR=%{_datadir}/asterisk
ASTCFLAGS="%{optflags}" make samples DEBUG= OPTIMIZE= DESTDIR=%{buildroot} ASTVARRUNDIR=%{_localstatedir}/run/asterisk ASTDATADIR=%{_datadir}/asterisk
mv %{buildroot}/%{_sysconfdir}/asterisk %{buildroot}/%{_sysconfdir}/asterisk-samples

if [ "x$AST_PRECOMPILE" != "x" ]; then
	cp -r $AST_PRECOMPILE/* %{buildroot}/
fi

# create dirs
%{__install} -d -m 0755 %{buildroot}%{_sysconfdir}/sysconfig
%{__install} -d -m 0755 %{buildroot}%{_sysconfdir}/logrotate.d
%{__install} -d -m 0755 %{buildroot}%{_sysconfdir}/rc.d/init.d
%{__install} -d -m 0755 %{buildroot}%{_datadir}/snmp/mibs

%{__install} -D -p -m 0755 contrib/init.d/rc.redhat.asterisk %{buildroot}%{_initrddir}/asterisk
%{__install} -D -p -m 0644 doc/asterisk-mib.txt %{buildroot}%{_datadir}/snmp/mibs/ASTERISK-MIB.txt
%{__install} -D -p -m 0644 doc/digium-mib.txt %{buildroot}%{_datadir}/snmp/mibs/DIGIUM-MIB.txt
%{__install} -m 0644 %{SOURCE1} %{buildroot}%{_sysconfdir}/logrotate.d/asterisk

# create some directories that need to be packaged
mkdir -p %{buildroot}%{_datadir}/asterisk/moh/
mkdir -p %{buildroot}%{_datadir}/asterisk/sounds/
mkdir -p %{buildroot}%{_localstatedir}/lib/asterisk
mkdir -p %{buildroot}%{_localstatedir}/run/asterisk
mkdir -p %{buildroot}%{_localstatedir}/log/asterisk/cdr-custom/
mkdir -p %{buildroot}%{_localstatedir}/spool/asterisk/outgoing/

rm %{buildroot}%{_datadir}/asterisk/sounds/.asterisk-*
rm %{buildroot}%{_datadir}/asterisk/moh/.asterisk-*

%clean
rm -rf %{buildroot}

%pre
%{_sbindir}/groupadd -r asterisk &>/dev/null || :
%{_sbindir}/useradd  -r -s /sbin/nologin -d %{_localstatedir}/lib/asterisk -M \
                               -c 'Asterisk User' -g asterisk asterisk &>/dev/null || :

%post
ln -sf %{_localstatedir}/spool/asterisk/vm %{_datadir}/asterisk/sounds/vm

%files
#
# Configuration files
#
%attr(0755,root,root) %dir    %{_sysconfdir}/asterisk-samples
%config(noreplace) %attr(0640,root,root) %{_sysconfdir}/asterisk-samples/*.conf
%config(noreplace) %attr(0640,root,root) %{_sysconfdir}/asterisk-samples/*.adsi
%config(noreplace) %attr(0640,root,root) %{_sysconfdir}/asterisk-samples/extensions.ael

#
# RedHat specific init script file
#
%attr(0755,root,root)       %{_sysconfdir}/rc.d/init.d/asterisk
%attr(0755,root,root)  	    %{_sysconfdir}/logrotate.d/asterisk

#
# Modules
#
%attr(0755,root,root) %dir %{_libdir}/asterisk
%attr(0755,root,root) %dir %{_libdir}/asterisk/modules
%attr(0755,root,root)      %{_libdir}/asterisk/modules/*.so

#
# Asterisk
#
%attr(0755,root,root)      %{_sbindir}/asterisk
%attr(0755,root,root)      %{_sbindir}/rasterisk
%attr(0755,root,root)      %{_sbindir}/safe_asterisk
%attr(0755,root,root)      %{_sbindir}/astgenkey
%attr(0755,root,root)      %{_sbindir}/autosupport
%attr(0755,root,root)      %{_sbindir}/smsq
%attr(0755,root,root)      %{_sbindir}/stereorize
%attr(0755,root,root)      %{_sbindir}/streamplayer
%attr(0755,root,root)      %{_sbindir}/aelparse
%attr(0755,root,root)      %{_sbindir}/muted

#
# CDR Locations
#
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/log/asterisk
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/log/asterisk/cdr-csv
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/log/asterisk/cdr-custom
#
# Running directories
#
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/run/asterisk
#
# Sound files
#
%attr(0755,root,root) %dir %{_datadir}/asterisk
%attr(0755,root,root)      %{_datadir}/asterisk/sounds/*
%attr(0755,root,root) %dir %{_datadir}/asterisk/images
%attr(0644,root,root)      %{_datadir}/asterisk/images/*
%attr(0755,root,root) %dir %{_datadir}/asterisk/keys
%attr(0644,root,root)      %{_datadir}/asterisk/keys/*
%attr(0755,root,root) %dir %{_datadir}/asterisk/agi-bin
%attr(0755,root,root) %dir %{_datadir}/asterisk/agi-bin/*
%attr(0755,root,root) %dir %{_datadir}/asterisk/moh
%attr(0755,root,root) %dir %{_datadir}/asterisk/moh/*

#
# Man page
#
%attr(0644,root,root)      %{_mandir}/man8/asterisk.8*
%attr(0644,root,root)      %{_mandir}/man8/astgenkey.8*
%attr(0644,root,root)      %{_mandir}/man8/autosupport.8*
%attr(0644,root,root)      %{_mandir}/man8/safe_asterisk.8*

#
# Firmware
#
%attr(0755,root,root) %dir %{_datadir}/asterisk/firmware
%attr(0755,root,root) %dir %{_datadir}/asterisk/firmware/iax

#
# Example voicemail files
#
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/voicemail
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/voicemail/default
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/voicemail/default/1234
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/voicemail/default/1234/INBOX

#
# Misc other spool
#
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/system
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/outgoing
%attr(0755,asterisk,asterisk) %dir %{_localstatedir}/spool/asterisk/tmp

#
# HTTP
#
%attr(0755,root,root) %dir %{_datadir}/asterisk/static-http
%attr(0644,root,root) %{_datadir}/asterisk/static-http/*

#
# SNMP
#   
%attr(0755,root,root) %dir %{_datadir}/snmp
%attr(0755,root,root) %dir %{_datadir}/snmp/mibs
%attr(0644,root,root) %{_datadir}/snmp/mibs/*

#
# Other
#
/etc/asterisk-samples/extensions.lua
/usr/sbin/astcanary
/usr/sbin/conf2ael
/usr/sbin/hashtest
/usr/sbin/hashtest2
/usr/share/asterisk/phoneprov/000000000000-directory.xml
/usr/share/asterisk/phoneprov/000000000000-phone.cfg
/usr/share/asterisk/phoneprov/000000000000.cfg
/usr/share/asterisk/phoneprov/polycom.xml
/var/spool/asterisk/voicemail/default/1234/en/busy.gsm
/var/spool/asterisk/voicemail/default/1234/en/unavail.gsm

%files devel
#
# Include files
#
%attr(0755,root,root) %dir %{_includedir}/asterisk
%attr(0644,root,root) %{_includedir}/asterisk/*.h
%attr(0644,root,root) %{_includedir}/asterisk.h

