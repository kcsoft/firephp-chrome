
var panelFirePHP = {
	token: 'X-Wf-1-1-1-',
	requests: [],
	contentSelector: '.details-sidebar',
	networkSelector: '.network-sidebar',

	init: function() {
		panelFirePHP.clearNetworkRequests();
		$(panelFirePHP.networkSelector).on('click', '.request span', function() {
			$(this).parent().parent().children('.request.active').removeClass('active');
			$(this).parent().addClass('active');
			panelFirePHP.onSelectRequest(parseInt($(this).attr('data-index')));
		});
	},

	typeParse: {
		INFO: function(meta, body) {
			return consoleLog.toHTML(body, ('Label' in meta)?meta.Label:'');
		},
		LOG: function(meta, body) {
			return panelFirePHP.typeParse.INFO(meta, body);
		},
		WARN: function(meta, body) {
			return panelFirePHP.typeParse.INFO(meta, body);
		},
		ERROR: function(meta, body) {
			return panelFirePHP.typeParse.INFO(meta, body);
		},
		TRACE: function(meta, body) {
			return panelFirePHP.typeParse.INFO(meta, body);
		},
		EXCEPTION: function(meta, body) {
			return panelFirePHP.typeParse.INFO(meta, body);
		},
		TABLE: function(meta, body) {
			var tableName  = '';
			if ('Label' in meta) tableName = meta.Label;
			else if ((body.length > 0) && (typeof body[0] == 'string')) {
				tableName = body[0];
				if (body.length > 1) body = body[1];
			}
			var html = '<div class="table-title">' + tableName + '</div>';
			if (body.length > 0) {
				html += '<table><tr>';
				for (var i=0;i<body[0].length;i++)
					html += '<th>' + body[0][i] + '</th>';
				html += '</tr>';
				for (var r=1;r<body.length;r++) {
					html += '<tr>';
					for (var i=0;i<body[r].length;i++)
						html += '<td>' + panelFirePHP.typeParse.INFO({}, body[r][i]) + '</td>';
					html += '</tr>';
				}
				html += '</table>';
			}
			return html;
		},
		GROUP_START: function(meta, body) {
			return '<div class="group-start" data-label="'+meta.Label+'">';
		},
		GROUP_END: function(meta, body) {
			return '</div>';
		}
	},

	setupTabs: function(selector) {
		$(selector + ' .group-start').parent().removeClass('has-tabs').addClass('has-tabs');
		$(selector + ' .has-tabs .group-start').each(function(){
			$(this).addClass('group-start-' + $(this).parent().children('.group-start').index($(this)));
		});
		$(selector + ' .group-start-0').before('<div class="tabs"></div>').addClass('active');
		$(selector + ' .has-tabs .group-start').each(function(){
			$(this).parent().children('.tabs').append('<div class="tab tab-'+$(this).parent().children('.group-start').index($(this))+'">' + $(this).attr('data-label') + '</div>');
		});
		$(selector + ' .tab-0').addClass('active');
		$(selector + ' .tab').on('click', function(){			
			$(this).parent().parent().children('.group-start.active').removeClass('active');
			$(this).parent().parent().children('.group-start-'+$(this).parent().children('.tab').index($(this))).addClass('active');
			$(this).parent().children('.tab.active').removeClass('active');
			$(this).addClass('active');
		});
	},

	onSelectRequest: function(index) {
		var tokenLength = panelFirePHP.token.length;
		var headers = [];

		for (var i=0;i<panelFirePHP.requests[index].response.headers.length;i++) {
			if (panelFirePHP.requests[index].response.headers[i].name.indexOf(panelFirePHP.token) >= 0) {
				var msg = panelFirePHP.requests[index].response.headers[i].value;
				var end = (msg.trim().slice(-1) == '\\')?false:true;
				var headerIndex = parseInt(panelFirePHP.requests[index].response.headers[i].name.substring(tokenLength));
				headers.push({key: headerIndex, value: msg.substring(msg.indexOf('|')+1, msg.lastIndexOf('|')), end: end});
			}
		}
		headers.sort(function(a, b){
			return (a.key > b.key)?1:-1;
		});

		var message = '';
		var html = '<div>';
		for (var i=0;i<headers.length;i++) {
			message += headers[i].value;
			if (headers[i].end) {
				try {
					var result = JSON.parse(message);
					if (typeof result == 'object' && result.length == 2) {
						if (('Type' in result[0]) && (result[0].Type in panelFirePHP.typeParse))
							html += panelFirePHP.typeParse[result[0].Type](result[0], result[1]);
					}
				} catch(e) {
				} finally {
					message = '';
				}
			}
		}
		html += '</div>';

		$(panelFirePHP.contentSelector).html(html);
		panelFirePHP.setupTabs(panelFirePHP.contentSelector);
		consoleLog.bindEvents(panelFirePHP.contentSelector);
	},

	clearNetworkRequests: function() {
		panelFirePHP.requests = [];
		$(panelFirePHP.networkSelector + ', ' + panelFirePHP.contentSelector).html('');
	},

	addNetworkRequest: function(request) {
		var requestIndex = panelFirePHP.requests.length;
		panelFirePHP.requests.push(request);
		var lastIndex = request.request.url.lastIndexOf('/');
		var url = (lastIndex >= 0)?request.request.url.substring(lastIndex + 1):request.request.url;
		if (url == '') url = request.request.url;
		$(panelFirePHP.networkSelector).append('<div class="request" title="' + request.request.url + '"><span data-index="' + requestIndex + '">' + url + '</span></div>');
	}
};

