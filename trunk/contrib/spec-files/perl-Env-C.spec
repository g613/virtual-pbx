# $Revision$, $Date$
#
# Conditional build:
%bcond_without tests           # do not perform "make test"
#
%define                pdir    Env
%define                pnam    C
#%include       /usr/lib/rpm/macros.perl
Summary:       Env::C - Get/Set/Unset Environment Variables on the C level
Name:          perl-Env-C
Version:       0.08
Release:       1
License:       Artistic
Group:         Development/Languages/Perl
Source0:       http://www.cpan.org/modules/by-module/Env/%{pdir}-%{pnam}-%{version}.tar.gz
URL:           http://search.cpan.org/dist/Env-C/
#BuildRequires: perl-devel >= 1:5.8.0
#BuildRequires: rpm-perlprov >= 4.1-13
BuildRoot:     %{tmpdir}/%{name}-%{version}-root-%(id -u -n)

%description
This module provides a Perl API for getenv(3), setenv(3) and
unsetenv(3). It also can return all the environ variables.

Sometimes Perl invokes modules with underlaying C APIs which rely on
certain environment variables to be set, if these variables are set in
Perl and the glue code doesn't worry to set them on the C level, these
variables might not be seen by the C level. This module shows what
really the C level sees.

%prep
%setup -q -n %{pdir}-%{pnam}-%{version}

%build
%{__perl} Makefile.PL \
       INSTALLDIRS=vendor
%{__make} \
       CC="%{__cc}"

%{?with_tests:%{__make} test}

%install
rm -rf $RPM_BUILD_ROOT

%{__make} pure_install \
       DESTDIR=$RPM_BUILD_ROOT
find %{buildroot}%{_prefix} -name perllocal.pod -exec rm -f {} ';'                                                                                                          
find %{buildroot}%{_prefix} -name .packlist -exec rm -f {} ';'

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(644,root,root,755)
%doc Changes README
%{perl_vendorarch}/Env/*.pm
%dir %{perl_vendorarch}/auto/Env/C
%{perl_vendorarch}/auto/Env/C/*.bs
%attr(755,root,root) %{perl_vendorarch}/auto/Env/C/*.so
%{_mandir}/man3/*

%define        date    %(echo `LC_ALL="C" date +"%a %b %d %Y"`)
%changelog
* %{date} PLD Team <feedb...@pld-linux.org>
All persons listed below can be reached at <cvs_login>@pld-linux.org

$Log$
Revision 1.1  2011/03/12 19:00:05  baggins
- initial revision via pldcpan


