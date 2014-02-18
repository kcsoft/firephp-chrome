
var firePHP = {
	options: {
		useUserAgent: true,
		firePHPVersion: '0.7.4'
	},

	onConnect: function(port) {
		var devToolsTab = {
			tabId: parseInt(port.name),

			onMessage: function(message, sender, sendResponse) {
			},

			onBeforeSendHeaders: function(details) {
				if (details.tabId == devToolsTab.tabId) {
					if (firePHP.options.useUserAgent) {
						for (var i=0;i<details.requestHeaders.length;i++) {
							if (details.requestHeaders[i].name.toLowerCase() == 'user-agent') {
								if (details.requestHeaders[i].value.indexOf('FirePHP') < 0)
									details.requestHeaders[i].value += ' FirePHP/' + firePHP.options.firePHPVersion;
								break;
							}
						}
					} else {
						details.requestHeaders.push({name: 'X-FirePHP-Version', value: firePHP.options.firePHPVersion});
					}
				}
				return {requestHeaders: details.requestHeaders};
			},

			onTabUpdate: function(tabId, changeInfo, tab) {
				if (tabId == devToolsTab.tabId) {
					if (changeInfo.status == 'loading') {
						port.postMessage({method: 'onTabLoad', param: {}});
					}
				}
			},
			
			onDisconnect: function() {
				chrome.webRequest.onBeforeSendHeaders.removeListener(devToolsTab.onBeforeSendHeaders);
				chrome.tabs.onUpdated.removeListener(devToolsTab.onTabUpdate);
				port.onMessage.removeListener(devToolsTab.onMessage);
				port.onDisconnect.removeListener(devToolsTab.onDisconnect);
			}
		};

		chrome.webRequest.onBeforeSendHeaders.addListener(devToolsTab.onBeforeSendHeaders, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);
		chrome.tabs.onUpdated.addListener(devToolsTab.onTabUpdate);
		port.onMessage.addListener(devToolsTab.onMessage);
		port.onDisconnect.addListener(devToolsTab.onDisconnect);
	}
};

chrome.runtime.onConnect.addListener(firePHP.onConnect);

