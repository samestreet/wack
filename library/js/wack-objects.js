/* Base Class - Cuz Javascript has no classes */
var Class = function(methods) {   
	var klass = function() {    
		this.initialize.apply(this, arguments);          
	};  
		
	for (var property in methods) { 
		klass.prototype[property] = methods[property];
	}
	  
	if (!klass.prototype.initialize) klass.prototype.initialize = function(){};		
	return klass;    
};

/* W.A.C.K Filter - To add Wack filter events */
var WackFilter = Class({
	initialize: function(args) {
		this.name = args.name;
		this.trigger = args.trigger;
		this.onRaise = args.onRaise;
	}
});

/* W.A.C.K Notification */
var WackNotification = new Class({
	initialize: function(args) {
		var settings = $.extend({
			ui: 'default',
			icon: 'warning',
			title: 'Notificação',
			contents: 'Mensagem do Sistema',
			onClick: null
		},args);
		this.ui = settings.ui;
		this.icon = settings.icon;
		this.title = settings.title;
		this.contents = settings.contents;
		this.read = false;
		this.onClick = settings.onClick;
		this.index = wack.notifications.length;
	}
});

/* W.A.C.K Class - The Mothership */
var Wack = Class({
	initialize: function() {
		var qs = queryObj();
		this.user = {
			id: 0
		};
		this.filters = [];
		this.currentModule = -1;
		this.database = {
			schemaConfig: {},
			schemas: []
		};
		this.extension = {};
		this.forceReplace = true;
		this.notifications = [];
		this.notificationBusy = false;
		this.systemCommands = [];
	},
	addNotification: function(n) {
		var W = this;
		W.notifications.push(n);
	},
	hideNotification: function() {
		var W = this;
		var notif = $('.notification').first();
		var index = parseInt(notif.attr('index'));
		notif.animate({
			opacity: 0
		},250,function() {
			$(this).remove();
			W.notifications[index].read = true;
			setTimeout(function() {
				W.notificationBusy = false;
			},1000);
		});
	},
	popNotification: function() {
		var W = this;
		for(var i in this.notifications) {
			if(!this.notifications[i].read && !this.notificationBusy) {
				var notif = $('<div index="' + this.notifications[i].index + '" class="notification"></div>');
				var icon = $('<span class="icon-warning ui-notification-' + this.notifications[i].ui + '"></span>');
				var title = $('<div class="notificationTitle">' + this.notifications[i].title + '</div>');
				var p = $('<div style="clear:both"></div><div class="notificationContents">' + this.notifications[i].contents + '</div>');
				notif.append('<div style="width:calc(100% - 10px); height:calc(100% - 10px); position:relative; left:5px; top:5px;"></div>');
				notif.find('div').first().append(icon);
				notif.find('div').first().append(title);
				notif.find('div').first().append(p);

				$('#app').append(notif);

				notif.animate({
					opacity: 1
				},250,function() {
					W.notificationBusy = true;
					setTimeout(function() {
						W.hideNotification();
					},8000)
				});

				notif.click(function() {
					var index = parseInt($(this).attr('index'));
					$(this).remove();
					wack.notificationBusy = false;
					W.notifications[index].read = true;
					if( $.isFunction(W.notifications[index].onClick) ) W.notifications[index].onClick();
				});

				break;
			}
		}
	},
	addFilter: function(name, trigger, fcn) {
		for(var i in this.filters) {
			if(this.filters[i].trigger == trigger && this.filters[i].name == name) return;
		}
		this.filters.push(new WackFilter({
			name: name,
			trigger: trigger,
			onRaise: fcn
		}));
	},
	execFilter: function( trigger ) {
		for(var i in this.filters) {
			if(this.filters[i].trigger == trigger) this.filters[i].onRaise();
		}
	},
	extension: {
		chat: function() {
			if( typeof open_wack_chat != 'undefined' && $.isFunction(open_wack_chat) && !wack.config.noLogin ) {
				open_wack_chat();
			} else {
				messageBox({
					icon: 'cancel-circle',
					title: wack.taxonomy.res_disabled,
					contents: wack.taxonomy.res_disabled_text
				});
			}
		}
	},
	log: function(msg, style) {
		console.log('%c ' + msg + ' ', 'color:#f00; font-weight:bold');
	},
	logout: function() {
		messageBox({
			icon: 'enter',
			title: wack.taxonomy.logout,
			contents: wack.taxonomy.logout_question,
			buttons: [
				[wack.taxonomy.cancel, 'error', null, true],
				[wack.taxonomy.confirm, 'default', function() { document.location.href = 'index.php'; }, true]
			]
		});
	},
	mobileMenu: function() {
		var modal = $('<div class="modal"></div>');
		var menu = $('<div class="mobileMenu"></div>');
		var pd = $('<div style="width:calc(100% - 10px); height:calc(100% - 10px); position: relative; top: 5px; left: 5px"></div>');
		$('#app').append(modal);
		modal.append(menu);
		menu.css('top',$('.desktop').height() + 'px');
		menu.append(pd);
		menu.animate({
			top: '10px',
			opacity: 1
		},500,function() {
			pd.append('<ul>');
			for(var i in wack.Application._actions) {
				pd.find('ul').append('<li menu-index="' + parseInt(i) + '"><a href="javascript:void(0)"><span class="icon-' + wack.Application._actions[i]._icon + '"></span><span>' + (wack.Application._actions[i]._label) + '</span></a></li>');
			}
			pd.find('li').click(function() {
				var index = parseInt($(this).attr('menu-index'));
				menu.animate({
					top: $('.desktop').height() + 'px'
				},250,function() {
					modal.remove();
					if($.isFunction(wack.Application._actions[index]._onClick)) wack.Application._actions[index]._onClick();
				});
			});
			pd.find('ul').append('<li></li>');
			pd.find('ul').append('<li style="bottom:0px;position:absolute"><a href="javascript:void(0)"><span class="icon-cross"></span><span>Fechar</span></a></li>');
			pd.find('li').last().click(function() {
				menu.animate({
					top: $('.desktop').height() + 'px'
				},250,function() {
					modal.remove();
				});
			});
		});
	}
});

/* WackApplication Class */
var WackApplication = Class({
	initialize: function(args) {
		var settings = $.extend({
			name: 'Application',
			globals: null,
			actions: null,
			menu: {
				items: {
					mnuHome: new WackMenu({
						icon: 'home',
						label: 'Home',
						onCreate: function( me ) {
							me.active(true);
						}
					})
				}
			},
			onLoad: null
		},args);
		this._name = settings.name;
		this._menu = settings.menu;
		this.globals = settings.globals;
		this._actions = settings.actions;
		this._onLoad = settings.onLoad;
		this.modules = [];
	},
	/* Load a module with callback function */
	loadModule: function(m, callback) {
		var Me = this;
		$.ajax({
			type: 'POST',
			url: './application/views/' + m + '.module?dt=' + (new Date().getTime()),
			success: function(data) {
				var nData = data.replace(/Me\./g,'wack.Application.modules[wack.currentModule].');
				var r = eval('new WackModule(' + nData + ')');
				Me.modules.push(r);
				r.moduleIndex = Me.modules.length - 1;
				r.id = m;
				if( $.isFunction(callback) ) callback( r );
			}
		});
	},
	disposeAll: function() {
		$('.wrapper').remove();		/* remove all wrappers */
		$('#appView').find('div').first().append('<div class="wrapper"></div>');	/* create a new wrapper */
		wack.Application.modules = [];
		wack.currentModule = 0;
		wack.forceReplace = true;
	},
	/* Remove last opened module from stack and slide the screen (if necessary) */
	disposeLast: function() {
		wack.Application.modules.pop();
		wack.currentModule-=1;
		$('.wrapper').last().remove();
		$('#appView').find('div').first().width( wack.Application.modules.length * $('#appView').width() );
		$('#appView').find('div').first().animate({left:'+=100%'});
		$('.header').find('h1').find('span').last().html(wack.Application.modules[wack.currentModule]._name);
		this.currentModule().invokeUpdate();
	},
	getScript: function(filename, args) {
		var settings = $.extend({
			loading: 'Carregando Script',
			eval: true,
			done: null,
			data: {}
		},args);
		showLoader(settings.loading);
		$.ajax({
			url: './config/database.wcfg?dt=' + (new Date().getTime()),
			success: function(dbData) {
				var _dbConfig = eval('(' + dbData + ')');
				var database = [_dbConfig.host, _dbConfig.user, _dbConfig.password, _dbConfig.database, _dbConfig.port];
				settings.data.database = database;
				settings.data.user = wack.user.id;
				settings.data.mode = _dbConfig.mode;
				settings.data.customer = 1;
				$.ajax({
					type: 'POST',
					url: './application/scripts/' + filename + '.php?dt=' + (new Date().getTime()),
					data: settings.data,
					success: function(data) {
						var r = data;
						hideLoader();
						if(settings.eval) r = eval('(' + data + ')');
						if($.isFunction(settings.done)) settings.done(r);
					}
				});
			}
		})
	},
	currentModule: function() {
		return wack.Application.modules[wack.currentModule];
	}
});

