/*
    <!-- $Id: xvb.js,v 1.21 2010-11-27 17:56:40 gosha Exp $ -->
*/
var aryClassElements = new Array();
var isMSIE = /*@cc_on!@*/false;

function CLStart( obj ) {
	obj.className='in_t1';
}
function CLStop( obj ) {
	if ( obj.type != 'select-one' ) {
		if ( obj.value == obj.defaultValue ) {
			obj.className='in_t0';
		} else {
			obj.className='in_t2';
		}
	} else {
		if ( obj.options[ obj.selectedIndex ].defaultSelected == true ) {
			obj.className='in_t0';
		} else {
			obj.className='in_t2';
		}
	}
	var change_flag = checkChanges( obj.form );
	var img_id = 'in_t_id-' + obj.form.data_id.value;
	if ( change_flag == true ) {
		document.getElementById(img_id).className = 'in_t_open';
	} else {
		document.getElementById(img_id).className = 'in_t';
	}
}

function xmlhttpDel(obj,lang,data_id,parent_id) {
	var need_del = DelConfirm(lang);

	if ( need_del == false ) {
		return false;
	}

	LoadingOn();
	//document.body.style.cursor='wait';

	// Domain check
	var new_href = obj.href.split("?",1);
	var cur_href = window.location.href.split("?",1);
	if ( new_href[0] != cur_href[0] ) {
		return true;
	}

	var xmlHttpReq = false;
	var self = this;
	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		self.xmlHttpReq = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	self.xmlHttpReq.open('GET', obj.href+'&force2x=1', true);

	self.xmlHttpReq.onreadystatechange = function() {
		if (self.xmlHttpReq.readyState == 4) {
			if ( self.xmlHttpReq.statusText == 'Ok' || self.xmlHttpReq.status == 204 || self.xmlHttpReq.status == 1223 ) {
				if ( data_id != null ) {
					var table;
					if ( parent_id == null ) {
						table = document.getElementById('d-tbl');
					} else {
						table = document.getElementById(parent_id);
					}
					var tr = document.getElementById(data_id);
					table.deleteRow(tr.rowIndex);
				}
			} else {
				alert('Delete error: '+ self.xmlHttpReq.status +' : '+ self.xmlHttpReq.responseText );
			}
			LoadingOff();
			//document.body.style.cursor='default';
		}
	}
	
	self.xmlHttpReq.send();
	return false;
}

function xmlhttpPost(obj,r_type) {
	//document.body.style.cursor='wait';
	LoadingOn();

	var needUpdate = checkChanges(obj);
	if ( needUpdate == false ) {
		//document.body.style.cursor='default';
		LoadingOff();
		return false;
	}

	var xmlHttpReq = false;
	var self = this;
	// Mozilla/Safari
	if (window.XMLHttpRequest) {
		self.xmlHttpReq = new XMLHttpRequest();
	}
	// IE
	else if (window.ActiveXObject) {
		self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}
	var post_data = 'force2x=1';
	for( i=0; i < obj.elements.length; i++ ) {
		obj.elements[i].blur();
		if ( obj.elements[i].type == 'checkbox' || obj.elements[i].type == 'radio' ) {
			if ( obj.elements[i].checked == true ) {
				post_data = post_data +'&'+ obj.elements[i].name + '=' + encodeURIComponent(obj.elements[i].value);
			}
		} else {
			post_data = post_data +'&'+ obj.elements[i].name + '=' + encodeURIComponent(obj.elements[i].value);
		}
	}
	
	self.xmlHttpReq.open('GET', obj.getAttributeNode('action').value+'?'+post_data, true);

	self.xmlHttpReq.onreadystatechange = function() {
		if (self.xmlHttpReq.readyState == 4) {
			if ( self.xmlHttpReq.status == 204 || self.xmlHttpReq.status == 1223 ) {
				updateAfterAjax( obj, r_type );
			} else {
				alert('Update error: '+ self.xmlHttpReq.responseText );
			}
			//document.body.style.cursor='default';
			LoadingOff();
		}
	}
	
	self.xmlHttpReq.send();
	return false;
}

