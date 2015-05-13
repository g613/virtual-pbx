How to update asterisk to 1.8:

  * download tar archive ( **wget http://virtual-pbx.googlecode.com/files/asterisk-1.8.5.0.tgz** )
  * extract files ( **tar -xzvf asterisk-1.8.5.0.tgz && cd asterisk-1.8.5.0** )
  * stop asterisk service ( **service asterisk stop** )
  * install rpm packages ( **rpm -Fvh `*`.rpm** )
  * install app\_konference ( **cp app\_konference.so  /usr/lib/asterisk/modules/** )
  * change XVB configuration file ( **cat xvb.cfg >> /opt/VirtualPBX/etc/xvb.cfg** )
  * restart system