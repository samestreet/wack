/* Global Variables
	* wack: platform main variable
	* login_step: used to know which login step the user is (username=1, password=2)
	* wack_temp_user: used during login to store user information (temporary - id and name)
	*/
var wack;
var login_step = 1;
var wack_temp_user = {
	id: 0,
	name: '',
	customer: 0
};

/* formatMoney
	* Returns currency formatted value from float vars
	* Parameters:
	* decPlaces: decimal places number
	* thouSeparator: thousands separator
	* decSeparator: decimal separator
	*/
Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

function addZero(n) {
	if(n <= 9) return("0" + n);
	return(n);
}

function dateConvert(dt, format) {
	var d = new Date(dt);
	var r = format;
	r = r.replace(/\%d/g,addZero(d.getDate()));
	r = r.replace(/\%\m/g,d.getMonth() + 1);
	r = r.replace(/\%\Y/g,d.getFullYear());
	r = r.replace(/\%\H/g,addZero(d.getHours()));
	r = r.replace(/\%\i/g,addZero(d.getMinutes()));
	r = r.replace(/\%\s/g,addZero(d.getSeconds()));
	return(r);
}

/* jQuery bounce
	* Makes any object "bounce"
	*/
$.fn.bounce = function() {
	$(this).css('position','relative');
	$(this).animate({
		top: '-=10px'
	},125, function() {
		$(this).animate({
			top: '+=10px'
		},125);
	});
};

/* getMultiScripts
	* Loads an array of scripts (js files) and executes callback using jQuery when
	*/
$.getMultiScripts = function(arr, path) {
	var _arr = $.map(arr, function(src) {
		return $.getScript((path || "") + src);
	});
	_arr.push($.Deferred(function(deferred) {
		$( deferred.resolve() );
	}));
	return( $.when.apply($, _arr) );
}

/* queryObj
	* Retrieve URL parameters like ?page=main&id=1 
	*/
function queryObj() {
    var result = {}, keyValuePairs = location.search.slice(1).split("&");
    keyValuePairs.forEach(function(keyValuePair) {
        keyValuePair = keyValuePair.split('=');
        result[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]) || '';
    });
    return result;
}

/* animationWack
	* Animates W,A,C,K during loading (following loading percentage)
	*/
function animationWack(percent) {
	if( percent >= 20 && percent < 40 ) {
		$('span#w').animate({
			opacity: 1
		},400,function() {
			$(this).animate({
				opacity: 0
			},300);
		});
	}
	if( percent >= 40 && percent < 60 ) {
		$('span#a').animate({
			opacity: 1
		},400,function() {
			$(this).animate({
				opacity: 0
			},300);
		});
	}
	if( percent >= 60 && percent < 80 ) {
		$('span#c').animate({
			opacity: 1
		},400,function() {
			$(this).animate({
				opacity: 0
			},300);
		});
	}
	if( percent >= 80 ) {
		$('span#k').animate({
			opacity: 1
		},400,function() {
			$(this).animate({
				opacity: 0
			},300);
		});
	}
}

/* animationLoading 
	* Reads loading percentage and calls wackAnimation (to display W,A,C,K and manage loading bar)
	*/
function animationLoading(callback) {
	$('#footerLoader').animate({ 
		width: '100%' 
	},{
		duration: 1000,
		step: function(percent) {
			animationWack(percent);
		},
		done: function() {
			callback();
		}
	});
}

/* clearMenu
	* Clear all active menu items (remove 'active' class)
	*/
function clearMenu() {
	$('.leftMenu').find('li').each(function() {
		$(this).removeClass('active');
	});
}
var clear_menu = clearMenu;

/* initializeDesktop
	* Displays desktop screen reading library/kernel/resources/desktop.resource file
	*/