/* WackModule Class */
var WackModule = Class({
	initialize: function(args) {
		var settings = $.extend({
			name: 'Module',
			controls: null,
			hasToolBar: false,
			toolbar: null,
			dataSource: null,
			regID: 0,
			onLoad: null,
			globals: null,
			update: null
		},args);
		this._name = settings.name;
		this.controls = settings.controls;
		this._hasToolBar = settings.hasToolBar;
		this._toolbar = settings.toolbar;
		this._dataSource = settings.dataSource;
		this._regID = settings.regID;
		this._onLoad = settings.onLoad;
		this.globals = settings.globals;
		this._update = settings.update;
		this.moduleIndex = -1;
	},
	invokeUpdate: function() {
		if($.isFunction(this._update)) this._update();
	},
	/* Displays the module (mode can be 'add', to slide effect) */
	show: function(mode, parameters) {
		var Me = this;
		var module = $('<div class="columns"></div>');
		var column = 0;

		if( this._hasToolBar ) {
			module.append('<div class="toolbar"></div>');
			for(var i in this._toolbar) {
				var it = this._toolbar[i];
				module.find('.toolbar').append('<div class="toolBarItem" item-name="' + i + '"><span class="icon-' + (this._toolbar[i].icon) + '"></span><span>' + (this._toolbar[i].label) + '</span></div>');
				if( this._toolbar[i].splitAfter ) $('.toolbar').append('<div class="toolBarSplitter"></div>');
			}
			module.find('.toolbar').find('.toolBarItem').each(function() {
				$(this).click(function(e) {
					var index = $(this).attr('item-name');
					var i = eval('wack.Application.modules[wack.currentModule]._toolbar.' + index);
					if( $.isFunction(i.onClick) ) i.onClick(Me._toolbar[index], e);
				})
			});
		}

		for(var i in this.controls) {
			column+= this.controls[i].objectData._blockSize;
			var col = $('<div class="column col-' + this.controls[i].objectData._blockSize + '"></div>');
			col.append('<div class="element" ' + (this.controls[i].objectData._dataColumn != null ? 'dataColumn="' + this.controls[i].objectData._dataColumn + '"' : '') + '></div>');
			col.find('.element').append('<div ' + (column < 12 ? 'class="pdR5"' : '') + '></div>');
			this.controls[i].objectData.draw( col.find('div').last() );
			module.append(col);
			if( column >= 12 ) column = 0;
		}

		if( wack.forceReplace ) {
			$('#appView').find('div').first().html('');
			$('#appView').find('div').first().append('<div class="wrapper"></div>')
			$('#appView').find('div').first().css('left','0px');
		} else {
			$('#appView').find('div').first().width( wack.Application.modules.length * $('#appView').width() );
			$('#appView').find('div').first().append('<div class="wrapper"></div>');
			$('#appView').find('div').first().animate({left:'-=100%'});
		}

		$('.wrapper').last().width( $('#appView').width() );
		$('#appView').find('.wrapper').last().append( module );

		$('.header').find('h1').find('span').last().html(this._name);

		setTimeout(function() {
			wack.currentModule = Me.moduleIndex;
			if( $.isFunction(Me._onLoad) ) Me._onLoad(Me, parameters);
			wack.forceReplace = false;
		},100);

	},
	/* Save data into database (fields and custom fields, check for correct database connection) */
	save: function(args) {
		var Me = this;
		var settings = $.extend({
			public: true,
			before: null,
			done: null
		},args);

		var dbConfig = eval('wack.database.schemaConfig.' + this._dataSource);
		var saveData = {
			dataSource: null,
			id: null,
			data: [],
			custom_field: [],
			user: wack.user.id,
			public: settings.public,
			mode: wack.config.dataMode
		};
		
		if( this._dataSource == null ) {
			messageBox({
				ui: 'error',
				icon: 'cancel-circle',
				title: wack.taxonomy.save,
				contents: wack.taxonomy.save_error_dataSource_null
			});
			return;
		}

		show_loader(wack.taxonomy.saving_data);

		saveData.dataSource = this._dataSource;
		saveData.id = this._regID;

		for(var i in this.controls) {
			if( typeof this.controls[i].objectData.is_group != 'undefined' ) {
				for(var j in this.controls[i].controls) {
					saveData.custom_field.push([this.controls[i].controls[j].objectData.attributes.custom_field_id,this.controls[i].controls[j].dbVal()]);
				}
			} else {
				if(typeof this.controls[i].objectData._dataColumn != 'undefined' && this.controls[i].objectData._dataColumn != null) {
					saveData.data.push([this.controls[i].objectData._dataColumn,this.controls[i].dbVal()]);
				}
			}
		}

		if($.isFunction(settings.before)) {
			saveData = settings.before(saveData);
			if(!saveData) {
				hide_loader();
				messageBox({
					ui: 'error',
					icon: 'cancel-circle',
					title: 'Ação Cancelada',
					contents: 'A ação foi cancelada pelo usuário!'
				});
				return;
			}
		}
		
		if( $.isFunction(dbConfig.save) ) {
			saveData = dbConfig.save(saveData);
			if( saveData == false ) {
				hide_loader();
				return;
			}
		}

		wackAjax('POST','save-data', saveData, function(data) {
			var result = eval('(' + data + ')');
			var errConfig = eval('wack.database.schemaConfig.' + Me._dataSource + '.error');
			hide_loader();
			if( result.error > 0 && $.isFunction(errConfig) ) {
				errConfig(result);
				return;
			}
			if( $.isFunction(settings.done) ) settings.done(result);
		});
	},
	regID: function(v) {
		if( typeof v != 'undefined' ) {
			this._regID = v;
			return(v);
		} else {
			return(this._regID);
		}
	}
});

/* WackAction Class */
var WackAction = Class({
	initialize: function(args) {
		var settings = $.extend({
			label: '#',
			icon: 'star',
			counter: 0,
			onClick: null
		},args);
		var Me = this;
		this._label = settings.label;
		this._icon = settings.icon;
		this._counter = settings.counter;
		this._onClick = settings.onClick;
		this.create = function() {
			var act = $('.header').find('.actions').find('div').first();
			var el = $('<div class="wackAction mobileHide" title="' + this._label + '"><span class="icon-' + this._icon + '"></span><div class="counter" style="display:' + (this._counter > 0 ? 'block' : 'none') + '"></div></div>');
			act.append(el);
			this.elementHtml = el;
			if( $.isFunction(this._onClick) ) act.find('.wackAction').last().click(function(e) {
				Me._onClick(Me, e);
			});
			this.element = el;
		}
	},
	increaseCounter: function( n ) {
		var num = this._counter + n;
		this.elementHtml.find('.counter').html(num);
		if(num > 0) this.elementHtml.find('.counter').css('display','block');
	},
	decreaseCounter: function( n ) {
		var num = this._counter - n;
		this.elementHtml.find('.counter').html(num);
		if(num <= 0) this.elementHtml.find('.counter').css('display','none');
	},
	removeCounter: function() {
		this.elementHtml.find('.counter').html('0');
		this.elementHtml.find('.counter').css('display','none');	
	},
	hide: function() {
		this.element.hide();
	}
});

