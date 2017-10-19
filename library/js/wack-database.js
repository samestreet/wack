function importContentType(content) {
	$.ajax({
		url: './application/database/schema/' + content + '.content?dt=' + (new Date().getTime()),
		success: function(contentData) {
			var result = eval('(' + contentData + ')');
			wackAjax('POST','create-content-type',{cData:result},function(data) {
			});
		}
	});
}

function migrateContentType(content) {
	$.ajax({
		url: './application/database/migration/' + content + '.migration?dt=' + (new Date().getTime()),
		success: function(data) {
			var result = eval(data);
			wackAjax('POST', 'migrate-content-type', {content: content, cData: result}, function(migrationData) {
			});
		}
	})
}

/* Query Format:
	query: [
		[
			['F.field == value'],
			['F.another_field == value']
		],
		[
			['ContentTitle == value'],
			['F.some_field LIKE value'],
			['F.numeric_field >= 1'],
			['F.date_field BETWEEN 2017-07-01,2017-07-20']
		],
		[
			['ContentCreation == TODAY'],
			['ContentUpdate >= TODAY'],
			['ContentID == 1']
		]
	]
*/
function getContent(args) {
	var settings = $.extend({
		contentType: null,
		contentIDs: [],
		query: null,
		onLoad: null,
		orderBy: null,
		references: null
	},args);

	var content;
	
	// If settings.contentType is null, throw error
	if( settings.contentType == null ) {
		messageBox({
			ui: 'error',
			icon: 'cancel-circle',
			title: 'WACK Error',
			contents: '(getContent) Error: Parameter contentType cannot be null!'
		});
		return;
	}

	var data = {
			contentType: settings.contentType,
			contentIDs: settings.contentIDs,
			query: settings.query,
			orderBy: settings.orderBy,
			references: settings.references,
			user: wack.user.id,
			mode: wack.config.dataMode
	};

	wackAjax('POST', 'get-content', data, function(data) {
		var result = eval('(' + data + ')');
		// Check if data.error is different than zero (throw error if necessary)
		if( typeof result.error != 'undefined' ) {
			messageBox({
				ui: 'error',
				icon: 'cancel-circle',
				title: 'Query Error',
				contents: '(getContent) Query Error: ' + result.message
			});
			return;
		}
		// Once we have the retrieved data, we apply '[content_type].config.query' into data
		var dbConfig = eval('wack.database.schemaConfig.' + settings.contentType + '.query');
		if( $.isFunction(dbConfig) ) result = dbConfig(result);
		if( $.isFunction(settings.onLoad) ) settings.onLoad(result);
	});
}

function deleteContent(args) {
	var settings = $.extend({
		contentType: null,
		contentIDs: [],
		done: null
	},args);

	if( settings.contentType == null ) {
		messageBox({
			ui: 'error',
			icon: 'cancel-circle',
			title: 'WACK Error',
			contents: '(deleteContent) Error: Parameter contentType cannot be null!'
		});
		return;
	}
	if( settings.contentIDs.length == 0 ) {
		messageBox({
			ui: 'warning',
			icon: 'warning',
			title: 'Delete Content',
			contents: '(deleteContent) Warning: Nothing to delete!'
		});
		return;
	}
	
	showLoader("...")
	var data = {
		contentType: settings.contentType,
		contentIDs: settings.contentIDs
	};
	wackAjax('POST', 'delete-data', data, function(data) {
		var r = eval('(' + data + ')');
		hideLoader();
		if($.isFunction(settings.done)) settings.done(data);
	});
}