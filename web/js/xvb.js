/*
    <!-- $Id: xvb.js,v 1.40 2011-08-23 17:54:28 gosha Exp $ -->
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
	var change_flag = checkChanges( obj.form, 1 );
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

	var needUpdate = checkChanges(obj,1);
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

function checkChanges( obj, skip_shaddow ) {
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

	if ( change_flag == true ) {
		if(typeof(skip_shaddow) == 'undefined') {
			LoadingOn();
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
	var player_data = '';
	if (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {
		// flash
		player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td><object type="application/x-shockwave-flash" data="/xvb/js/flowplayer/ump3player_500x70.swf" height="70" width="470"><param name="wmode" VALUE="transparent" /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="movie" value="/xvb/js/flowplayer/ump3player_500x70.swf" /><param name="FlashVars" value="way='+file+'&amp;swf=/xvb/js/flowplayer/ump3player_500x70.swf&amp;w=470&amp;h=70&amp;time_seconds=0&amp;autoplay=1&amp;q=&amp;skin=white&amp;volume=90&amp;comment=Voice messages" /></object></td></tr></table>';
	} else {
		// html5: fixme - codec support
		var wav_file = '';
		if (navigator.userAgent.indexOf("Firefox")!=-1) {
			wav_file = file.replace("wav?media=mp3;","wav?");
			wav_file = wav_file.replace("=mp3","=wav");
		} else {
			wav_file = file;
		}
		player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td align="center" valign="center" bgcolor="black"><audio tabindex="0" autoplay="autoplay" controls="controls"><source src="'+wav_file+'"></audio></td></tr></table>';
	}
	div_id.innerHTML = player_data;
	div_id.style.display = 'block';

	return false;
}

function HidePlayer() {
	var el=document.getElementById('shadow');
	el.style.visibility='hidden';
	var div_id = document.getElementById('center');
	if (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {
	} else {
		div_id.innerHTML = '<audio tabindex="0" autoplay="autoplay" controls="controls"></audio>';
	}
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
	document.write("<input type='image' title='"+alt+"' name='"+alt+"' alt='"+alt+"' src='/xvb/images/save.png'>&nbsp;");
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

	output='<table width="95%" border="0" cellspacing="0" cellpadding="0" class="list_data"><tr class="list_data"><th width="10%">'+(g[0][0])+'</th>';
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

/* cdr filters */
function cdrfilters( element_id, col_num ) {
	/* fiters */
	var re = /FILE=(\d+):(\w+\.\w+)/g;
	var re2 = /(^|, )DTMF=([^,]*)/;
	var re3 = /(^|, )CALLID=([^,]*)/g;

	/* variables */
	var url = download_file_url;
	var url3 = callback_cdr_url;

	var callTimeOffset = 0;

	if(typeof(js_date_str) !== 'undefined') {
		var dateArray = js_date_str.split('-');
		var callTime = new Date();
		
		callTime.setYear(dateArray[0]);
		callTime.setMonth(dateArray[1]-1);
		callTime.setDate(dateArray[2]);
		callTime.setHours(dateArray[3]);
		callTime.setMinutes(dateArray[4]);
		callTime.setSeconds(dateArray[5]);

		callTimeOffset = callTime.getTime();
	}

	var el = document.getElementById(element_id).getElementsByTagName('tr');
	for( i=0; i < el.length; i++ ) {
		var td_obj = el[i].getElementsByTagName('td');
		if ( td_obj[col_num] != null ) {
			var data = td_obj[col_num].innerHTML;
			if ( callTimeOffset > 0 && re2.test(data) ) {
				// DTMF pattern
				var dtmf_str = re2.exec(data);
				var dtmf_chunks = dtmf_str[2].split(' ');
				var out_str = '';
				for( i2=0; i2 < dtmf_chunks.length; i2++ ) {
					var user_input_array = dtmf_chunks[i2].split('w');
					// calculate time
					var hours = callTime.getHours();
					var minutes = callTime.getMinutes();
					var seconds = callTime.getSeconds();
					if ( hours < 10 )
						hours = "0"+hours;
					if ( minutes < 10 )
						minutes = "0"+minutes;
					if ( seconds < 10 )
						seconds = "0"+seconds;
					if ( user_input_array[0].length > 0 ) {
						out_str = out_str + hours  +':'+ minutes +':'+ seconds +'  -  [ '+ user_input_array[0] +' ]<br />';
					}				
					if ( user_input_array[1] != null ) {
						callTimeOffset = callTimeOffset+(1000*user_input_array[1]);
						callTime.setTime(callTimeOffset);
					}
				}
				var new_str = '<a title="'+dateArray[6]+'" href="#" onclick=\'dtmf_history_win("'+out_str+'");return false\'>$1DTMF</a>';
				new_str = data.replace(re2, new_str);
				td_obj[col_num].innerHTML = new_str;
			} else {
				// FILE pattern
				var new_str = data.replace(re, download_file_url);
				if ( data != new_str ) {
					td_obj[col_num].innerHTML = new_str;
				}
				// CALLID pattern ( Callback / AlarmClock )
				new_str = data.replace(re3, callback_cdr_url);
				if ( data != new_str ) {
					td_obj[col_num].innerHTML = new_str;
				}
			}
		}
	}
}