/* WackMenu Class */
var WackMenu = Class({
	initialize: function(args) {
		var settings = $.extend({
			icon: 'star',
			label: 'WackMenu',
			active: false,
			enabled: true,
			onClick: null,
			onCreate: null
		},args);
		this._icon = settings.icon;
		this._label = settings.label;
		this._active = settings.active;
		this._enabled = settings.enabled;
		this._onClick = settings.onClick;
		this._onCreate = settings.onCreate;
		this.elementHtml = null;
	},
	icon: function( val ) {
		if( typeof val != 'undefined' ) {
			this.elementHtml.find('span').first().removeClass('icon-' + this._icon);
			this.elementHtml.find('span').first().addClass('icon-' + val);
			this._icon = val;
			return(val);
		} else {
			return(this._icon);
		}
	},
	label: function( val ) {
		if( typeof val != 'undefined' ) {
			this.elementHtml.find('span').last().html(val);
			this._label = val;
			return(val);
		} else {
			return(this._label);
		}
	},
	active: function( val ) {
		if( typeof val != 'undefined' ) {
			if( val ) {
				this.elementHtml.addClass('active');
			} else {
				this.elementHtml.removeClass('active');
			}
			this._active = val;
		} else {
			return(this._active);
		}
	},
	enabled: function( val ) {
		if( typeof val != 'undefined' ) {
			if( !val ) {
				this.elementHtml.css('opacity','0.5');
				this.elementHtml.find('a').css('cursor','not-allowed');
				this.elementHtml.find('a').unbind('click');
			} else {
				//this.elementHtml.removeClass('active');
			}
			this._enabled = val;
		} else {
			return(this._enabled);
		}
	},
	draw: function( target ) {
		var menu = this;
		this.elementHtml = $('<li' + (this._active ? ' class="active"' : '') + '><a href="javascript:void(0)"><span class="icon-' + this._icon + '"></span><span>' + this._label + '</span></a></li>');
		target.append(this.elementHtml);
		if( $.isFunction(this._onCreate) ) this._onCreate( this );
		this.elementHtml.find('a').click(function() {
			clear_menu();
			menu.active(true);
			if( $.isFunction(menu._onClick) ) menu._onClick( menu );
		});
	}	
});

var ToolBarItem = Class({
	initialize: function(args) {
		var settings = $.extend({
			icon: 'star',
			label: 'Item',
			splitAfter: false,
			onClick: null
		},args);
		this.icon = settings.icon;
		this.label = settings.label;
		this.splitAfter = settings.splitAfter;
		this.onClick = settings.onClick;
	}
});

/* WackObject Class */
var WackObject = Class({
	initialize: function(args) {
		var settings = $.extend({
			blockSize: 3,
			dataColumn: null,
			attributes: {},
			elementHtml: function() {
				var html = $('<p>WackObject</p>');
				return(html);
			},
			onCreate: null
		},args);
		this._blockSize = settings.blockSize;
		this._dataColumn = settings.dataColumn;
		this.attributes = settings.attributes;
		this.elementHtml = settings.elementHtml;
		this._onCreate = settings.onCreate;
		this.element = null;
	},
	draw: function( target ) {
		var Me = this;
		var obj = this.elementHtml();
		Me.element = obj;
		target.append( Me.element );
		setTimeout(function() {
			if( $.isFunction( Me._onCreate ) ) Me._onCreate( Me.element );
		},100);
	}
});

/* ================================ */
/*									*/
/*		W.A.C.K core objects		*/
/*									*/
/* ================================ */

/* EmptyObject Class */
var EmptyObject = Class({
	initialize: function(args) {
		var settings = $.extend({
			blockSize: 12,
			mobileHide: true
		},args);
		var Me = this;
		this._blockSize = settings.blockSize;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<span></span>');
				if(settings.mobileHide) el.addClass('.mobileHide');
				return(el);
			},
		});
	}
});