function updateAfterAjax( obj, r_type ) {
	for( i=0; i < obj.elements.length; i++ ) {
		if ( obj.elements[i].type == 'select-one' ) {
			var safe_selector = obj.elements[i].selectedIndex;
			for ( i2=0; i2 < obj.elements[i].length; i2++ ) {
				obj.elements[i].options[i2].defaultSelected = false;
			}
			obj.elements[i].options[ safe_selector ].defaultSelected = true;
			if ( r_type == 1 ) {
				obj.elements[i].className='in_t0';
			}
		} else if ( obj.elements[i].type == 'text' || obj.elements[i].type == 'textarea' ) {
			obj.elements[i].defaultValue = obj.elements[i].value;
			if ( r_type == 1 ) {
				obj.elements[i].className='in_t0';
			}
		} else if ( obj.elements[i].type == 'checkbox' || obj.elements[i].type == 'radio' ) {
			obj.elements[i].defaultChecked = obj.elements[i].checked;
			if ( r_type == 1 ) {
				obj.elements[i].className='in_t0';
			}
		}
	}
	if ( r_type == 1 ) {
		var img_id = 'in_t_id-' + obj.data_id.value;
		document.getElementById(img_id).className = 'in_t';
	}
}

function checkChanges( obj ) {
	var change_flag = false;
	for( i=0; i < obj.elements.length; i++ ) {
		if ( obj.elements[i].type == 'checkbox' || obj.elements[i].type == 'radio' ) {
			if ( obj.elements[i].checked != obj.elements[i].defaultChecked ) {
				change_flag = true;
				//alert( "Type: " + obj.elements[i].type + ' - checked 0, old: ' + obj.elements[i].defaultChecked  );
			}
		} else if ( obj.elements[i].type == 'submit' ) {
			obj.elements[i].blur();
		} else if ( obj.elements[i].type == 'button' ) {
			// NoOP
		} else if ( obj.elements[i].type != 'select-one' ) {
			if ( obj.elements[i].value != obj.elements[i].defaultValue ) {
				change_flag = true;
				//alert( "Type: " + obj.elements[i].type + ' - checked 1'  );
			}
		} else {
			var df_ind = -1;
			for ( i2=0; i2 < obj.elements[i].options.length; i2++ ) {
				if ( obj.elements[i].options[i2].defaultSelected == true ) {
					df_ind = i2;
					break;
				}
			}
			if ( df_ind == -1 ) {
				obj.elements[i].options[0].defaultSelected = true;
			}
			if ( obj.elements[i].options[ obj.elements[i].selectedIndex ].defaultSelected != true) {
				change_flag = true;
				//alert( "Type: " + obj.elements[i].type + ' - checked 2'  );
			}
		}
	}
	return change_flag;
}

function DelConfirm( lang, msg ) {
	LoadingOn();
	var ret;
	if ( msg != null ) {
		ret = confirm( msg );
	} else {
		if ( lang == 'ru' ) {
			ret = confirm( 'Вы действительно хотите удалить это ?' );
		} else {
			ret = confirm( 'Are you sure you want to delete it ?' );
		}
	}
	if ( ret == false ) {
		LoadingOff();
	}
	return ret;
}

function getElementsByClassName( strClassName, obj ) {
	if ( obj.className == strClassName ) {
		aryClassElements[aryClassElements.length] = obj;
	}
	for ( var i = 0; i < obj.childNodes.length; i++ )
		getElementsByClassName( strClassName, obj.childNodes[i] );
}

function ChangeVbType(type,id,uniq) {
	var new_location = '?action=vb_change_type&type='+ type +'&id='+ id +'&uniq='+ uniq;
	
	if( isMSIE ) {
		window.location.href( new_location+'&referer='+encodeURIComponent(document.location.href) );
	} else {
		window.location.href = new_location;
	}
}
	