/* dtmf_history_win */
function dtmf_history_win( data ) {
	var ScreenWidth=window.screen.width;
	//var ScreenHeight=window.screen.height;
	placementx=ScreenWidth-400;
	placementy=200;
	WinPop=window.open("","dtmf_history_win","width=300,height=300,toolbar=no,location=no,directories=no,status=no,scrollbars=yes,menubar=no,resizable=yes,left="+placementx+",top="+placementy);
	WinPop.document.write('<html>\n<head><title>DTMF History</title>\n</head>\n<body>'+data+'</body></html>');
	WinPop.document.close();
}

/* ext_list_build */
function ext_list_build( element_id ) {
	var el = document.getElementById(element_id).getElementsByTagName('tr');
	
	for( i=0; i < el.length; i++ ) {
		var td_obj = el[i].getElementsByTagName('td');
		
		if ( td_obj[0] != null ) {
			// tree-colorer
			var data = td_obj[0].innerHTML;
			var new_str = data.replace( /(.*\*)?([^*]+)$/, "<span class='ext_preffix'>$1</span>$2");
			if ( data != new_str ) {
				td_obj[0].innerHTML = new_str;
			}
		}
		for( i2=3; i2 < 8; i2++ ) {
			// Yes /  No
			if ( td_obj[i2] != null ) {
				var data = td_obj[i2].innerHTML;
				var new_str = '-';
				if ( data == 1 ) {
					new_str = "<img border='0' src='/xvb/images/check.png' alt='*' />"
				}
				td_obj[i2].innerHTML = new_str;
			}
		}
	}
}

/* list colorer */
function listcolorer( element_id ) {
	var el = document.getElementById(element_id).getElementsByTagName('tr');
	var ind = 0;
	for( i=0; i < el.length; i++ ) {
		if ( el[i].className == 'nocolor' ) {
			if ( ind % 2 == 1 ) {
				el[i].className = 'backlight';
			}
			ind++;
		}
	}
}