function initializeDesktop() {
	$.ajax({
		url: './library/kernel/resources/desktop.resource?dt=' + (new Date().getTime()),
		success: function(data) {
			$.ajax({
				url: './application/main.module?dt=' + (new Date().getTime()),
				success: function(appData) {
					var r = eval('new WackApplication(' + appData + ')');
					wack.Application = r;
					document.title = wack.Application._name + ' :: W.A.C.K Pro';

					$('#app').html(data);
					
					/* Build Menu */
					for(var i in wack.Application._menu.items) {
						var menu = wack.Application._menu.items[i];
						menu.draw( $('.leftMenu').find('ul') );
					}

					/* Wack Embed Actions (chat and alerts) */
					var act = $('.header').find('.actions').find('div').first();
					wack.wackAction_chat = new WackAction({label: wack.taxonomy.wack_chat, icon: 'chat', onClick: function() { wack.extension.chat.start(); } });
					wack.wackAction_alerts = new WackAction({label: wack.taxonomy.wack_alerts, icon: 'warning2', onClick: function() { wack.extension.alerts(); } });
					if(wack.config.wack_chat) wack.wackAction_chat.create();
					if(wack.config.wack_alerts) wack.wackAction_alerts.create();
					
					/* Custom Actions */
					if( r._actions.length > 0 ) {
						for(var a in r._actions) {
							r._actions[a].create();
						}
					}

					/* Common Actions (mobile menu / logout) */
					act.append('<div onclick="javascript:wack.mobileMenu()" class="wackAction mobileOnly" title="' + wack.taxonomy.wack_mobile_menu + '"><span class="icon-menu"></span></div>');
					act.append('<div onclick="javascript:wack.logout()" class="wackAction" title="' + wack.taxonomy.wack_logout + '"><span class="icon-enter"></span></div>');

					if(wack.config.iOSPadding) {
						$('.all').each(function() {
							var h = $(this).height();
							$(this).css('top','20px');
							$(this).height( h-20 );
						});
					}

					wack.addFilter('resize_app_view', 'window_resize', function() {
						var app_view = $('#appView');
						app_view.find('div').first().width( (app_view.width() * wack.Application.modules.length) );
						$('.wrapper').width(app_view.width());
					});

					$('.header').find('h1').find('span').first().html(wack.Application._name);
					if( $.isFunction( wack.Application._onLoad ) ) wack.Application._onLoad();

				}
			});
		}
	});
}

/* validateUser
	* Try to validate user (username) during login
	* Parameters:
	* user: username
	* callback (function)
	*/
function validateUser(user, callback) {
	
	show_loader(wack.taxonomy.checking);
	wackAjax('POST', 'validate-user', {login: user}, function(data) {
		var result = eval('(' + data + ')');
		if( result.error > 0 ) {
			$('#login_input').val('');
			switch(result.error) {
				// user not found
				case 1:
					messageBox({
						ui: 'error',
						icon: 'cancel-circle',
						title: wack.taxonomy.login_error,
						contents: wack.taxonomy.login_error_3.replace(/\[user\]/g,user)
					});
				break;
				// user access is blocked
				case 2:
					messageBox({
						ui: 'error',
						icon: 'cancel-circle',
						title: wack.taxonomy.login_error,
						contents: wack.taxonomy.login_error_4.replace(/\[user\]/g,user)
					});
				break;
				// user session exists (this user has no permission to multiple logins)
				case 3:
					messageBox({
						ui: 'warning',
						icon: 'warning',
						title: wack.taxonomy.login_session_exists,
						contents: wack.taxonomy.login_error_5.replace(/\[user\]/g,user),
						buttons: [
							[wack.taxonomy.cancel, 'default', null, true],
							[wack.taxonomy.confirm, 'success', function() {
								// destroy current session
								callback(result);
							},true]
						]
					});
				break;
				// user session exists (this user has permission to multiple logins)
				case 4:
					messageBox({
						ui: 'warning',
						icon: 'warning',
						title: wack.taxonomy.login_session_exists,
						contents: wack.taxonomy.login_error_6.replace(/\[user\]/g,user),
						buttons: [
							[wack.taxonomy.cancel, 'default', null, true],
							[wack.taxonomy.confirm, 'success', function() {
								callback(result);
							},true]
						]
					});
				break;
			}
			return;
		} else {
			callback(result);
		}
	});
}