/* TextBox Class */
var TextBox = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 3,
			dataColumn: null,
			attributes: [],
			/* TextBox Properties */
			label: 'TextBox',
			icon: 'pencil',
			eraser: true,
			placeholder: null,
			mask: null,
			maskReverse: false,
			foreColor: '#000',
			defaultValue: '',
			/* TextBox Events */
			onFocus: null,
			onBlur: null,
			onKeyUp: null,
			onKeyDown: null,
			onChange: null,
			iconAction: null
		},args);
		var Me = this;
		this._blockSize = settings.blockSize;
		this._label = settings.label;
		this._icon = settings.icon;
		this._eraser = settings.eraser;
		this._placeholder = settings.placeholder;
		this._mask = settings.mask;
		this._maskReverse = settings.maskReverse;
		this._foreColor = settings.foreColor;
		this._onFocus = settings.onFocus;
		this._onBlur = settings.onBlur;
		this._onKeyUp = settings.onKeyUp;
		this._onKeyDown = settings.onKeyDown;
		this._onChange = settings.onChange;
		this._iconAction = settings.iconAction;
		this._value = settings.defaultValue;
		this.objectData = new WackObject({
			dataColumn: settings.dataColumn,
			blockSize: settings.blockSize,
			attributes: settings.attributes,
			elementHtml: function() {
				var inputContainer = $('<div class="inputContainer"></div>');
				var label = $('<div class="label">' + Me._label + '</div>');
				var icon = $('<span class="actionIcon icon icon-' + Me._icon + '"></span>');
				var eraser = $('<span class="eraser icon icon-cancel-circle"></span>');
				var textbox = $('<input value="' + settings.defaultValue + '" style="color:' + settings.foreColor + '" type="text" ' + (settings.placeholder != null ? 'placeholder="' + settings.placeholder + '"' : '') + '/>');
				if(settings.label != null) inputContainer.append(label);
				if( Me._icon != null ) inputContainer.append(icon);
				if( $.isFunction(Me._iconAction) ) icon.css('cursor','pointer');
				inputContainer.append(textbox);
				if( Me._eraser ) inputContainer.append(eraser);
				return(inputContainer);
			},
			onCreate: function( obj ) {
				var label = obj.find('.label').first();
				var icon = obj.find('.actionIcon').first();
				var eraser = obj.find('.eraser').first();
				var textbox = obj.find('input').first();
				
				if( eraser.length > 0 ) {
					eraser.click(function() {
						textbox.val('');
					});
				}

				textbox.focus(function(e) {
					obj.css('border', '1px solid #777');
					obj.css('box-shadow','inset 1px 1px 2px rgba(0,128,255,0.4)');
					if( obj.find('.eraser').length > 0 ) {
						obj.find('.eraser').animate({
							opacity: 1
						},250)
					}
					if( $.isFunction(Me._onFocus) ) Me._onFocus(Me, e);
				});
				
				textbox.blur(function(e) {
					obj.css('border', '1px solid #999');
					obj.css('box-shadow','inset 1px 1px 2px rgba(0,0,0,0.2)');
					if( obj.find('.eraser').length > 0 ) {
						obj.find('.eraser').animate({
							opacity: 0
						},250)
					}
					if( $.isFunction(Me._onBlur) ) Me._onBlur(Me, e);
				});
				
				if( $.isFunction(Me._onKeyUp) ) {
					textbox.on('keyup', function(e) {
						Me._onKeyUp(Me, e);
					});
				}
				
				if( $.isFunction(Me._onKeyDown) ) {
					textbox.on('keydown', function(e) {
						Me._onKeyDown(Me, e);
					});
				}
				
				if( $.isFunction(Me._onChange) ) {
					textbox.on('change', function(e) {
						Me._onChange(Me, e);
					});
				}
				
				if( $.isFunction(Me._iconAction) ) icon.click(function(e) {
					Me._iconAction(Me, e);
				});

				if(Me._mask != null) textbox.mask(Me._mask, {reverse: Me._maskReverse});

				wack.addFilter('adjust_textboxes', 'window_resize', function() {
					$('.inputContainer').each(function() {
						var textbox = $(this).find('input').first();
						var label = $(this).find('.label').first();
						var icon = $(this).find('.actionIcon').first();
						var eraser = $(this).find('.eraser').first();
						var w = 0;
						if(label.length > 0) w+= label.width() + 20;
						if(icon.length > 0) w+= icon.width();
						if(eraser.length > 0) w+= eraser.width();
						w+=20;
						textbox.css('width', 'calc(100% - ' + w + 'px)');
					});
				});

				wack.execFilter("window_resize");

			}
		});
	},
	label: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('.label').html(v);
			this._label = v;
			wack.execFilter("window_resize");
			return(v);
		} else {
			return(this._label);
		}
	},
	icon: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('.icon').removeClass('icon-' + this._icon);
			this.objectData.element.find('.icon').addClass('icon-' + v);
			this._icon = v;
			wack.execFilter("window_resize");
			return(v);
		} else {
			return(this._icon);
		}
	},
	eraser: function(v) {
		var hasEraser = (this.objectData.element.find('.eraser').length > 0 ? true : false);
		var textbox = this.objectData.element.find('input');
		var eraser;
		if( hasEraser ) eraser = this.objectData.element.find('.eraser');
		if( typeof v != 'undefined' ) {
			if( v ) {
				if( !hasEraser ) {
					textbox.after('<span class="eraser icon icon-cancel-circle"></span>');
					textbox.width( textbox.width() - 35 );
					this.objectData.element.find('.eraser').click(function() {
						textbox.val('');
					});
				}
				this._eraser = true;
				return(true);
			} else {
				if( hasEraser ) {
					textbox.width( textbox.width() + 35 );
					eraser.remove();
				}
				this._eraser = true;
				return(false);
			}
		} else {
			return(this._eraser);
		}
	},
	placeholder: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('input').attr('placeholder',v);
			this._placeholder = v;
			return(v);
		} else {
			return(this._placeholder);
		}
	},
	mask: function(v) {
		var el = this.objectData.element.find('input');
		if(typeof v != 'undefined') {
			this._mask = v;
			el.mask(v);
			return(v);
		} else {
			return(this._mask);
		}
	},
	removeMask: function() {
		var el = this.objectData.element.find('input');
		el.unmask();
		this._mask = null;
	},
	foreColor: function(v) {
		var el = this.objectData.element.find('input');
		if(typeof v != 'undefined') {
			el.css('color',v);
			this._foreColor = v;
			return(v);
		} else {
			return(this._foreColor);
		}
	},
	clear: function() {
		this.objectData.element.find('input').val('');
	},
	focus: function() {
		this.objectData.element.find('input').first().focus();
	},
	enable: function() {
		this.objectData.element.css('opacity','1');
		this.objectData.element.find('input').removeAttr('disabled');
	},
	disable: function() {
		this.objectData.element.css('opacity','0.5');
		this.objectData.element.find('input').attr('disabled','disabled');
	},
	blockSize: function(v) {
		var temp = this._blockSize;
		var el = this.objectData.element.parent().parent().parent();
		if(typeof v != 'undefined') {
			el.removeClass('col-' + temp);
			el.addClass('col-' + v);
			this._blockSize = v;
			wack.execFilter("window_resize");
			return(v);
		} else {
			return(this._blockSize);
		}
	},
	fixLabelSize: function(v) {
		var el = this.objectData.element;
		el.find('.label').width(v);
		wack.execFilter("window_resize");
	},
	val: function(v) {
		var input = this.objectData.element.find('input');
		if( typeof v != 'undefined' ) {
			input.val(v);
			return(v);
		} else {
			return(input.val());
		}
	},
	dbVal: function() {
		return(this.val());
	},
	attribute: function(a, v) {
		var el = this.objectData.element.parent().parent();
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* ComboBox Class */
var ComboBox = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 3,
			dataColumn: null,
			/* ComboBox Properties */
			label: wack.taxonomy.select,
			defaultItem: [0, wack.taxonomy.select],
			/* ComboBox Events */
			onChange: null
		},args);
		var Me = this;
		this._label = settings.label;
		this._defaultItem = settings.defaultItem;
		this._onChange = settings.onChange;
		this._value = '';
		this.objectData = new WackObject({
			dataColumn: settings.dataColumn,
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="selectContainer"></div>');
				el.append('<div class="labelSelect">' + settings.label + '</div>');
				el.append('<div class="labelOption">' + (settings.defaultItem != null ? settings.defaultItem[1] : settings.label) + '</div>');
				el.append('<span class="iconSelect icon-love"></span>');
				el.append('<select></select>');				
				return(el);
			},
			onCreate: function( obj ) {
				var labelSelect = obj.find('.labelSelect');
				var labelOption = obj.find('.labelOption');
				var icon = obj.find('.iconSelect');
				var select = obj.find('select');
				labelOption.width( obj.width() - (labelSelect.width() + 67) );

				if( Me._defaultItem != null ) select.append('<option value="' + Me._defaultItem[0] + '" selected="selected">' + Me._defaultItem[1] + '</option>');

				select.focus(function() {
					icon.removeClass('icon-love');
					icon.addClass('icon-camp');
				});

				select.blur(function() {
					icon.removeClass('icon-camp');
					icon.addClass('icon-love');
				});

				select.on('change', function(e) {
					var selText = $(this).find('option:selected').html();
					labelOption.html(selText);
					Me._value = $(this).val();
					icon.removeClass('icon-camp');
					icon.addClass('icon-love');
					if($.isFunction(Me._onChange)) Me._onChange(Me, e);
				});

				wack.addFilter('adjust_checkboxes', 'window_resize', function() {
					$('.selectContainer').each(function() {
						var obj = $(this);
						var labelSelect = obj.find('.labelSelect');
						var labelOption = obj.find('.labelOption');
						labelOption.width( obj.width() - (labelSelect.width() + 67) );
					});
				});
			}
		});
	},
	label: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('.labelSelect').html(v);
			this._label = v;
			return(v);
		} else {
			return(this._label);
		}
	},
	enable: function() {
		this.objectData.element.find('select').removeAttr('disabled');
		this.objectData.element.css('opacity','1');
	},
	disable: function() {
		this.objectData.element.find('select').attr('disabled','disabled');
		this.objectData.element.css('opacity','0.5');
	},
	addItem: function(item) {
		var select = this.objectData.element.find('select');
		select.append('<option value="' + item[0] + '">' + item[1] + '</option>');
	},
	val: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('select').val(v);
			this._value = v;
			this.objectData.element.find('select').change();
			return(v);
		} else {
			return(this._value);
		}
	},
	dbVal: function() {
		return(this.objectData.element.find('select').val());
	},
	text: function() {
		var select = this.objectData.element.find('select').first();
		var selected = select.find('option:selected');
		return(selected.html());
	},
	clear: function() {
		var select = this.objectData.element.find('select').first();
		select.find('option').each(function() {
			if($(this).attr('value') != '0') $(this).remove();
		});
	},
	attribute: function(a, v) {
		var el = this.objectData.element.parent().parent();
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

var alphaCompareIndex = 0;
function alphaCompare(a,b) {
	var index = alphaCompareIndex;
	if(a[index] < b[index]) {
		return(-1);
	} else if(a[index] > b[index]) {
		return(1);
	} else {
		return(0);
	}
}

/* ListViewHeader Class */
var ListViewHeader = Class({
	initialize: function(args) {
		var settings = $.extend({
			label: 'Header',
			listLabel: null,
			showOnList: true,
			splitBefore: false,
			splitAfter: false,
			sortable: false
		},args);
		this.label = settings.label;
		this.showOnList = settings.showOnList;
		this.listLabel = (settings.listLabel != null ? settings.listLabel : settings.label);
		this.splitBefore = settings.splitBefore;
		this.splitAfter = settings.splitAfter;
		this.sortable = settings.sortable;
		this.columnIndex = 0;
	}
});
/* ListViewRow Class */
var ListViewRow = Class({
	initialize: function(args) {
		var settings = $.extend({
			id: null,
			selected: false,
			options: null,
			items: null,
			foreColor: '#000',
			attr: [],
		},args);
		this.id = settings.id;
		this.selected = settings.selected;
		this.options = settings.options;
		this.items = settings.items;
		this._foreColor = settings.foreColor;
		this._attr = settings.attr;
		this.objectTr = '<tr>';
		this.objectItem = '<div>';
	},
	createObjectItem: function(rowIndex) {
		var i = $('<div class="item ' + (this.selected ? 'item-selected' : '') + '" is-selected="' + (this.selected ? '1' : '0') + '" row-index="' + rowIndex + '" row-id="' + this.id + '"></div>');
		this.objectItem = i;
		return(i);
	},
	createObjectRow: function(rowIndex) {
		var i = $('<tr style="color:' + this._foreColor + '" ' + (this.selected ? 'class="selected"' : '') + ' is-selected="' + (this.selected ? 1 : 0) + '" row-index="' + rowIndex + '" row-id="' + this.id + '"></tr>');
		if(this._attr.length > 0) {
			for(var a in this._attr) i.attr(this._attr[a][0],this._attr[a][1]);
		}
		this.objectTr = i;
		return(i);
	},
	foreColor: function(v) {
		if(typeof v != 'undefined') {
			this.objectTr.css('color', v);
			this.objectItem.css('color', v);
			this._foreColor = v;
			return(v);
		} else {
			return(this._foreColor);
		}
	},
	remove: function() {
		this.objectTr.remove();
		this.objectItem.remove();
	}
});
/* ListViewOption Class */
var ListViewOption = Class({
	initialize: function(args) {
		var settings = $.extend({
			ui: 'default',
			icon: null,
			label: 'Action',
			onClick: null
		},args);
		var Me = this;
		this._ui = settings.ui;
		this._icon = settings.icon;
		this._label = settings.label;
		this._onClick = settings.onClick;
		this.element = null;
		this.elementMobile = null;
	},
	draw: function( target, mobile ) {
		var Me = this;
		var a = $('<a href="javascript:void(0)" class="listViewAction ui-listViewAction-' + this._ui + '">' + (this._icon != null ? '<span class="icon-' + this._icon + '" style="margin-right:5px"></span>' : '') + this._label + '</a>');
		target.append(a);
		a.click(function(e) {
			if(Me._onClick != null) Me._onClick(Me, e);
		});
		if(!mobile || typeof mobile == "undefined") {
			this.element = a;
		} else {
			this.elementMobile = a;
		}
	},
	ui: function(v) {
		var el = this.element;
		var elm = this.elementMobile;
		if(typeof v != 'undefined') {
			el.removeClass('ui-listViewAction-' + this._ui);
			el.addClass('ui-listViewAction-' + v);
			elm.removeClass('ui-listViewAction-' + this._ui);
			elm.addClass('ui-listViewAction-' + v);
			this._ui = v;
			return(v);
		} else {
			return(this._ui);
		}
	},
	label: function(v) {
		if(typeof v != "undefined") {
			var el = this.element;
			var elm = this.elementMobile;
			el.html('');
			elm.html('');
			if(this._icon != null) {
				el.append('<span class="icon-' + this._icon + '" style="margin-right:5px"></span>');
				elm.append('<span class="icon-' + this._icon + '" style="margin-right:5px"></span>');
			}
			el.append(v);
			elm.append(v);
			this._label = v;
			return(v);
		} else {
			return(this._label);
		}
	},
	icon: function(v) {
		var el = this.element;
		var elm = this.elementMobile;
		if(typeof v != "undefined") {
			el.find('span').first().removeClass('icon-' + this._icon);
			elm.find('span').first().removeClass('icon-' + this._icon);
			el.find('span').first().addClass('icon-' + v);
			elm.find('span').first().addClass('icon-' + v);
			this._icon = v;
			return(v);
		} else {
			return(this._icon);
		}
	}
});
/* ListView Class */
var ListView = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			dataColumn: null,
			/* ListView Properties */
			selector: false,
			selectable: false,
			multipleSelect: false,
			options: false,
			optionsLabel: null,
			headers: [
				new ListViewHeader({ label: 'Header' })
			],
			/* ListView Events */
		},args);
		var Me = this;
		this._selector = settings.selector;
		this._selectable = settings.selectable;
		this._multipleSelect = settings.multipleSelect;
		this._options = settings.options;
		this._optionsLabel = settings.optionsLabel;
		this._headers = settings.headers;
		this._selectedItems = null; /* used to control selected rows */
		this._items = [];
		this.objectData = new WackObject({
			dataColumn: settings.dataColumn,
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div></div>');
				var table = $('<table class="listViewTable mobileHide"></table>');
				var list = $('<div class="listView mobileOnly"></div>');
				el.append(table);
				el.append(list);
				return(el);
			},
			onCreate: function( obj ) {
				var table = obj.find('table.listViewTable');
				var div = obj.find('div.listView');
				var tr = $('<tr></tr>');
				var tdIndex = 0;
				if( Me._selector ) {
					tr.append('<td header-index="' + tdIndex + '" class="selector"></td>');
					tdIndex++;
				}
				for(var i in Me._headers) {
					tr.append('<td header-index="' + tdIndex + '">' + Me._headers[i].label + ' ' + (Me._headers[i].sortable ? '<span class="icon-sort-alpha-asc"></span>' : '') + '</td>');
					if(Me._headers[i].sortable) {
						tr.css('cursor', 'pointer');
						tr.find('td').last().click(function() {
							var sortIcon = $(this).find('span');
							var myIndex = parseInt($(this).attr('header-index'));
							var items = Me._items;
							var rows = [];
							var trs = [];
							div.find('.item').remove();
							for(var j in items) {
								var tr = items[j].objectTr;
								var tdList = tr.find('td').toArray();
								var tmp = [];
								tmp.push(parseInt(tr.attr('row-index')));
								for(var h in tdList) {
									tmp.push($(tdList[h]).html());
								}
								rows.push(tmp);
								tr.hide();
							}
							alphaCompareIndex = myIndex + 1;
							rows.sort(alphaCompare);
							for(var r in rows) {
								var temp_tr = Me._items[rows[r][0]];
								trs.push(temp_tr);
								table.find('tr[row-index="' + rows[r][0] + '"]').remove();
							}
							/* Re-Create objectTr and objectItem to redraw */
							for(var k in trs) {
								Me.addItem(trs[k]);
							}
							Me._items = trs;
							
							if( sortIcon.hasClass('icon-sort-alpha-asc') ) {
								sortIcon.removeClass('icon-sort-alpha-asc');
								sortIcon.addClass('icon-sort-alpha-desc');
							} else {
								sortIcon.removeClass('icon-sort-alpha-desc');
								sortIcon.addClass('icon-sort-alpha-asc');
							}

						});
					}
				}
				if( Me._options ) tr.append('<td>' + (Me._optionsLabel.length > 0 ? Me._optionsLabel : '') + '</td>');
				table.append(tr);
			}
		});
	},
	addItem: function( row ) {
		var Me = this;
		var _row = $.extend({
			id: 0,
			selected: false,
			options: null,
			attr: [],
			foreColor: '#000',
		},row);

		var i = new ListViewRow({
			id: _row.id,
			selected: _row.selected,
			options: _row.options,
			attr: _row.attr,
			foreColor: _row.foreColor,
			items: _row.items
		});

		this._items.push(i);

		if( !Me._multipleSelect && _row.selected ) Me.clearSelection();

		var table = this.objectData.element.find('table.listViewTable');
		var rowIndex = table.find('tr').toArray().length - 1;
		var list = this.objectData.element.find('div.listView');
		var item = i.createObjectItem(rowIndex);
		var tr = i.createObjectRow(rowIndex);

		item.append('<div class="h2Container"><h2>' + (this._selectable ? '<span class="checkIcon icon-checkmark"></span>' : '') + row.items[0] + '</h2></div>');
		item.append('<div class="clear"></div>');

		if( this._selector ) tr.append('<td class="selector"><span class="checkIcon icon-checkmark"></span></td>');

		for(var i in row.items) {
			var index = parseInt(i);
			tr.append('<td>' + row.items[i] + '</td>');
			if(index > 0 && this._headers[i].showOnList) {
				if( this.splitBefore ) item.append('<div class="split"></div>');
				item.append('<div class="info"><span class="infoLabel">' + this._headers[i].listLabel + ':</span> ' + row.items[i] + '</div>');
				if( this.splitAfter ) item.append('<div class="split"></div>');
			}
		}

		if( this._options ) tr.append('<td></td>');

		if( _row.options != null ) {
			item.append('<div class="split"></div>');
			for(var i in _row.options) {
				_row.options[i].id = _row.id;
				_row.options[i].index = rowIndex;
				_row.options[i].draw(tr.find('td').last());
				_row.options[i].draw(item, true);
			}
		}

		table.append(tr);
		list.append(item);

		if( this._selectable ) {
			tr.click(function() {
				Me.selectItem( rowIndex );
			});
			item.click(function() {
				Me.selectItem( rowIndex );
			});
		}
	},
	removeSelected: function() {
		var items = this.objectData.element;
		items.find('div.listView').find('.item').each(function() {
			if($(this).hasClass('item-selected')) $(this).remove();
		});
		items.find('table.listViewTable').find('tr').each(function() {
			if($(this).hasClass('selected')) $(this).remove();
		});
	},
	removeItemById: function(id) {
		var items = this.objectData.element;
		items.find('div.listView').find('.item[row-id="' + id + '"]').remove();
		items.find('table.listViewTable').find('.tr[row-id="' + id + '"]').remove();
	},
	clearSelection: function() {
		var items = this.objectData.element;
		items.find('div.listView').find('.item').each(function() {
			$(this).removeClass('item-selected');
			$(this).attr('is-selected','0');
		});
		items.find('table.listViewTable').find('tr').each(function() {
			$(this).removeClass('selected');
			$(this).attr('is-selected','0');
		});
	},
	selectItem: function( rowIndex ) {
		var table = this.objectData.element.find('table.listViewTable');
		var items = this.objectData.element.find('div.listView');
		var tr = table.find('tr[row-index="' + rowIndex + '"]');
		var item = items.find('div.item[row-index="' + rowIndex + '"]');
		
		var is_selected = parseInt( tr.attr('is-selected') );
		
		if( !this._multipleSelect ) this.clearSelection();
		
		if( is_selected ) {
			tr.removeClass('selected');
			item.removeClass('item-selected');
			tr.attr('is-selected', '0');
			item.attr('is-selected', '0');
		} else {
			tr.addClass('selected');
			item.addClass('item-selected');
			tr.attr('is-selected', '1');
			item.attr('is-selected', '1');
		}
	},
	selectID: function( id ) {
		var table = this.objectData.element.find('table.listViewTable');
		var items = this.objectData.element.find('div.listView');
		var tr = table.find('tr[row-id="' + id + '"]');
		var item = items.find('div.item[row-id="' + id + '"]');
		
		var is_selected = parseInt( tr.attr('is-selected') );
		
		if( !this._multipleSelect ) this.clearSelection();
		
		if( is_selected ) {
			tr.removeClass('selected');
			item.removeClass('item-selected');
			tr.attr('is-selected', '0');
			item.attr('is-selected', '0');
		} else {
			tr.addClass('selected');
			item.addClass('item-selected');
			tr.attr('is-selected', '1');
			item.attr('is-selected', '1');
		}
	},
	selectedItems: function() {
		var table = this.objectData.element.find('table.listViewTable');
		var selected = [];
		table.find('tr[is-selected="1"]').each(function() {
			selected.push( $(this).attr('row-index') );
		});
		return( selected );
	},
	selectedIDs: function() {
		var table = this.objectData.element.find('table.listViewTable');
		var selected = [];
		table.find('tr[is-selected="1"]').each(function() {
			if( $(this).attr('row-id') != '0' ) selected.push( $(this).attr('row-id') );
		});
		return( selected );
	},
	clear: function() {
		var table = this.objectData.element.find('table.listViewTable');
		table.find('tr').not(':first').each(function() {
			$(this).remove();
		});
		this.objectData.element.find('div.listView').find('.item').remove();
	},
	items: function() {
		return this._items;
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* CommandButton Class */
var CommandButton = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 2,
			/* CommandButton Properties */
			icon: null,
			label: 'Button',
			ui: 'default',
			/* CommandButton Events */
			onClick: null
		},args);
		var Me = this;
		this._icon = settings.icon;
		this._label = settings.label;
		this._ui = settings.ui;
		this._enabled = true;
		this._onClick = settings.onClick;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<a class="button ui-button-' + settings.ui + '" href="javascript:void(0)">' + (settings.icon != null ? '<span class="icon icon-' + settings.icon + '"></span>' : '') + '<span>' + settings.label + '</span></a>');
				return(el);
			},
			onCreate: function( obj ) {
				if( $.isFunction(Me._onClick) ) {
					obj.click(function(e) {
						Me._onClick( Me, e );
					});
				}
			}
		});
	},
	icon: function(v) {
		if( typeof v != 'undefined' ) {
			if( this._icon != null ) {
				this.objectData.element.find('.icon').removeClass('icon-' + this._icon);
				this.objectData.element.find('.icon').addClass('icon-' + v);
			} else {
				this.objectData.element.find('span').last().before('<span class="icon icon-' + v + '"></span>');
			}
			this._icon = v;
			return(v);
		} else {
			return(this._icon);
		}
	},
	label: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.find('span').last().html(v);
			this._label = v;
			return(v);
		} else {
			return(this._label);
		}
	},
	ui: function(v) {
		if( typeof v != 'undefined' ) {
			this.objectData.element.removeClass('ui-button-' + this._ui);
			this.objectData.element.addClass('ui-button-' + v);
			this._ui = v;
			return(v);
		} else {
			return(this._ui);
		}
	},
	bounce: function() {
		this.objectData.element.css('position','relative');
		this.objectData.element.animate({
			top: '-=5px'
		},100,function() {
			$(this).animate({
				top: '+=5px'
			},100);
		});
	},
	enable: function() {
		var Me = this;
		if(this._enabled) return;
		this.objectData.element.css('opacity','1');
		this.objectData.element.css('cursor', 'default');
		if( $.isFunction(this._onClick) ) {
			this.objectData.element.click(function(e) {
				Me._onClick(Me,e);
			});
		}
		this._enabled = true;
	},
	disable: function() {
		var Me = this;
		if(!this._enabled) return;
		this.objectData.element.css('opacity','0.5');
		this.objectData.element.css('cursor', 'not-allowed');
		this.objectData.element.unbind('click');
		this._enabled = false;
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* CheckBox Class */
var CheckBox = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 4,
			/* CheckBox Properties */
			icon: null,
			label: 'CheckBox',
			checked: true,
			checkedValue: 1,
			uncheckedValue: 0,
			/* CheckBox Events */
			onChange: null
		},args);
		var Me = this;
		this._icon = settings.icon;
		this._label = settings.label;
		this._checkedValue = settings.checkedValue;
		this._uncheckedValue = settings.uncheckedValue;
		this._onChange = settings.onChange;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="checkBoxContainer"></div>');
				el.append('<div class="checkBoxHandler"></div>');
				el.find('.checkBoxHandler').append('<div class="checkBoxNo"><span class="icon-cross"></span></div>');
				el.find('.checkBoxHandler').append('<div class="checkBoxYes"><span class="icon-checkmark"></span></div>');
				el.find('.checkBoxHandler').append('<div class="bullet" style="left:' + (settings.checked ? '0' : '30') + 'px"></div>');
				el.append('<div class="checkBoxLabel">' + settings.label + '</div>');
				el.append('<input type="hidden" value="' + (settings.checked ? '1' : '0') + '" />');
				return(el);
			},
			onCreate: function( obj ) {
				obj.click(function(e) {
					var is_checked = obj.find('input[type="hidden"]').val();
					
					if( is_checked == "1" ) {
						obj.find('.bullet').animate({left:'+=30px'});
						obj.find('input[type="hidden"]').val('0');
					} else {
						obj.find('.bullet').animate({left:'-=30px'});
						obj.find('input[type="hidden"]').val('1');
					}

					if( $.isFunction(Me._onChange) ) {
						Me._onChange(Me, e);
					}

				});
			}
		});
	},
	check: function() {
		var obj = this.objectData.element;
		if(this.checked()) return;
		if( obj.find('input').val() == "1" ) return;
		obj.find('.bullet').animate({left:'-=30px'});
		obj.find('input[type="hidden"]').val('1');
	},
	uncheck: function() {
		var obj = this.objectData.element;
		if(!this.checked()) return;
		if( obj.find('input').val() == "0" ) return;
		obj.find('.bullet').animate({left:'+=30px'});
		obj.find('input[type="hidden"]').val('0');
	},
	checked: function() {
		var obj = this.objectData.element;
		if( obj.find('input').val() == "0" ) return(false); else return(true);
	},
	val: function() {
		return( (this.checked() ? this._checkedValue : this._uncheckedValue) );
	},
	dbVal: function() {
		return(this.val());
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* RadioBox Class */
var RadioBox = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			dataColumn: null,
			/* RadioBox Properties */
			items: [
				[1, 'A'],
				[2, 'B'],
				[3, 'C']
			]
			/* RadioBox Events */
		},args);
		var Me = this;
		this._value = 0;
		this._items = settings.items;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			dataColumn: settings.dataColumn,
			elementHtml: function() {
				var el = $('<div class="checkBoxContainer"></div>');
				el.append('<div class="radioBoxHandler"></div>');
				for(var i in Me._items) {
					el.find('.radioBoxHandler').append('<div item-value="' + Me._items[i][0] + '" class="radioBoxItem">' + Me._items[i][1] + '</div>');
				}
				return(el);
			},
			onCreate: function( obj ) {
				obj.find('.radioBoxItem').each(function() {
					$(this).width( (100 / Me._items.length) + '%');
				});
				obj.find('.radioBoxItem').last().width( obj.find('.radioBoxItem').last().width() - Me._items.length );
				obj.find('.radioBoxItem').click(function() {
					var v = parseInt( $(this).attr('item-value') );
					Me.clearSelection();
					$(this).addClass('radioBoxItem_Selected');
					Me._value = v;
				});
			}
		});
	},
	clearSelection: function() {
		var el = this.objectData.element;
		el.find('.radioBoxItem').each(function() {
			$(this).removeClass('radioBoxItem_Selected');
		});
	},
	val: function(v) {
		var el = this.objectData.element;
		if( typeof v != 'undefined') {
			this._value = v;
			this.clearSelection();
			el.find('.radioBoxItem[item-value="' + v + '"]').addClass('radioBoxItem_Selected');
			return(v);
		} else {
			return(this._value);
		}
	},
	dbVal: function() {
		return(this.val());
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* InfoBox Class */
var InfoBox = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			/* RadioBox Properties */
			ui: 'default',
			icon: 'warning',
			title: wack.taxonomy.alert_title,
			contents: '...',
			hideLink: true
		},args);
		var Me = this;
		this._ui = settings.ui;
		this._icon = settings.icon;
		this._title = settings.title;
		this._contents = settings.contents;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="infoBox"></div>');
				el.append('<div class="ui-info-' + settings.ui + '"></div>');
				el.find('div').first().append('<span class="infoBoxIcon icon-' + settings.icon + '"></span>');
				el.find('div').first().append('<div class="infoBoxContents"><div class="infoBoxTitle">' + settings.title + '</div><p>' + settings.contents + '</p>' + (settings.hideLink ? '<p class="alignRight"><a hideLink href="javascript:void(0)">Ocultar</a></p>' : '') + '</div>');
				return(el);
			},
			onCreate: function( obj ) {
				obj.find('.infoBoxIcon').css('height', obj.height() + 'px !important');
				obj.find('.infoBoxIcon').css('line-height', obj.height() + 'px');
				obj.find('a[hideLink]').click(function() {
					Me.hide();
				});
			}
		});
	},
	ui: function(v) {
		if( typeof v != 'undefined' ) {
			var el = this.objectData.element;
			el.find('.ui-info-' + this._ui).addClass('ui-info-' + v);
			el.find('.ui-info-' + this._ui).removeClass('ui-info-' + this._ui);
			this._ui = v;
			return(v);
		} else {
			return(this._ui);
		}
	},
	icon: function(v) {
		var obj = this.objectData.element;
		if( typeof v != 'undefined' ) {
			var icon = obj.find('.infoBoxIcon');
			icon.addClass('icon-' + v);
			icon.removeClass('icon-' + this._icon);
			this._icon = v;
			return(v);
		} else {
			return(this._icon);
		}
	},
	title: function(v) {
		var obj = this.objectData.element;
		if( typeof v != 'undefined' ) {
			var title = obj.find('.infoBoxTitle');
			title.html(v);
			this._title = v;
			return(v);
		} else {
			return(this._title);
		}
	},
	contents: function(v) {
		var obj = this.objectData.element;
		if( typeof v != 'undefined' ) {
			var p = obj.find('p').first();
			p.html(v);
			this._contents = v;
			this.update();
			return(v);
		} else {
			return(this._contents);
		}
	},
	hide: function() {
		var obj = this.objectData.element;
		obj.animate({
			opacity: 0
		},250,function() {
			$(this).parent().parent().hide();
		});
	},
	show: function() {
		var obj = this.objectData.element;
		obj.css('opacity','100');
		obj.parent().parent().show('scale');
	},
	update: function() {
		var obj = this.objectData.element;
		obj.find('.infoBoxIcon').css('height', obj.height() + 'px !important');
		obj.find('.infoBoxIcon').css('line-height', obj.height() + 'px');
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
});