/* dropdown creaters */
function exten_dropdown( prefix ) {
	document.write(prefix);
	for ( ext_num in e_list ) {
		/* by ID */
		if ( e_list[ext_num][0] != null ) {
			document.write('<option value="'+ e_list[ext_num][0] +'">' + ext_num + ' - ');
			if ( e_list[ext_num][2].length > 0 ) {
				document.write( e_list[ext_num][2] );
			} else {
				document.write( e_list[ext_num][1] );
			}
			document.write('</option>');
		}
	}
}
function exten_dropdown2( select_name, extension, prefix ) {
	document.write('<select name="'+ select_name +'">' + prefix);
	for ( ext_num in e_list ) {
		/* by Ext Name */
		document.write('<option value="'+ ext_num +'"');
		if ( ext_num == extension ) {
			document.write(' selected ');
		}
		document.write( '>' + ext_num + ' - ');
		if ( e_list[ext_num][2].length > 0 ) {
			document.write( e_list[ext_num][2] );
		} else {
			document.write( e_list[ext_num][1] );
		}
		document.write('</option>');
	}
	document.write('</select>');
}
/* vb edit icon */
function exten_icon( extension, uniq, title ) {
	/* edit icon */
	if ( e_list[extension] != null && e_list[extension][0] != null ) {
		document.write("<a href='?action=vb_view&id="+ e_list[extension][0] +"&uniq="+ uniq +" ' title='"+ title +"'><img border='0' src='/xvb/images/vb_edit.png' alt='"+ title +"' /></a>&nbsp;");
	}
}
/* peers tmpl functions */
function peers_list_init(obj,mode) {
	if ( mode == 1 ) {
		obj.form.host.size=5;
		obj.form.host.style.visibility='hidden';
		for ( ind = 0; ind < p_list.length; ind++ ) {
			obj.options[ind].text = p_list[ind][1];
		}
	} else {
		for ( ind = 0; ind < p_list.length; ind++ ) {
			obj.options[ind].text = '';
		}
		obj.form.host.size=19;
		obj.form.host.style.visibility='visible';
	}
	obj.selectedIndex = 0;
}
function peers_unhide( id ) {
	var mode = id.host.disabled;

	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = 0;

	var rc = checkChanges( id );

	if ( rc == false ) {
		id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = mode;
	} else {
		id.tmpl.disabled = 'disabled';
	}
	return rc;
}
function peers_hide( id ) {

	id.domain.value = id.port.value = id.domain.value = '';

	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = 0;

	if ( id.tmpl.value == '.' ) {
		mode = 0;
		id.host.value='';
	} else {
		mode = 'disabled';
		id.host.value=id.tmpl.value;
		id.DESCRIPTION.value=id.tmpl.options[ id.tmpl.selectedIndex ].text;
	}
	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = mode;

	id.username.focus();
}

/* Extended stst */
function ExtStatdrawChart1(chart_param,title) {
	var data = new google.visualization.DataTable();
	var data_prc = new google.visualization.DataTable();

	data.addColumn('string', 'Data');
	
	var all_column_keys = [];
	var all_column = new Array();
	var i = 0;
	for ( key in js_data['DATA'][chart_param] ) {
		for ( key2 in js_data['DATA'][chart_param][key] ) {
			if ( all_column_keys[key2] == null ) {
				all_column_keys[key2] = 1;
				all_column.push(key2);
			}
		}
	}
	all_column.sort();
	i = 0;
	var all_rows = new Array();
	for ( var key in js_data['DATA'][chart_param] ) {
		all_rows.push(key);
	}
	all_rows.sort();
	
	if ( js_data['DATA_EXISTS'] == 1 ) {
		data_prc.addColumn('string', 'Name');
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
		}
		data_prc.addColumn('number', 'Value');
		for ( var row_key in all_rows ) {
			var key = all_rows[row_key];
			for ( var key2 in all_column ) {
				data.addRows(1);
				data_prc.addRows(1);
				data.setValue(i, 0, all_column[key2] );
				data_prc.setValue(i, 0, all_column[key2] );
				var sum = 0;
				if ( js_data['DATA'][chart_param][key][all_column[key2]] != null ) {
					sum = js_data['DATA'][chart_param][key][all_column[key2]];
				}
				data.setValue(i, 1, sum );
				data_prc.setValue(i, 1, sum );
				i++;
			}
			var chart = new google.visualization.PieChart(document.getElementById('chart_'+chart_param));
			chart.draw(data, { width: 650, height: 350, min: 0, title: title + '  ( '+key+' )', is3D: true });
			var chart_prc = new google.visualization.Table(document.getElementById('chart_'+chart_param+'_PRC'));
			chart_prc.draw(data_prc, { showRowNumber: true });
			return;
		}
	} else {
		data_prc.addColumn('string', 'Data_prc');
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
			data_prc.addColumn('number', all_column[key2]);
		}
		for ( var row_key in all_rows ) {
			var key = all_rows[row_key];
			data.addRows(1);
			data_prc.addRows(1);

			data.setValue(i, 0, key );
			data_prc.setValue(i, 0, key );

			var i2 = 1;
			var prc_sum = 0;

			for ( var key2 in all_column ) {
				var sum = 0;
				if ( js_data['DATA'][chart_param][key][all_column[key2]] != null ) {
					sum = js_data['DATA'][chart_param][key][all_column[key2]];
				}
				data.setValue(i, i2, sum );
				prc_sum += sum;
				i2++;
			}

			i2 = 1;
			if ( prc_sum < 1 ) {
				prc_sum = 1;
			}
			for ( var key2 in all_column ) {
				data_prc.setValue(i, i2, js_data['DATA'][chart_param][key][all_column[key2]]/prc_sum*100 );
				i2++;
			}
			i++;
		}

		var chart = new google.visualization.ImageBarChart(document.getElementById('chart_'+chart_param));
		chart.draw(data, { min: 0, title: title });

		var chart_prc = new google.visualization.ImageBarChart(document.getElementById('chart_'+chart_param+'_PRC'));
		chart_prc.draw(data_prc, { min: 0, title: '% '+title });
	}
}