/* validateUserPassword
	* Check if user password is correct
	* Parameters:
	* user (username)
	* password
	* callback (function)
	*/
function validateUserPassword(_user, pwd, callback) {
	wackAjax('POST', 'validate-user-password', {user_id: _user, password: pwd}, function(data) {
		var result = eval('(' + data + ')');
		if(result.error == 1) {
			messageBox({
				ui: 'error',
				icon: 'cancel-circle',
				title: 'Invalid Password',
				contents: 'Invalid password! Please try again'
			});
		} else {
			callback(result);
		}
	});
}

/* wackLoginAdvance
	* Advance through login steps (asking for username and password)
	* Transforms input object and icons
	*/
function wackLoginAdvance() {
	if( $('#login_input').val().length == 0 ) {
		$('.loginInputContainer').css('border','1px solid #f00');
		$('.loginInputContainer').css('background','#F2DCDC');
		$('.loginInputContainer').bounce();
		if( login_step == 1 ) {
			messageBox({
				ui: 'error',
				icon: 'cancel-circle',
				title: wack.taxonomy.login_error,
				contents: wack.taxonomy.login_error_1
			});
		}
		if( login_step == 2 ) {
			messageBox({
				ui: 'error',
				icon: 'cancel-circle',
				title: wack.taxonomy.login_error,
				contents: wack.taxonomy.login_error_2
			});
		}
		return;
	}
	$('#login_icon').removeClass('icon-user');
	$('#login_icon').addClass('icon-spinner');
	if(login_step == 1) {
		var user = $('#login_input').val();
		setTimeout(function() {
			validateUser(user, function(result) {
				if(result.error == 0) {
					$('#login_icon').removeClass('icon-spinner');
					$('#login_icon').addClass('icon-lock');
					$('#login_input').val('');
					$('#login_input').attr('type','password');
					$('#login_input').attr('placeholder',wack.taxonomy.login_password.replace(/\[user\]/gi,result.first_name));
					$('#login_input').focus();
					wack_temp_user.id = result.id;
					wack_temp_user.name = result.first_name;
					wack_temp_user.customer = result.customer;;
					$('.loginInputContainer').css('border','1px solid #000');
					$('.loginInputContainer').css('background','#fff');
					login_step = 2;
				}
			});
		},1000);
	}
	if(login_step == 2) {
		var pwd = $('#login_input').val();
		setTimeout(function() {
			validateUserPassword(wack_temp_user.id, pwd, function(result) {
				if(result.status == 1) {
					$('#login_icon').removeClass('icon-spinner');
					$('#login_icon').addClass('icon-checkmark');
					$('#login_input').remove();
					$('.loginBox').animate({
						opacity: 0,
					},1000,function() {
						wack.user.id = wack_temp_user.id;
						wack.user.name = wack_temp_user.name;
						wack.user.customer = wack_temp_user.customer;
						initializeDesktop();
					});
				}
			});
		},1000);
	}
}

/* configWack
	* Configure WACK main aspects and loads login screen
	*/
function configWack() {
	animationLoading(function() {
		if(!wack.config.noLogin) {
			$.ajax({
				url: './library/kernel/resources/login.resource?dt=' + (new Date().getTime()),
				success: function(data) {
					var html = data;
					html = wackReplace(html);
					$('#app').append($(html));
					$('.loadingScreen').remove();
					$('#login').animate({
						opacity: 1
					},1000,function() {
						$('a#login_go').click(function() {
							wackLoginAdvance();
						});
						$('#login_input').on('keyup', function(e) {
							if(e.which == 13) wackLoginAdvance();
						});	
					});
				}
			});
		} else {
			wack.user.id = 1;
			initializeDesktop();
		}
	});
}