function ChangeExten(exten,uniq) {
	var new_location = '?action=vb_view&id='+ exten +'&uniq='+ uniq	;

	if( isMSIE ) window.location.href( new_location );
	else window.location.href = new_location;
}

function MoreExtOptions(link,init_mode,expert_tytle,standard_title) {
	aryClassElements.length = 0;
	curOpt = getCookie('xvb_vb_view_mode');

	if ( curOpt == 'addon_info_open' ) {
		if ( init_mode != 1 ) {
			newOpt = 'addon_info';
			link_title= expert_tytle;
		} else {
			newOpt = curOpt;
			curOpt = 'addon_info';
			link_title = standard_title;
		}
	} else {
		curOpt = 'addon_info';
		if ( init_mode != 1 ) {
			newOpt = 'addon_info_open';
			link_title = standard_title;
		} else {
			newOpt = curOpt;
			link_title = expert_tytle;
		}
	}
	
	getElementsByClassName( curOpt, document.body );

	for ( var i = 0; i < aryClassElements.length; i++ ) {
		aryClassElements[i].className = newOpt;
	}

	setCookie('xvb_vb_view_mode',newOpt);

	if ( link != null )
		link.innerHTML = link_title;

	return 0;
}

function HideEl( Id ) {
	document.getElementById(Id).className = 'addon_info';
}

function ShowEl( Id ) {
	document.getElementById(Id).className = 'addon_info_open';
}

function ShowPlayer( file ) {
	var el=document.getElementById('shadow');
	el.style.visibility='visible';
	var div_id = document.getElementById('center');
	var player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td><object type="application/x-shockwave-flash" data="/xvb/js/flowplayer/ump3player_500x70.swf" height="70" width="470"><param name="wmode" VALUE="transparent" /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="movie" value="/xvb/js/flowplayer/ump3player_500x70.swf" /><param name="FlashVars" value="way='+file+'&amp;swf=/xvb/js/flowplayer/ump3player_500x70.swf&amp;w=470&amp;h=70&amp;time_seconds=0&amp;autoplay=1&amp;q=&amp;skin=white&amp;volume=90&amp;comment=Voice messages" /></object></td></tr></table>';
	div_id.innerHTML = player_data;
	div_id.style.display = 'block';

	return false;
}

function HidePlayer() {
	var el=document.getElementById('shadow');
	el.style.visibility='hidden';
	var div_id = document.getElementById('center');
	div_id.style.display = 'none';
	
	return false;
}

