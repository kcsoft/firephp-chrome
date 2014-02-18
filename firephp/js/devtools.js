
var devFirePHP = {
	panel: null,
	bgPagePort: null,
	panelWindow: null,
	extensionId: chrome.i18n.getMessage('@@extension_id'),
	requests: [],

	init: function() {
		devFirePHP.bgPagePort = chrome.runtime.connect({name: chrome.devtools.inspectedWindow.tabId.toString()});
		devFirePHP.bgPagePort.onMessage.addListener(devFirePHP.onMessage);
		devFirePHP.createPanel();
		chrome.devtools.network.onRequestFinished.addListener(devFirePHP.onRequestFinished);
	},

	onMessage: function(message) {
		devFirePHP[message.method](message.param);
	},

	createPanel: function() {
		chrome.devtools.panels.create("FirePHP", "icon_128.png", "panel.html", devFirePHP.onCreatePanel);
	},

	onCreatePanel: function(panel) {
		devFirePHP.panel = panel;
		devFirePHP.panel.onShown.addListener(function(panelWindow) {
			if (!devFirePHP.panelWindow) {
				devFirePHP.panelWindow = panelWindow;
				devFirePHP.panelWindow.panelFirePHP.init();
				for (var i=0;i<devFirePHP.requests.length;i++)
					devFirePHP.panelWindow.panelFirePHP.addNetworkRequest(devFirePHP.requests[i]);
			}
		});
	},

	onTabLoad: function(param) {
		devFirePHP.requests = [];
		if (devFirePHP.panelWindow)
			devFirePHP.panelWindow.panelFirePHP.clearNetworkRequests();
	},

	onRequestFinished: function(request) {
		for (var i=0;i<request.response.headers.length;i++) {
			if (request.response.headers[i].name.indexOf('X-Wf-Protocol') >= 0) {
				if (!devFirePHP.panelWindow)
					devFirePHP.requests.push({request: {url: request.request.url}, response: {headers: request.response.headers}});
				else
					devFirePHP.panelWindow.panelFirePHP.addNetworkRequest({request: {url: request.request.url}, response: {headers: request.response.headers}});
			}
		}
	},
};

devFirePHP.init();