/* wackReplace
	* Replace WACK special tokens in a string using taxonomy
	* Parameters:
	* str: the string to be updated
	*/
function wackReplace(str) {
	var taxonomy_replace = function(x) {
		var cmd;
		x = x.replace(/\<\%\=/gi,'');
		x = x.replace(/\%\>/gi,'');
		cmd = '(typeof wack.taxonomy.' + x + '!= \'undefined\' ? wack.taxonomy.' + x + ' : \'Invalid\')';
		return( eval(cmd) );
	};
	str = str.replace(/\<\%\=(.*)\%\>/gi, function(x) { return(taxonomy_replace(x)); } );
	return(str);
}
var wack_replace = wackReplace;

/* wackAjax
	* Performs ajax request sending default information
	*/
function wackAjax(_type, _url, _data, callback) {
	$.ajax({
		url: './config/database.wcfg?dt=' + ( new Date().getTime() ),
		success: function(dbConfigData) {
			var _dbConfig = eval('(' + dbConfigData + ')');
			var database = [_dbConfig.host, _dbConfig.user, _dbConfig.password, _dbConfig.database, _dbConfig.port];
			_data.database = database;
			_data.user = wack.user.id; /* get this from wack.user.id */
			_data.mode = _dbConfig.mode;
			_data.customer = wack.user.customer;
			$.ajax({
				type: _type,
				url: 'library/php/ajax/' + _url + '.php?dt=' + (new Date().getTime()),
				data: _data,
				success: function(data) {
					callback(data);
				}
			});
		}
	});
}

function checkUserPermissions(p, callback) {
	wackAjax('POST', 'check-user-permissions', {permissions: p}, function(data) {
		var results = eval('(' + data + ')');
		callback(results);
	});
}

/* wackLoad
	* Starts W.A.C.K and load everything from 'loading' to 'login'
	*/
function wackLoad() {
	$.ajax({
		type: 'POST',
		url: './config/updater.wcfg?dt=' + (new Date().getTime()),
		success: function(updateData) {
			var results = eval('(' + updateData + ')');
			wackAjax('POST', 'wack-update-script', {version: results.wack_version}, function(scriptData) {
				if(scriptData == "1") document.location.href = 'index.php';
			});
		}
	});
	$.ajax({
		url: './config/wack.wcfg?dt=' + (new Date().getTime()),
		success: function(configData) {
			var config = eval('(' + configData + ')');
			wack.config = config;
			var data = {
				language: config.language,
				library: config.library
			};
			wackAjax('POST', 'wack-loader', data, function(data) {
				var results = eval('(' + data + ')');
				wack.taxonomy = results.language;
				for(var i in results.library) {
					results.library[i]();
				}
				$.ajax({
					url: 'application/database/schema/schemas.wcfg?dt=' + (new Date().getTime()),
					success: function(schemaData) {
						var db = eval(schemaData);
						wackAjax('POST', 'wack-database-config', {schemas: db}, function(dbData) {
							var _dbConfig = eval('(' + dbData + ')');
							wack.database = _dbConfig;
							configWack();
						});
					}
				})
			});
		}
	});
}

/* showLoader
	* Displays a loading screen with a text
	* Important: There's an alias (show_loader) to old W.A.C.K applications (1.5.1 or less)
	*/
function showLoader( loadingText ) {
	var workspace = $('.desktop');
	var modal = $('<div class="modalLoader modal" style="opacity:0"></div>');
	var text = $('<div class="loadText"><span>' + loadingText + '</span></div>');
	workspace.append(modal);
	modal.append(text);
	modal.animate({
		opacity: 1
	},250);
}
var show_loader = showLoader;