/* RichTextEditor Class */
var RichTextEditor = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			/* RichTextEditor Properties */
			toolbar: [
				['file-empty', 'Limpar', 'action_clear'],
				['bold', 'Negrito', 'action_bold'],
				['italic', 'Itálico', 'action_italic'],
				['underline', 'Sublinhado'],
				['strikethrough', 'Riscado']
			]
		},args);
		var Me = this;
		this.dt = new Date().getTime();
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="editorContainer"></div>');
				el.append('<div class="pd5"></div>');
				el.find('.pd5').first().append('<div class="toolbar"></div>');
				el.find('.pd5').first().append('<div class="richTextEditor"><div id="' + Me.dt + '" class="pd5" style="height:calc(100% - 10px)" contentEditable="true">...</div></div>');
				for(var i in settings.toolbar) {
					el.find('.toolbar').append('<div item-action="' + settings.toolbar[i][2] + '" class="toolBarItem"><span class="icon-' + settings.toolbar[i][0] + '"></span><span>' + settings.toolbar[i][1] + '</span></div>');
				}
				return(el);
			},
			onCreate: function( obj ) {
				var toolbar = obj.find('.toolbar');
				var editable = obj.find('#' + Me.dt);
				
				editable.blur(function() {
					var sel = window.getSelection();
					var range = sel.getRangeAt(0).cloneRange();
					Me.selectionRange = range;
				});

				toolbar.find('.toolBarItem').each(function() {
					$(this).click(function() {
						var act = $(this).attr('item-action');
						switch(act) {
							case 'action_clear':
								editable.html('');
							break;
							case 'action_bold':
								Me.wrapTag('strong');
							break;
							case 'action_italic':
								Me.wrapTag('i');
							break;
						}
					});
				});
			}
		});
	},
	wrapTag: function(el) {
		var s = document.createElement(el);
		this.selectionRange.surroundContents(s);
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
}); 

