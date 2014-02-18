
var tests = ['test1.php', 'test2.php'];

var t = 0;

function callTest(url) {
	var request = {
		request: {url: url},
		response: {headers: []}
	};

	var r = $.ajax({
		url: url,
		type: 'GET',
		beforeSend: function(xhr){xhr.setRequestHeader('X-FirePHP-Version', '0.7.4');},
		success: function(data, textStatus, req) {
			var h = r.getAllResponseHeaders().split('\n');
			for (var i=0;i<h.length;i++) {
				var c = h[i].indexOf(':');
				request.response.headers.push({name: h[i].substring(0, c), value: h[i].substring(c+2)});
			}
			panelFirePHP.addNetworkRequest(request);			
			if (++t < tests.length) callTest(tests[t]);
			else panelFirePHP.onSelectRequest(0);
		}
	});	
}

//hadError = false; window.onerror = function(msg, url, line){ if (!hadError) { hadError = true; alert(msg+' '+url+':'+line); }};

$(function(){
	panelFirePHP.init();
	callTest(tests[t]);
});