/* hideLoader
	* Hide the loading screen
	* Important: There's an alias (show_loader) to old W.A.C.K applications (1.5.1 or less)
	*/
function hideLoader() {
	$('.modalLoader').animate({
		opacity: 0
	},250,function() {
		$(this).remove();
	});
}
var hide_loader = hideLoader;

/* modalWindow
	* Displays a modal window (base function)
	* Args (Extended Parameters)
	* width: window width (default = 640)
	* height: window height (default = 480)
	* contents: window contents (html string, default = ...)
	* buttons: array of buttons and actions (label, ui, function, (bool)closeModal, dialogResult)
	*/
function modalWindow(args) {
	var settings = $.extend({
		width: 640,
		height: 480,
		contents: '...',
		buttons: [
			/* Label, ui, function, closeModal, dialogResult */
			['Fechar', 'error', null, true, 'dialogResult_Cancel']
		],
		controls: null,
		onLoad: null
	},args);
	
	var workspace = $('#app');
	var modal = $('<div class="modal"></div>');
	var modal_window = $('<div class="modalWindow"></div>');

	modal_window.width( settings.width );
	modal_window.height( settings.height );
	
	modal.append(modal_window);
	workspace.append(modal);
	
	modal_window.append('<div class="windowContents"></div>');
	modal_window.append('<div class="windowButtons"></div>');

	for(var i in settings.buttons) {
		var button_index = parseInt(i);
		modal_window.find('.windowButtons').append('<a dialog-result="' + (typeof settings.buttons[i][4] != 'undefined' ? settings.buttons[i][4] : 'dialogResult_Cancel') + '" button-index="' + button_index + '" class="button ui-button-' + settings.buttons[i][1] + '">' + settings.buttons[i][0] + '</a>');
	}

	modal_window.find('a.button').each(function() {
		$(this).click(function(e) {
			var i = parseInt( $(this).attr('button-index') );
			//var dlg = $(this).attr('dialog-result');
			if( settings.buttons[i][3] ) {
				modal_window.animate({
					left: 0 - modal_window.width()
				},125,function() {
					modal.animate({
						opacity: 0
					},125, function() {
						$(this).remove();
						if( $.isFunction(settings.buttons[i][2]) ) settings.buttons[i][2](settings.controls);
					});
				})
			} else {
				if( $.isFunction(settings.buttons[i][2]) ) settings.buttons[i][2]();
			}
		});
	});

	modal_window.css('left', 0-modal_window.width());
	modal_window.css('top', ( (modal.height() / 2) - (modal_window.height() / 2) ) );
	modal_window.find('.windowContents').append($('<div style="height:100%">' + settings.contents + '</div>'));

	if(settings.controls != null) {
		var _wc = modal_window.find('.windowContents').find('div').first();
		_wc.append('<div class="dialogElements"></div>');
		for(var i in settings.controls) {
			_wc.find('.dialogElements').append('<div class="element"></div>');
			settings.controls[i].objectData.draw(_wc.find('.element').last());
		}
	}

	modal_window.animate({
		left: (workspace.width() / 2) - (modal_window.width() / 2)
	},250, function() {
		/* ToDo: resize modalWindow to fit contents */
		modal_window.height( modal_window.height() + modal_window.find('.dialogElements').first().height() - 35 );
		if( $.isFunction(settings.onLoad) ) settings.onLoad(modal_window, settings.controls);
	});

	// Add a filter to resize modalWindow
	wack.addFilter('resize_modal_window', 'window_resize', function() {
		var mw = $('.modalWindow');
		var m = $('.modal');
		mw.css('left', (m.width() / 2) - (mw.width() / 2));
		mw.css('top', ( (m.height() / 2) - (mw.height() / 2) ) );
	});
}