function ExtStatdrawChart2(chart_param,subparam,divname,title) {
	var data = new google.visualization.DataTable();
	var data_prc = new google.visualization.DataTable();

	data.addColumn('string', 'Data');

	var all_column_keys = [];
	var all_column = new Array();
	var i = 0;
	var all_rows = new Array();

	for ( var key in js_data['DATA'][chart_param] ) {
		all_rows.push(key);
	}
	all_rows.sort();
	for ( var row_key in all_rows ) {
		var key = all_rows[row_key];
		for ( var key3 in subparam ) {
			for ( var key2 in js_data['DATA'][chart_param][key][subparam[key3]] ) {
				if ( all_column_keys[key2] == null ) {
					all_column_keys[key2] = 1;
					all_column.push(key2);
				}
			}
		}
	}
	all_column.sort();
	i = 0;

	if ( js_data['DATA_EXISTS'] == 1 ) {
		data_prc.addColumn('string', 'Name');
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
		}
		data_prc.addColumn('number', 'Value');
		
		for ( var row_key in all_rows ) {
			var key = all_rows[row_key];
			for ( var key2 in all_column ) {
				data.addRows(1);
				data_prc.addRows(1);
				data.setValue(i, 0, all_column[key2] );
				data_prc.setValue(i, 0, all_column[key2] );
				var sum = 0;
				for ( var key3 in subparam ) {
					if ( js_data['DATA'][chart_param][key][subparam[key3]] != null ) {
						if ( js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]] != null ) {
							sum += js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]];
						}
					}
				}
				data.setValue(i, 1, sum );
				data_prc.setValue(i, 1, sum );
				i++;
			}
			var chart = new google.visualization.PieChart(document.getElementById('chart_'+chart_param+'_'+divname));
			chart.draw(data, { width: 650, height: 350, min: 0, title: title + '  ( '+key+' )', is3D: true });
			var chart_prc = new google.visualization.Table(document.getElementById('chart_'+chart_param+'_'+divname+'_PRC'));
			chart_prc.draw(data_prc, { showRowNumber: true });
			return;
		}
	} else {
		data_prc.addColumn('string', 'Data_prc');
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
			data_prc.addColumn('number', all_column[key2]);
		}
		for ( var row_key in all_rows ) {
			var key = all_rows[row_key];
			data.addRows(1);
			data_prc.addRows(1);

			data.setValue(i, 0, key );
			data_prc.setValue(i, 0, key );
			var i2 = 1;
			var prc_sum = 0;
			for ( var key2 in all_column ) {
				var sum = 0;
				for ( var key3 in subparam ) {
					if ( js_data['DATA'][chart_param][key][subparam[key3]] != null ) {
						if ( js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]] != null ) {
							sum += js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]];
						}
					}
				}
				data.setValue(i, i2, sum );
				prc_sum += sum;
				i2++;
			}
			i2 = 1;
			if ( prc_sum < 1 ) {
				prc_sum = 1;
			}
			for ( var key2 in all_column ) {
				var sum = 0;
				for ( var key3 in subparam ) {
					if ( js_data['DATA'][chart_param][key][subparam[key3]] != null ) {
						if ( js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]] != null ) {
							sum += js_data['DATA'][chart_param][key][subparam[key3]][all_column[key2]];
						}
					}
				}
				data_prc.setValue(i, i2, sum/prc_sum*100 );
				i2++;
			}
			i++;
		}

		var chart = new google.visualization.ImageBarChart(document.getElementById('chart_'+chart_param+'_'+divname));
		chart.draw(data, { min: 0, title: title });

		var chart_prc = new google.visualization.ImageBarChart(document.getElementById('chart_'+chart_param+'_'+divname+'_PRC'));
		chart_prc.draw(data_prc, { min: 0, title: '% '+title });
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
