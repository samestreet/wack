var WACK_CHAT = Class({
	start: function() {
		if( wack.config.noLogin ) {
			messageBox({
				icon: 'cancel-circle',
				title: 'W.A.C.K Chat',
				contents: 'Unable to initialize W.A.C.K chat using "noLogin" feature.'
			});
			return;
		}

		var chat_html = '<div class="h1Container"><h1>W.A.C.K Chat</h1></div>';
		chat_html+= '<div class="columns" style="height:calc(100% - 112px)">';
			
			chat_html+= '<div class="toolbar">';
				chat_html+= '<div class="toolBarItem">';
					chat_html+= '<span class="icon-feed"></span>';
					chat_html+= '<span>Online</span>';
				chat_html+= '</div>';
				chat_html+= '<div class="toolBarItem mobileOnly">';
					chat_html+= '<span class="icon-users"></span>';
					chat_html+= '<span>Contatos</span>';
				chat_html+= '</div>';
			chat_html+= '</div>';
			
			chat_html+= '<div class="column col-3 mobileHide" style="height:100%">';
				chat_html+= '<div class="pdR5" style="height:100%; border-right:1px solid #999">';
					chat_html+= '<div class="toolbar">';
						chat_html+= '<div class="toolBarItem">';
							chat_html+= '<span class="icon-users"></span>';
							chat_html+= '<span>Todos</span>';
						chat_html+= '</div>';
						chat_html+= '<div class="toolBarItem">';
							chat_html+= '<span class="icon-switch"></span>';
							chat_html+= '<span>Online</span>';
						chat_html+= '</div>';
						chat_html+= '<div class="toolBarItem">';
							chat_html+= '<span class="icon-star-full"></span>';
							chat_html+= '<span>Favoritos</span>';
						chat_html+= '</div>';
					chat_html+= '</div>';
				chat_html+= '</div>';
			chat_html+= '</div>';

			chat_html+= '<div class="column col-9" style="height:100%;">';
				chat_html+= '<div class="pdL5" style="height:100%">';
					chat_html+= '<div style="height:calc(100% - 49px); border:1px solid #666; background:#fff"></div>';
					chat_html+= '<div style="height:35px; margin-top:10px; background:#fff">';
						chat_html+= '<div class="inputContainer">';
							chat_html+= '<div class="label">Mensagem</div>';
							chat_html+= '<input type="text" id="chat_message" placeholder="Pressione [ENTER] para Enviar" />';
							chat_html+= '<span class="eraser icon icon-cancel-circle"></span>';
						chat_html+= '</div>';
					chat_html+= '</div>';
				chat_html+= '</div>';
			chat_html+= '</div>';

		chat_html+= '</div>';
		chat_html+= '<div class="clear"></div>';

		modalWindow({
			width: $('.workspace').width(),
			height: $('.workspace').height(),
			contents: chat_html,
			onLoad: function(w) {
				$('.inputContainer').each(function() {
					var textbox = $(this).find('input').first();
					var label = $(this).find('.label').first();
					var icon = $(this).find('.actionIcon').toArray().length;
					var eraser = $(this).find('.eraser').toArray().length;
					var w;

					textbox.css('width','100%');
					w = textbox.width();
					w-= label.width();
					if( icon > 0 ) w-=35;
					if( eraser > 0 ) w-=35;
					w-=40;
					textbox.width( w );
				});
			}
		});
	}
});

wack.extension.chat = new WACK_CHAT();