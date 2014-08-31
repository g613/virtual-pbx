/*
    <!-- $Id: xvb.js,v 1.74 2014/08/18 07:03:29 gosha Exp $ -->
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
					if ( parent_id == null ) {
						listcolorer( 'd-tbl' );
					} else {
						listcolorer( parent_id );
					}
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

	var max_get_req_len = 1536;

	if ( obj.getAttributeNode('action').value.length + post_data.length < max_get_req_len ) {
		self.xmlHttpReq.open('GET', obj.getAttributeNode('action').value+'?'+post_data, true);
	} else {
		self.xmlHttpReq.open('POST', obj.getAttributeNode('action').value, true);
		self.xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		self.xmlHttpReq.setRequestHeader("Content-length", post_data.length);
		self.xmlHttpReq.setRequestHeader("Connection", "close");
	}

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

	if ( obj.getAttributeNode('action').value.length + post_data.length < max_get_req_len ) {
		self.xmlHttpReq.send();
	} else {
		self.xmlHttpReq.send(post_data);
	}
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
		link.blur();
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
	
	var audio  = document.createElement("audio");
	var canPlayMP3 = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/mpeg") !== "");
	var canPlayWAV = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/x-wav") !== "");
	var canPlayOGG = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/ogg") !== "");

	if ( canPlayOGG ) {
		var wav_file = file.replace("wav?media=mp3;","ogg?");
		wav_file = wav_file.replace("=mp3","=ogg");
		player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td align="center" valign="center" bgcolor="black"><audio tabindex="0" autoplay="autoplay" controls="controls"><source src="'+wav_file+'"></audio></td></tr></table>';
	} else if ( canPlayMP3 ) {
		var wav_file = file;
		player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td align="center" valign="center" bgcolor="black"><audio tabindex="0" autoplay="autoplay" controls="controls"><source src="'+wav_file+'"></audio></td></tr></table>';
	} else {
		var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) ? navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
		if ( plugin ) {
			// flash
			player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td><object type="application/x-shockwave-flash" data="/xvb/ump3player.swf" height="70" width="470"><param name="wmode" VALUE="transparent" /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="movie" value="/xvb/ump3player.swf" /><param name="FlashVars" value="way='+file+'&amp;swf=/xvb/ump3player.swf&amp;w=470&amp;h=70&amp;time_seconds=0&amp;autoplay=1&amp;q=&amp;skin=white&amp;volume=90&amp;comment=Voice messages" /></object></td></tr></table>';
		} else if ( canPlayWAV ) {
			var wav_file = file.replace("wav?media=mp3;","wav?");
			wav_file = wav_file.replace("=mp3","=wav");
			player_data = '<table width="100%" height="100%" class="addon_data" border=0 style="border: solid 1px;"><tr class="list_data"><td align="right" style="border: solid 1px;"><a class="headers" href="#" onclick="return HidePlayer()">close</a></td></tr><tr><td align="center" valign="center" bgcolor="black"><audio tabindex="0" autoplay="autoplay" controls="controls"><source src="'+wav_file+'"></audio></td></tr></table>';
		} else {
			player_data = 'Your browser not supported';
		}
	}

	div_id.innerHTML = player_data;
	div_id.style.display = 'block';

	return false;
}

function HidePlayer() {
	var el=document.getElementById('shadow');
	el.style.visibility='hidden';
	var div_id = document.getElementById('center');
	
	var audio  = document.createElement("audio");
	var canPlayMP3 = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/mpeg") !== "");
	var canPlayWAV = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/x-wav") !== "");
	var canPlayOGG = (typeof audio.canPlayType === "function" && audio.canPlayType("audio/ogg") !== "");

	if ( canPlayMP3 || canPlayWAV || canPlayOGG ) {
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

	max_avg = 0;

	for (i=1;i<g.length;i++) {
			for (i2=1;i2<g[0].length;i2++) {
				if ( i == 1 ) {
					total[i2] = g[i][i2];
				} else {
					total[i2] += g[i][i2];
				}
			}
			if ( g[i][3] > max_avg ) {
				max_avg = g[i][3];
			}
	}

	total[3] = total[2] / total[1];
	max_avg = max_avg/total[3];

	coll_width = parseInt(90/total.length-1);

	output='<table width="95%" border="0" cellspacing="0" cellpadding="0" class="list_data"><tr class="list_data"><th width="10%">'+(g[0][0])+'</th>';
	for (i2=1;i2<g[0].length;i2++) {
		//output+='<th colspan="2">'+ (g[0][i2]) +'</th>';
		output+='<th colspan="2" width="'+coll_width+'%">'+g[0][i2]+'</th>';
	}
	output+='</tr><tr><td>&nbsp;</td></tr>';

	for (i=1;i<g.length;i++){
		output+='<tr class="nocolor"><td align="right"><b>'+g[i][0]+'</b>&nbsp;</td>';
		for (i2=1;i2<g[0].length;i2++) {
			if ( total[i2] > 0 ) {
				calpercentage=Math.round(parseFloat(g[i][i2]*100/total[i2]) * Math.pow(10, 2)) / Math.pow(10, 2)
			} else {
				calpercentage = 0;
			}
			if( i2 == 3 ) {
				calwidth=Math.round(gwidth*(calpercentage/(100*max_avg)));
			} else {
				calwidth=Math.round(gwidth*(calpercentage/100));
			}
			output+='<td align="right">&nbsp;&nbsp;'+
				Math.round(parseFloat(g[i][i2]) * Math.pow(10, 2)) / Math.pow(10, 2)
			+'&nbsp;&nbsp;</td><td><img src="'+graphimage+'" width="'+calwidth+'" height="10"> '+calpercentage+'%</td>';
		}
		output+='</tr>';
	}

	output+='<tr><td>&nbsp;</td></tr><tr><td align="right"><b>=</b></td>';

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
				} else {
					all_el[i].onclick = function() { this.blur(); return true };
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
				all_el[i].onclick = function() { this.blur(); this.form.onsubmit=false; this.form.submit };
			}
		}
	}
}

/* cdr filters */
function cdrfilters( element_id, col_num ) {
	/* fiters 
	var re = /FILE=(\d+):(\w+\.(wav|ul|al|ulaw|alaw|g722|gsm|wav16))/g;
	*/
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
				var new_str = '<a title="'+dateArray[6]+': '+ dtmf_str[2] +'" href="#" onclick=\'dtmf_history_win("'+out_str+'");return false\'>$1DTMF</a>';
				new_str = data.replace(re2, new_str);
				td_obj[col_num].innerHTML = new_str;
			} else {
				// FILE pattern
				if ( download_file_url.length > 0 ) {
					var new_str = data.replace(re, download_file_url);
					if ( data != new_str ) {
						td_obj[col_num].innerHTML = new_str;
					}
				}
				// CALLID pattern ( Callback / AlarmClock )
				if ( callback_cdr_url.length > 0 ) {
					new_str = data.replace(re3, callback_cdr_url);
					if ( data != new_str ) {
						td_obj[col_num].innerHTML = new_str;
					}
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

/* click2call_win */
function click2call_win( server, key, ac, lang ) {
	var ScreenWidth=window.screen.width;
	placementx=ScreenWidth/2-220;
	placementy=200;
	WinPop=window.open("","click2call","width=450,height=200,toolbar=no,location=no,directories=no,status=no,scrollbars=yes,menubar=no,resizable=yes,left="+placementx+",top="+placementy);
	WinPop.document.write('<html>\n<head><title>Click2Call - XVB VirtualPBX</title>\n</head>\n<body><center><form method="post" action="'+server+'/c2c"><input type="hidden" value="'+key+'" name="key"><input type="hidden" value="'+ac+'" name="ac">');
	if ( lang == 'ru' ) {
		WinPop.document.write('<h2>Заказ звонка</h2><input type="text" size="25" name="ph" placeholder="введите Ваш номер телефона"><br/><br/><input value="заказать звонок" type="submit"><input type="hidden" name="message" value="<center>Запрос обработан. Ожидайте звонка.</center>">');
	} else {
		WinPop.document.write('<h2>Order a Call</h2><input type="text" size="25" name="ph" placeholder="enter your phone here"><br/><br/><input value="order a call" type="submit"><input type="hidden" name="message" value="<center>Please wait a call.</center>">');
	}
	WinPop.document.write('</form></body></html>');
	WinPop.document.close();
}

/* webfax_win */
function webfax_win( server, key, ac, lang, uniq ) {
	var ScreenWidth=window.screen.width;
	placementx=ScreenWidth/2-320;
	placementy=200;
	WinPop=window.open("","webfax","width=640,height=200,toolbar=no,location=no,directories=no,status=no,scrollbars=yes,menubar=no,resizable=yes,left="+placementx+",top="+placementy);
	WinPop.document.write('<html>\n<head><title>WebFax - XVB VirtualPBX</title>\n</head>\n<body><center><form method="post" action="'+server+'/c2c"><input type="hidden" value="'+key+'" name="key"><input type="hidden" value="'+ac+'" name="ac">');
	if ( lang == 'ru' ) {
		WinPop.document.write('<h2>Отправка факса</h2><input type="text" size="25" name="ph" placeholder="введите номер факса"><br/><br/><input value="отправить факс" type="submit"><input type="hidden" name="message" value="<center>Запрос обработан. Ожидайте отправки факса.<br><a href=\''+server+'/ui?action=act_list&call_id=__CALLID__&uniq='+uniq+'\'>Для проверки статуса перейдите по этой ссылке</a></center>">');
	} else {
		WinPop.document.write('<h2>Send Fax</h2><input type="text" size="25" name="ph" placeholder="enter fax number here"><br/><br/><input value="send fax" type="submit"><input type="hidden" name="message" value="<center>Please wait. .<br><a href=\''+server+'/ui?action=act_list&call_id=__CALLID__&uniq='+uniq+'\'>Click here to check status</a></center>">');
	}
	WinPop.document.write('</form></body></html>');
	WinPop.document.close();
}

/* click2call code */
function click2call_code( server, key, ac, lang ) {
	var ScreenWidth=window.screen.width;
	placementx=ScreenWidth/2-220;
	placementy=200;
	WinPop=window.open("","click2callCode","width=500,height=300,toolbar=no, location=no,directories=no,status=no,scrollbars=yes, menubar=no,resizable=yes,left="+placementx+",top="+placementy);

	WinPop.document.write('<html><title>Click2Call - code</title><body><p><small>&lt;script language="JavaScript"&gt;function click2call_win(){var ScreenWidth=window.screen.width; placementx=ScreenWidth/2-220; placementy=200;WinPop=window.open("","click2call","width=450,height=200, toolbar=no,location=no,directories=no,status=no, scrollbars=yes,menubar=no,resizable=yes,left="+placementx+",top="+placementy); WinPop.document.write(\'&lt;html&gt;&lt;head&gt;&lt;title&gt;Click2Call - XVB VirtualPBX&lt;/title&gt;&lt;/head&gt;&lt;body&gt;&lt;center&gt;&lt;form method="post" action="'+server+'/c2c"&gt;&lt;input type="hidden" value="'+key+'" name="key"&gt;&lt;input type="hidden" value="'+ac+'" name="ac"&gt;\');');
	if ( lang == 'ru' ) {
		WinPop.document.write('WinPop.document.write(\'&lt;h2&gt;Заказ звонка&lt;/h2&gt;&lt;input type="text" size="25" name="ph" placeholder="введите Ваш номер телефона"&gt;&lt;br/&gt;&lt;br/&gt;&lt;input value="заказать звонок" type="submit"&gt;&lt;input type="hidden" name="message" value="&lt;center&gt;Запрос обработан. Ожидайте звонка.&lt;/center&gt;"&gt;\');');
	} else {
		WinPop.document.write('WinPop.document.write(\'&lt;h2&gt;Order a Call&lt;/h2&gt;&lt;input type="text" size="25" name="ph" placeholder="enter your phone here"&gt;&lt;br/&gt;&lt;br/&gt;&lt;input value="order a call" type="submit"&gt;&lt;input type="hidden" name="message" value="&lt;center&gt;Please wait a call.&lt;/center&gt;"&gt;\');');
	}
	WinPop.document.write('WinPop.document.write(\'&lt;/form&gt;&lt;/body&gt;&lt;/html&gt;\');WinPop.document.close();}&lt;/script&gt;&lt;a title="click2call" href="#" onclick="click2call_win()"&gt;&lt;img border="0" src="https://virtual-pbx.googlecode.com/files/callme.gif" alt="callme" /&gt;&lt;/a&gt;</small></p></body></html>');
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
		if ( el[i].className == 'nocolor' || el[i].className == 'backlight' ) {
			if ( ind % 2 == 1 ) {
				el[i].className = 'backlight';
			} else {
				el[i].className = 'nocolor';
			}
			ind++;
		}
	}
}

/* dropdown creaters */
function exten_dropdown( prefix ) {
	document.write(prefix);
	for( var i=0, l=e_menu.length; i<l; ++i ) {
		var ext_num = e_menu[i];
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
	document.write('<select onchange=\'exten_dropdown2_hook(this.value,"'+ select_name +'")\' name="'+ select_name +'-DD">' + prefix);
	for( var i=0, l=e_menu.length; i<l; ++i ) {
		var ext_num = e_menu[i];
		/* by Ext Name */
		if ( select_name == 'NEXTEXTENSION' || ( ext_num != 'hangup' && ext_num != 'back' && ext_num != 'repeat' ) ) {
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
	}
	document.write('</select>');
	document.getElementsByName(select_name)[0].className = 'display_none';
}
function exten_dropdown2_hook( value, select_name ) {
	if ( value == '***' ) {
		document.getElementsByName(select_name+'-DD')[0].className = 'display_none';
		document.getElementsByName(select_name)[0].className = 'display_yes';
	} else {
		document.getElementsByName(select_name)[0].value = value;
	}
}
/* vb edit icon */
function exten_icon( extension, uniq, title ) {
	/* edit icon */
	if ( e_list[extension] != null && e_list[extension][0] != null ) {
		document.write("<a href='?action=vb_view&id="+ e_list[extension][0] +"&uniq="+ uniq +" ' title='"+ title +"'><img border='0' src='/xvb/images/vb_edit.png' alt='"+ title +"' /></a>&nbsp;");
	}
}
/* vb stat icon */
function stat_icon( extension, uniq, act_type, title ) {
	/* edit icon */
	if ( e_list[extension] != null && e_list[extension][0] != null ) {
		document.write("<a href='?action=ext_stat&act_type="+ act_type +"&id="+ e_list[extension][0] +"&uniq="+ uniq +" ' title='"+ title +"'><img border='0' src='/xvb/images/information-button.png' alt='"+ title +"' /></a>&nbsp;&nbsp;");
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

	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = id.fromuser.disabled = 0;

	var rc = checkChanges( id );

	if ( rc == false ) {
		id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = id.fromuser.disabled = mode;
	} else {
		id.tmpl.disabled = 'disabled';
	}
	return rc;
}
function peers_hide( id ) {

	id.domain.value = id.port.value = id.domain.value = '';

	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = id.fromuser.disabled = 0;

	if ( id.tmpl.value == '.' ) {
		mode = 0;
		id.host.value='';
		id.username.focus();
		id.host.focus();
	} else {
		mode = 'disabled';
		id.host.value=id.tmpl.value;
		id.username.focus();
		id.DESCRIPTION.value=id.tmpl.options[ id.tmpl.selectedIndex ].text;
	}
	id.host.disabled = id.port.disabled = id.domain.disabled = id.dtmfmode.disabled = id.proto.disabled = id.fromuser.disabled = mode;
}

/* Extended stst */
function ExtStatdrawChart1(chart_param,title,title2) {
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
		data_prc.addColumn('string', title2[0]);
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
		}
		data_prc.addColumn('number', title2[1]);
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

function ExtStatdrawChart2(chart_param,subparam,divname,title,title2) {
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
		data_prc.addColumn('string', title2[0]);
		for ( var key2 in all_column ) {
			data.addColumn('number', all_column[key2]);
		}
		data_prc.addColumn('number', title2[1]);
		
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

/* Time Periods */
function getTimePeriod(lang,period) {
	var group_by = '';

	if ( lang == 'ru' ) {
		if ( period == '%Y-%m-%d' ) {
			period = 'день';
			group_by = 'd';
		} else if ( period == '%w - %W' ) {
			period = 'день недели';
			group_by = 'dw';
		} else if ( period == '%d' ) {
			period = 'день месяца';
			group_by = 'dm';
		} else if ( period == '%V' ) {
			period = 'неделя';
			group_by = 'w';
		} else if ( period == '%Y-%m' ) {
			period = 'месяц';
			group_by = 'm';
		} else if ( period == '%Y' ) {
			period = 'год';
			group_by = 'y';
		} else if ( period == '%H' ) {
			period = 'час дня';
			group_by = 'hd';
		} else if ( period == '%Y-%m-%d %H' ) {
			period = 'час';
			group_by = 'h';
		} else if ( period == '%Y-%m-%d %H:%i' ) {
			period = 'минута';
			group_by = 'min';
		} else if ( period == 'CALLED_ID' ) {
			period = 'номер назначения';
			group_by = 'did';
		} else if ( period == 'CALLER_ID' ) {
			period = 'номер звонящего';
			group_by = 'cid';
		} else if ( period == 'CALL_TYPE' ) {
			period = 'тип звонка';
			group_by = 'ct';
		} else {
			period = 'группировать по';
		}
	} else {
		if ( period == '%Y-%m-%d' ) {
			period = 'day';
			group_by = 'd';
		} else if ( period == '%w - %W' ) {
			period = 'day of week';
			group_by = 'dw';
		} else if ( period == '%d' ) {
			period = 'day of month';
			group_by = 'dm';
		} else if ( period == '%V' ) {
			period = 'week';
			group_by = 'w';
		} else if ( period == '%Y-%m' ) {
			period = 'month';
			group_by = 'm';
		} else if ( period == '%Y' ) {
			period = 'year';
			group_by = 'y';
		} else if ( period == '%H' ) {
			period = 'hour of day';
			group_by = 'hd';
		} else if ( period == '%Y-%m-%d %H' ) {
			period = 'hour';
			group_by = 'h';
		} else if ( period == '%Y-%m-%d %H:%i' ) {
			period = 'minute';
			group_by = 'min';
		} else if ( period == 'CALLED_ID' ) {
			period = 'DID';
			group_by = 'did';
		} else if ( period == 'CALLER_ID' ) {
			period = 'callerID';
			group_by = 'cid';
		} else if ( period == 'CALL_TYPE' ) {
			period = 'call type';
			group_by = 'ct';
		} else {
			period = 'group by';
		}
	}

	return { period:period, group_by:group_by };
}

/* Ajax row add 
function xmlhttpAdd(obj,table_id,data_id,url) {
	// need ADD
	var needUpdate = checkChanges(obj,1);
	if ( needUpdate == false ) {
		return needUpdate;
	}

	// ajax only for exists data;
	var table;
	if ( table_id == null ) {
		table = document.getElementById('d-tbl');
	} else {
		table = document.getElementById(table_id);
	}
	var tr = document.getElementById(data_id);
	var new_index = tr.rowIndex;
	var row_el = document.getElementById(table_id).getElementsByTagName('tr');
	if ( row_el[new_index-1].className != 'nocolor' && row_el[new_index-1].className != 'backlight' ) {
		needUpdate = true;
	} else {
		needUpdate = false;
	}
	if ( needUpdate == true ) {
		return needUpdate;
	}

	// Shaddow
	LoadingOn();

	// build url
	var post_url = '/ui?force2x=1';

	for( i=0; i < obj.elements.length; i++ ) {
		if ( obj.elements[i].type == 'checkbox' || obj.elements[i].type == 'radio' ) {
			if ( obj.elements[i].checked ) {
				post_url = post_url +'&'+ obj.elements[i].name + '=1';
			}
		} else if ( obj.elements[i].type == 'submit' ) {
			obj.elements[i].blur();
		} else if ( obj.elements[i].type == 'button' ) {
			// NoOP
		} else if ( obj.elements[i].type != 'select-one' ) {
			post_url = post_url +'&'+ obj.elements[i].name + '=' + obj.elements[i].value;
		} else {
			post_url = post_url +'&'+ obj.elements[i].name + '=' + obj.elements[i].options[ obj.elements[i].selectedIndex ].value;
		}
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
	
	self.xmlHttpReq.open('GET', post_url, true);

	self.xmlHttpReq.onreadystatechange = function() {
		if (self.xmlHttpReq.readyState == 4) {
			if ( self.xmlHttpReq.statusText == 'Ok' || self.xmlHttpReq.status == 204 || self.xmlHttpReq.status == 1223 ) {
				var new_row = table.insertRow(new_index);
				new_row.className = 'nocolor';
				new_row.innerHTML = row_el[new_index-1].innerHTML;
				//var el = document.getElementById(data_id).getElementsByTagName('td');
				//for( i=0; i < el.length; i++ ) {
				//	var new_cel = new_row.insertCell(i);
				//	new_cel.innerHTML = el[i].innerHTML;
				//	new_cel.className = 'in_t0';
				//}
				if ( table_id == null ) {
					listcolorer( 'd-tbl' );
				} else {
					listcolorer( table_id );
				}
			} else {
				alert('Add error: '+ self.xmlHttpReq.status +' : '+ self.xmlHttpReq.responseText );
			}
			LoadingOff();
			//document.body.style.cursor='default';
		}
	}
	
	self.xmlHttpReq.send();
	return false;
}
*/

function tz_dropdown( tz_name, def_desc ) {
	var tz_list = new Array(
'Default','Africa/Abidjan','Africa/Accra','Africa/Addis_Ababa','Africa/Algiers','Africa/Asmara','Africa/Asmera','Africa/Bamako','Africa/Bangui','Africa/Banjul','Africa/Bissau','Africa/Blantyre','Africa/Brazzaville','Africa/Bujumbura','Africa/Cairo','Africa/Casablanca','Africa/Ceuta','Africa/Conakry','Africa/Dakar','Africa/Dar_es_Salaam','Africa/Djibouti','Africa/Douala','Africa/El_Aaiun','Africa/Freetown','Africa/Gaborone','Africa/Harare','Africa/Johannesburg','Africa/Kampala','Africa/Khartoum','Africa/Kigali','Africa/Kinshasa','Africa/Lagos','Africa/Libreville','Africa/Lome','Africa/Luanda','Africa/Lubumbashi','Africa/Lusaka','Africa/Malabo','Africa/Maputo','Africa/Maseru','Africa/Mbabane','Africa/Mogadishu','Africa/Monrovia','Africa/Nairobi','Africa/Ndjamena','Africa/Niamey','Africa/Nouakchott','Africa/Ouagadougou','Africa/Porto-Novo','Africa/Sao_Tome','Africa/Timbuktu','Africa/Tripoli','Africa/Tunis','Africa/Windhoek',
'America/Adak','America/Anchorage','America/Anguilla','America/Antigua','America/Araguaina','America/Argentina/Buenos_Aires','America/Argentina/Catamarca','America/Argentina/ComodRivadavia','America/Argentina/Cordoba','America/Argentina/Jujuy','America/Argentina/La_Rioja','America/Argentina/Mendoza','America/Argentina/Rio_Gallegos','America/Argentina/Salta','America/Argentina/San_Juan','America/Argentina/San_Luis','America/Argentina/Tucuman','America/Argentina/Ushuaia','America/Aruba','America/Asuncion','America/Atikokan','America/Atka','America/Bahia','America/Barbados','America/Belem','America/Belize','America/Blanc-Sablon','America/Boa_Vista','America/Bogota','America/Boise','America/Buenos_Aires','America/Cambridge_Bay','America/Campo_Grande','America/Cancun','America/Caracas','America/Catamarca','America/Cayenne','America/Cayman','America/Chicago','America/Chihuahua','America/Coral_Harbour','America/Cordoba','America/Costa_Rica','America/Cuiaba','America/Curacao','America/Danmarkshavn','America/Dawson','America/Dawson_Creek','America/Denver','America/Detroit','America/Dominica','America/Edmonton','America/Eirunepe','America/El_Salvador','America/Ensenada','America/Fortaleza','America/Fort_Wayne','America/Glace_Bay','America/Godthab','America/Goose_Bay','America/Grand_Turk','America/Grenada','America/Guadeloupe','America/Guatemala','America/Guayaquil','America/Guyana','America/Halifax','America/Havana','America/Hermosillo','America/Indiana/Indianapolis','America/Indiana/Knox','America/Indiana/Marengo','America/Indiana/Petersburg','America/Indianapolis','America/Indiana/Tell_City','America/Indiana/Vevay','America/Indiana/Vincennes','America/Indiana/Winamac','America/Inuvik','America/Iqaluit','America/Jamaica','America/Jujuy','America/Juneau','America/Kentucky/Louisville','America/Kentucky/Monticello','America/Knox_IN','America/La_Paz','America/Lima','America/Los_Angeles','America/Louisville','America/Maceio','America/Managua','America/Manaus','America/Marigot','America/Martinique','America/Mazatlan','America/Mendoza','America/Menominee','America/Merida','America/Mexico_City','America/Miquelon','America/Moncton','America/Monterrey','America/Montevideo','America/Montreal','America/Montserrat','America/Nassau','America/New_York','America/Nipigon','America/Nome','America/Noronha','America/North_Dakota/Center','America/North_Dakota/New_Salem','America/Panama','America/Pangnirtung','America/Paramaribo','America/Phoenix','America/Port-au-Prince','America/Porto_Acre','America/Port_of_Spain','America/Porto_Velho','America/Puerto_Rico','America/Rainy_River','America/Rankin_Inlet','America/Recife','America/Regina','America/Resolute','America/Rio_Branco','America/Rosario','America/Santarem','America/Santiago','America/Santo_Domingo','America/Sao_Paulo','America/Scoresbysund','America/Shiprock','America/St_Barthelemy','America/St_Johns','America/St_Kitts','America/St_Lucia','America/St_Thomas','America/St_Vincent','America/Swift_Current','America/Tegucigalpa','America/Thule','America/Thunder_Bay','America/Tijuana','America/Toronto','America/Tortola','America/Vancouver','America/Virgin','America/Whitehorse','America/Winnipeg','America/Yakutat','America/Yellowknife',
'Antarctica/Casey','Antarctica/Davis','Antarctica/DumontDUrville','Antarctica/Mawson','Antarctica/McMurdo','Antarctica/Palmer','Antarctica/Rothera','Antarctica/South_Pole','Antarctica/Syowa','Antarctica/Vostok','Arctic/Longyearbyen',
'Asia/Aden','Asia/Almaty','Asia/Amman','Asia/Anadyr','Asia/Aqtau','Asia/Aqtobe','Asia/Ashgabat','Asia/Ashkhabad','Asia/Baghdad','Asia/Bahrain','Asia/Baku','Asia/Bangkok','Asia/Beirut','Asia/Bishkek','Asia/Brunei','Asia/Calcutta','Asia/Choibalsan','Asia/Chongqing','Asia/Chungking','Asia/Colombo','Asia/Dacca','Asia/Damascus','Asia/Dhaka','Asia/Dili','Asia/Dubai','Asia/Dushanbe','Asia/Gaza','Asia/Harbin','Asia/Ho_Chi_Minh','Asia/Hong_Kong','Asia/Hovd','Asia/Irkutsk','Asia/Istanbul','Asia/Jakarta','Asia/Jayapura','Asia/Jerusalem','Asia/Kabul','Asia/Kamchatka','Asia/Karachi','Asia/Kashgar','Asia/Katmandu','Asia/Kolkata','Asia/Krasnoyarsk','Asia/Kuala_Lumpur','Asia/Kuching','Asia/Kuwait','Asia/Macao','Asia/Macau','Asia/Magadan','Asia/Makassar','Asia/Manila','Asia/Muscat','Asia/Nicosia','Asia/Novosibirsk','Asia/Omsk','Asia/Oral','Asia/Phnom_Penh','Asia/Pontianak','Asia/Pyongyang','Asia/Qatar','Asia/Qyzylorda','Asia/Rangoon','Asia/Riyadh','Asia/Riyadh87','Asia/Riyadh88','Asia/Riyadh89','Asia/Saigon','Asia/Sakhalin','Asia/Samarkand','Asia/Seoul','Asia/Shanghai','Asia/Singapore','Asia/Taipei','Asia/Tashkent','Asia/Tbilisi','Asia/Tehran','Asia/Tel_Aviv','Asia/Thimbu','Asia/Thimphu','Asia/Tokyo','Asia/Ujung_Pandang','Asia/Ulaanbaatar','Asia/Ulan_Bator','Asia/Urumqi','Asia/Vientiane','Asia/Vladivostok','Asia/Yakutsk','Asia/Yekaterinburg','Asia/Yerevan',
'Atlantic/Azores','Atlantic/Bermuda','Atlantic/Canary','Atlantic/Cape_Verde','Atlantic/Faeroe','Atlantic/Faroe','Atlantic/Jan_Mayen','Atlantic/Madeira','Atlantic/Reykjavik','Atlantic/South_Georgia','Atlantic/Stanley','Atlantic/St_Helena',
'Australia/ACT','Australia/Adelaide','Australia/Brisbane','Australia/Broken_Hill','Australia/Canberra','Australia/Currie','Australia/Darwin','Australia/Eucla','Australia/Hobart','Australia/LHI','Australia/Lindeman','Australia/Lord_Howe','Australia/Melbourne','Australia/North','Australia/NSW','Australia/Perth','Australia/Queensland','Australia/South','Australia/Sydney','Australia/Tasmania','Australia/Victoria','Australia/West','Australia/Yancowinna',
'Brazil/Acre','Brazil/DeNoronha','Brazil/East','Brazil/West','Canada/Atlantic','Canada/Central','Canada/Eastern','Canada/East-Saskatchewan','Canada/Mountain','Canada/Newfoundland','Canada/Pacific','Canada/Saskatchewan','Canada/Yukon','CET','Chile/Continental','Chile/EasterIsland','CST6CDT','Cuba','EET','Egypt','Eire','EST','EST5EDT',
'Etc/GMT','Etc/GMT0','Etc/GMT-0','Etc/GMT+0','Etc/GMT-1','Etc/GMT+1','Etc/GMT-10','Etc/GMT+10','Etc/GMT-11','Etc/GMT+11','Etc/GMT-12','Etc/GMT+12','Etc/GMT-13','Etc/GMT-14','Etc/GMT-2','Etc/GMT+2','Etc/GMT-3','Etc/GMT+3','Etc/GMT-4','Etc/GMT+4','Etc/GMT-5','Etc/GMT+5','Etc/GMT-6','Etc/GMT+6','Etc/GMT-7','Etc/GMT+7','Etc/GMT-8','Etc/GMT+8','Etc/GMT-9','Etc/GMT+9','Etc/Greenwich','Etc/UCT','Etc/Universal','Etc/UTC','Etc/Zulu',
'Europe/Amsterdam','Europe/Andorra','Europe/Athens','Europe/Belfast','Europe/Belgrade','Europe/Berlin','Europe/Bratislava','Europe/Brussels','Europe/Bucharest','Europe/Budapest','Europe/Chisinau','Europe/Copenhagen','Europe/Dublin','Europe/Gibraltar','Europe/Guernsey','Europe/Helsinki','Europe/Isle_of_Man','Europe/Istanbul','Europe/Jersey','Europe/Kaliningrad','Europe/Kiev','Europe/Lisbon','Europe/Ljubljana','Europe/London','Europe/Luxembourg','Europe/Madrid','Europe/Malta','Europe/Mariehamn','Europe/Minsk','Europe/Monaco','Europe/Moscow','Europe/Nicosia','Europe/Oslo','Europe/Paris','Europe/Podgorica','Europe/Prague','Europe/Riga','Europe/Rome','Europe/Samara','Europe/San_Marino','Europe/Sarajevo','Europe/Simferopol','Europe/Skopje','Europe/Sofia','Europe/Stockholm','Europe/Tallinn','Europe/Tirane','Europe/Tiraspol','Europe/Uzhgorod','Europe/Vaduz','Europe/Vatican','Europe/Vienna','Europe/Vilnius','Europe/Volgograd','Europe/Warsaw','Europe/Zagreb','Europe/Zaporozhye','Europe/Zurich',
'Factory','GB','GB-Eire','GMT','GMT0','GMT-0','GMT+0','Greenwich','Hongkong','HST','Iceland','Indian/Antananarivo','Indian/Chagos','Indian/Christmas','Indian/Cocos','Indian/Comoro','Indian/Kerguelen','Indian/Mahe','Indian/Maldives','Indian/Mauritius','Indian/Mayotte','Indian/Reunion','Iran','Israel','Jamaica','Japan','Kwajalein','Libya','MET','Mexico/BajaNorte','Mexico/BajaSur','Mexico/General','Mideast/Riyadh87','Mideast/Riyadh88','Mideast/Riyadh89','MST','MST7MDT','Navajo','NZ','NZ-CHAT',
'Pacific/Apia','Pacific/Auckland','Pacific/Chatham','Pacific/Easter','Pacific/Efate','Pacific/Enderbury','Pacific/Fakaofo','Pacific/Fiji','Pacific/Funafuti','Pacific/Galapagos','Pacific/Gambier','Pacific/Guadalcanal','Pacific/Guam','Pacific/Honolulu','Pacific/Johnston','Pacific/Kiritimati','Pacific/Kosrae','Pacific/Kwajalein','Pacific/Majuro','Pacific/Marquesas','Pacific/Midway','Pacific/Nauru','Pacific/Niue','Pacific/Norfolk','Pacific/Noumea','Pacific/Pago_Pago','Pacific/Palau','Pacific/Pitcairn','Pacific/Ponape','Pacific/Port_Moresby','Pacific/Rarotonga','Pacific/Saipan','Pacific/Samoa','Pacific/Tahiti','Pacific/Tarawa','Pacific/Tongatapu','Pacific/Truk','Pacific/Wake','Pacific/Wallis','Pacific/Yap','Poland','Portugal','PRC','PST8PDT',
'ROC','ROK','Singapore','Turkey','UCT','Universal','US/Alaska','US/Aleutian','US/Arizona','US/Central','US/Eastern','US/East-Indiana','US/Hawaii','US/Indiana-Starke','US/Michigan','US/Mountain','US/Pacific','US/Samoa','UTC','WET','W-SU','Zulu'
);

	document.write('<select onchange=\'document.getElementsByName("TZ_NAME")[0].value = this.value\' name="TZ_NAME-DD">');

	if ( tz_name == '' ) {
		document.getElementsByName("TZ_NAME")[0].value = tz_name = 'Default';
	}

	for (var i = 0; i < tz_list.length; i++) {
		document.write('<option value="'+ tz_list[i] +'"');
		if ( tz_list[i] == tz_name ) {
			document.write(' selected ');
		}
		if ( tz_list[i] != 'Default' ) {
			document.write( '>'+ tz_list[i] +'</option>' );
		} else {
			document.write( '>'+ def_desc +'</option>' );
		}
	}

	document.write('</select>');
	document.getElementsByName('TZ_NAME')[0].className = 'display_none';
}

function checkfr(newurl) {
	if (window==window.top) {
		var url = document.URL.split('?');
		document.location.href=url[0]+'?action=start&'+newurl;
	}
}

function breakout_of_frame() {
	if (top.location != location) {
		top.location.href = document.location.href ;
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