/* CustomFieldGroup Class */
var CustomFieldGroup = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			/* CustomFieldGroup Properties */
		},args);
		var Me = this;
		this.dt = new Date().getTime();
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="cfgContainer"></div>');
				el.append('<div class="cfgInside"></div>');
				el.find('.cfgInside').append('<div class="columns"></div><div class="clear"></div>');
				return(el);
			},
			onCreate: function( obj ) {
				this.is_group = true;
			}
		});
	},
	loadGroup: function(group_name) {
		var Me = this;
		var mainDiv = Me.objectData.element.find('.cfgInside');
		if(wack.config.dataSource == 'mysql') {
			$.ajax({
				type: 'POST',
				url: './library/php/ajax/load-custom-field-group.php?dt=' + ( new Date().getTime() ),
				data: {
					group: group_name
				},
				success: function(data) {
					var fields = eval('({' + data + '})');
					var column = 0;
					var module = Me.objectData.element.find('.columns');
					Me.controls = fields;
					for(var i in Me.controls) {
						Me.controls[i].is_custom = true;
						column+= Me.controls[i].objectData._blockSize;
						var col = $('<div class="column col-' + Me.controls[i].objectData._blockSize + '"></div>');
						col.append('<div class="element"></div>');
						col.find('.element').append('<div ' + (column < 12 ? 'class="pdR5"' : '') + '></div>');
						Me.controls[i].objectData.draw( col.find('div').last() );
						module.append(col);
						if( column >= 12 ) column = 0;
					}
				}
			})
		}
	},
	attribute: function(a, v) {
		var el = this.objectData.element;
		if( typeof el.attr(a) != 'undefined' ) {
			if( typeof v != 'undefined' ) {
				el.attr(a, v);
			} else {
				return(el.attr(a));
			}
		} else {
			el.attr(a,v);
			return(v);
		}
	}
}); 