/* messageBox
	* Uses modalWindow to display a simple messageBox
	* Args (Extended Parameters)
	* ui: window ui (user interface) class (default = 'default') - default is blue
	* title: message window
	* icon: message icon (IcoMoon)
	* contents: message contents (accepts html)
	* buttons: buttons array (see modalWindow)
	* controls: array of controls (just like in a view)
	* onLoad: callback function
	* onClose: callback function (dialogResult as parameter)
	*/
function messageBox(args) {
	var settings = $.extend({
		ui: 'default',
		title: wack.taxonomy.messageBox_title,
		icon: 'warning',
		contents: '...',
		buttons: [
			/* caption, ui, onClick, closeDialog, dialogResult */
			['Fechar', 'default', null, true, 'dialogResult_Cancel']
		],
		controls: null,
		onLoad: null
	},args);
	modalWindow({
		width: 420,
		height: 240,
		buttons: settings.buttons,
		contents: '<div class="h1Container ui-header-' + settings.ui + '"><h1>' + settings.title + '</h1></div><p><span style="font-size:1.5em" class="icon-' + settings.icon + '"></span></p><p>' + settings.contents + '</p>',
		controls: settings.controls,
		onLoad: function(ui, controls) {
			if($.isFunction(settings.onLoad)) settings.onLoad(ui, controls);
		}
	});
}

/* createCalendar
	* creates a calendar (dynamic object to pick a date)
	* uses modalWindow as base
	* has alias to old versions
	*/
function createCalendar( target ) {
	var html = '<div class="calendar">';
	var days = wack.taxonomy.week_days;
	var today = new Date();
	var today_day = today.getDate();
	var counting = false;
	var day = 1;
	var week_day = 0;
	
	var firstDay = 6;
	var lastDay = 31;
	
	html+= '<div class="h1Container"><h1>' + wack.taxonomy.calendar + '</h1></div>';
	html+= '<div class="clear"></div>';
	
	for(var i in days) {
		html+= '<div class="square square-weekday' + (parseInt(i) == wack.config.week_first_day ? '_sunday' : '') + '">' + days[i] + '</div>';
	}
	
	for(var i=0; i<=41; i++) {
		if( week_day == firstDay ) counting = true;
		html+= '<div ' + (week_day == wack.config.week_first_day ? 'style="color:red"' : '') + ' class="square square-' + (counting && day <= lastDay ? 'day' : 'blank') + (day == today_day ? '_today' : '') + '">' + (counting && day <= lastDay ? day : '') + '</div>';
		if( counting ) day++;
		week_day++;
		if( week_day > 6 ) week_day = 0;
	}

	html+= '</div>'; /* .calendar */
	target.append( $(html) );
}
var create_calendar = createCalendar;

/* desktopSizeChange
	* checks if desktop (screen) size changed
	* updates two attributes in div#app (lastWidth and lastHeight)
	*/
function desktopSizeChange() {
	var last_w = parseInt( $('#app').attr('lastWidth') );
	var last_h = parseInt( $('#app').attr('lastHeight') );
	var app_w = $('#app').width();
	var app_h = $('#app').height();
	if( last_w != app_w || last_h != app_h ) {
		wack.execFilter('window_resize');
		$('#app').attr('lastWidth', app_w);
		$('#app').attr('lastHeight', app_h);
	}
}

/* iOS functions */
function ios_func(json) {
	if(typeof window.webkit != 'undefined') window.webkit.messageHandlers.callbackHandler.postMessage(json);
}

/* Document is ready. Let's do it */
$(document).ready(function() {

	/* Is W.A.C.K installed? */
	$.ajax({
		url: 'install.log',
		error: function(jqXHR,error, errorThrown) {  
			if(jqXHR.status&&jqXHR.status == 404) {
				document.location.href = 'install/';
			}
		},
		success: function() {
			wack = new Wack();
			setTimeout(function() {
				wackLoad();
				setInterval(function() {
					desktopSizeChange();
				},500);
				setInterval(function() {
					wack.popNotification();
				},2000);
			},1000);
		}
	});

});