
var consoleLog = {
	recurse: function(x, name) {
		var html = '<div>';
		if ((typeof x == 'object') && (x !== null)) {
			html += '<div class="object-title"><div class="inline expand"></div>' + ((name != '')?name:'Object') + '</div>';
			html += '<div class="object-content">';
			for (var i in x)
				html += consoleLog.recurse(x[i], i);
			html += '</div>';
		}else{
			html += ((name != '')?'<div class="inline key">' + name + ':</div>':'') + '<div class="inline value value-'+(x!==null?(typeof x):'null')+'">' + x + '</div>';
		}
		return html + '</div>';
	},

	toHTML: function(obj, name) {
		return '<div class="console-log">' + consoleLog.recurse(obj, name) + '</div>';
	},

	bindEvents: function(selector) {
		$(selector + ' .object-title').on('click', function(){
			$(this).parent().toggleClass('expanded');
		});		
	}
};