var PictureBox = Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			/* Object Unique Properties */
			src: 'lamp.png',
			imageStyle: 'default',
			boxStyle: 'default',
			boxHeight: '250',
			alignment: 'left'
		},args);

		var Me = this;
		
		this._src = settings.src;
		this._imageStyle = settings.imageStyle;
		this._boxStyle = settings.boxStyle;
		this._boxHeight = settings.boxHeight;
		this._alignment = settings.alignment;

		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			elementHtml: function() {
				var el = $('<div class="pictureBox"></div>');
				var pd = $('<div class="pictureBox_pd"></div>');
				var img = $('<img src="./application/resources/images/' + settings.src + '" />');
				el.height(settings.boxHeight);
				if(settings.imageStyle != 'tiles' && settings.imageStyle != 'repeat-x' && settings.imageStyle != 'repeat-y') {
					pd.append(img);
					if(settings.imageStyle == 'fit-all') {
						img.css('width','100%');
						img.css('height','100%');
					}
					if(settings.imageStyle == 'fit-width') {
						img.css('width','100%');
						img.css('height','auto');
					}
					if(settings.imageStyle == 'fit-height') {
						img.css('width','auto');
						img.css('height','100%');
					}
				} else {
					pd.css('background', 'url(./application/resources/images/' + settings.src + ')');
					if(settings.imageStyle == 'repeat-x' || settings.imageStyle == 'repeat-y') pd.css('background-repeat', settings.imageStyle);
				}
				pd.css('text-align', settings.alignment);
				el.append(pd);
				return(el);
			},
			onCreate: function(obj) {
			}
		});
	},
	src: function(v) {
		if(typeof v != 'undefined') {
			this._src = v;
			if(this._imageStyle != 'tiles' && this._imageStyle != 'repeat-x' && this._imageStyle != 'repeat-y') {
				this.objectData.element.find('img').attr('src', './application/resources/images/' + v);
			} else {
				this.objectData.element.find('.pictureBox_pd').css('background', 'url(./application/resources/images/' + v + ')');
			}
			return(v);
		} else {
			return(this._src);
		}
	}
});