function setCookie (name, value, expires, path, domain, secure) {
	document.cookie = name + "=" + escape(value) +
		((expires) ? "; expires=" + expires : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
}

function getCookie(name) {
	var cookie = " " + document.cookie;
	var search = " " + name + "=";
	var setStr = null;
	var offset = 0;
	var end = 0;
	if (cookie.length > 0) {
		offset = cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = cookie.indexOf(";", offset)
				if (end == -1) {
					end = cookie.length;
				}
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	return(setStr);
}

function writeUpdateLinks( alt ) {
	document.write("<input type='image' title='"+alt+"' name='"+alt+"' alt='"+alt+"' src='/xvb/images/save.png'>");
}

function graphit(g,gwidth){
	total = new Array();
	graphimage = '/xvb/images/poll.gif';

	for (i=1;i<g.length;i++) {
			for (i2=1;i2<g[i].length;i2++) {
				if ( i == 1 ) {
					total[i2] = g[i][i2];
				} else {
					total[i2] += g[i][i2];
				}
			}
	}

	coll_width = parseInt(90/total.length-1);

	output='<table width="95%" border="0" cellspacing="0" cellpadding="0" class="list_data"><tr class="list_data"><th width="5%">'+(g[0][0])+'</th>';
	for (i2=1;i2<g[0].length;i2++) {
		//output+='<th colspan="2">'+ (g[0][i2]) +'</th>';
		output+='<th colspan="2" width="'+coll_width+'%">'+g[0][i2]+'</th>';
	}
	output+='</tr><tr><td>&nbsp;</td></tr>';

	for (i=1;i<g.length;i++){
		output+='<tr class="nocolor"><td align="right"><b>'+g[i][0]+'</b>&nbsp;</td>';
		for (i2=1;i2<g[i].length;i2++) {
			if ( total[i2] > 0 ) {
				calpercentage=Math.round(parseFloat(g[i][i2]*100/total[i2]) * Math.pow(10, 2)) / Math.pow(10, 2)
			} else {
				calpercentage = 0;
			}
			calwidth=Math.round(gwidth*(calpercentage/100));
			output+='<td align="right">&nbsp;&nbsp;'+
				Math.round(parseFloat(g[i][i2]) * Math.pow(10, 2)) / Math.pow(10, 2)
			+'&nbsp;&nbsp;</td><td><img src="'+graphimage+'" width="'+calwidth+'" height="10"> '+calpercentage+'%</td>';
		}
		output+='</tr>';
	}

	output+='<tr><td>&nbsp;</td></tr><tr><td align="right"><b>Total:</b></td>';

	for (i2=1;i2<g[0].length;i2++) {
		output+='<td align="right"><b>'+
			Math.round(parseFloat(total[i2]) * Math.pow(10, 2)) / Math.pow(10, 2)
		+'</b>&nbsp;&nbsp;</td><td>&nbsp;</td>';
	}
	
	output+='</tr></table>'

	document.write(output)
}

/* Shaddow */
function LoadingOn( noImg ) {
	if ( isMSIE ) {
		return true;
	}
	var el=document.getElementById('shadow');
	el.style.visibility='visible';
	if ( noImg == null ) {
		var img_data = '<img width="50" src="/xvb/images/loading.gif" style="opacity: 1;">';
		var el2=document.getElementById('loading');
		el2.innerHTML = img_data;
		el2.style.visibility='visible';
	}
	return true;
}
function LoadingOff() {
	if ( isMSIE ) {
		return true;
	}
	var el=document.getElementById('shadow');
	el.style.visibility='hidden';
	var el2=document.getElementById('loading');
	el2.style.visibility='hidden';
}

/* Shadow for links */
function setShadowAttr() {
	var all_el = document.getElementsByTagName("*");
	for( i=0; i < all_el.length; i++ ) {
		if ( all_el[i].className == 'in_t0' ) {
			/* class t_0 */
			if ( all_el[i].tagName == 'INPUT' || all_el[i].tagName == 'TEXTAREA' ) {
				all_el[i].onfocus = function() { CLStart(this) };
				all_el[i].onblur = function() { CLStop(this) };
			} else if ( all_el[i].tagName == 'SELECT' ) {
				all_el[i].onchange = function() { CLStop(this) };
			}
		} else if ( all_el[i].tagName == 'A' ) {
			/* tag a */
			if ( all_el[i].href.substr(all_el[i].href.length - 1,1) != '#' && all_el[i].onclick == null ) {
				var s = all_el[i].href;
				var re = /msg_download|ext_backup|need_excel=1/;
				var result = re.test(s) ? 1 : 0;
				if ( result == 0 ) {
					all_el[i].onclick = function() { return LoadingOn() };
				} 
			}
		} else if ( all_el[i].tagName == 'FORM' ) {
			/* form */
			if ( all_el[i].onsubmit == null ) {
				all_el[i].onsubmit = function() { return LoadingOn() };
			}
		} else if ( all_el[i].tagName == 'INPUT' && all_el[i].type == 'submit' ) {
			/* submit */
			if ( all_el[i].name != '' && all_el[i].onclick == null ) {
				all_el[i].onclick = function() { this.form.onsubmit=false; this.form.submit };
			}
		}
	}
}

/* init */
function XVBInit() {
	/* Shadow */
	setShadowAttr();
	/* Image preload */
	var img = new Image();
	img.src = '/xvb/images/loading.gif';
}

/* GA */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-17895037-1']);
_gaq.push(['_trackPageview']);

(function() {
 var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
 ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
 var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
 })();