/* FileUploader Class */
var FileUploader = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			attributes: [],
			/* FileUploader Properties */
			autoUpload: true,
			multiple: true,
			/* TextBox Events */
		},args);
		var Me = this;
		this._autoUpload = settings.autoUpload;
		this._multiple = settings.multiple;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			attributes: settings.attributes,
			elementHtml: function() {
				var inputContainer = $('<div class="inputContainer"></div>');
				var label = $('<div class="label"><span class="icon-folder-upload" style="margin-right:10px"></span>Arquivo(s)</div>');
				var textbox = $('<input type="text" placeholder="Nenhum arquivo para enviar" disabled="disabled" />');
				inputContainer.append(label);
				inputContainer.append(textbox);
				inputContainer.append('<input style="width:0px;height:0px;float:left" type="file" ' + (settings.multiple ? 'multiple="multiple"' : '') + ' />');
				return(inputContainer);
			},
			onCreate: function( obj ) {
				var w = obj.width();
				var textbox = obj.find('input[type="text"]').first();
				var label = obj.find('.label').first();
				var _file = obj.find('input[type="file"]').first();
				w-= label.width();
				w-=44;
				textbox.width(w);

				label.click(function() {
					obj.find('input[type="file"]').first().trigger('click');
				});
				textbox.click(function() {
					obj.find('input[type="file"]').first().trigger('click');
				});
				if(Me._autoUpload) {
					_file.on('change', function() {
						var file_data = $(this).prop('files');
						var form_data = new FormData();
						textbox.val(file_data.length + ' arquivo(s) selecionado(s)');
						$.each(file_data, function(key, value) {
					        form_data.append(key, value);
					    });
						showLoader("Enviando Arquivos");
						setTimeout(function() {
							$.ajax({
								url: './library/php/ajax/upload-files.php?dt=' + (new Date().getTime()),
								dataType: 'text',
								cache: false,
								contentType: false,
								processData: false,
								data: form_data,
								type: 'POST',
								success: function(uploadData) {
									hideLoader();
									textbox.val(file_data.length + ' arquivo(s) enviado(s) com sucesso!');
								}
							});
						},1000);
					});
				}
			}
		});
	},
});

var Label = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Common Properties */
			blockSize: 4,
			attributes: [],
			/* Label Properties */
			label: 'Label',
			alignment: 'left'
		},args);
		var Me = this;
		this._label = settings.label;
		this._alignment = settings.alignment;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			attributes: settings.attributes,
			elementHtml: function() {
				var div = $('<div class="simpleLabel"></div>');
				return(div);
			},
			onCreate: function(obj) {
				obj.append('<span>' + settings.label + '</span>');
				obj.css('text-align', settings.alignment);
			}
		});
	}
});

/* Graph Class */
var _Chart = new Class({
	initialize: function(args) {
		var settings = $.extend({
			/* Object Common Properties */
			blockSize: 12,
			attributes: [],
			/* Chart Properties */
			chartID: 'myChart',
			autoRender: false,
			data: null,
			height: 320
			/* Chart Events */
		},args);
		var Me = this;
		this.ctx = null;
		this.chart = null;
		this.chartID = settings.chartID;
		this._data = settings.data;
		this.objectData = new WackObject({
			blockSize: settings.blockSize,
			attributes: settings.attributes,
			elementHtml: function() {
				var canvas = $('<div class="chartCanvas"></div>');
				canvas.height( settings.height );
				canvas.append('<canvas></canvas>');
				return(canvas);
			},
			onCreate: function( obj ) {
				obj.find('canvas').attr('width',obj.width());
				obj.find('canvas').attr('height',obj.height());
				obj.find('canvas').attr('id', Me.chartID);
				if(settings.autoRender) Me.render();
			}
		});
	},
	render: function(data) {
		if(typeof data == "undefined") data = this._data;
		this.ctx = document.getElementById(this.chartID);
		this.chart =  new Chart(this.ctx, data);
	},
	update: function() {
		this.render();
	}
});