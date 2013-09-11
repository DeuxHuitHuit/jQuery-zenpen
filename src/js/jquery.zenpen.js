
(function ($) {
	
	if (!!$.zenpen) {
		return;	
	}
	
	var focus = function (elem) {
		var range = document.createRange();
		var selection = window.getSelection();
		range.setStart(elem.get(0), 1);
		selection.removeAllRanges();
		selection.addRange(range);
	};
	
	var createButtonFactory = function (cla, text) {
		return createButton = function () {
			var b = $('<button />').addClass(cla).text(text);
			var ctx = this;
			return b;
		};
	};
	
	var createPopUp = function (actions) {
		var popup = $('<div />').addClass('zenpen-panel');
		var options = $('<div />').addClass('zenpen-options');
		$.each(actions, function (i, a) {
			if (!!a) {
				var action = $.zenpen.actions[a];
				options.append(action.create());
			}
		});
		return popup.append(options);
	};

	$.fn.zenpen = function (options) {
		options = $.extend(true, {}, $.zenpen.defaults, options);
		
		if (!$.isArray(options.actions)) {
			options.actions = options.actions.split(',');
		}
		
		var t = $(this);
		
		var init = function (index, elem) {
			elem = $(elem);
			
			var popup = createPopUp(options.actions);
			var wrap = $('<div />').addClass('zenpen-wrap');
			
			elem.wrap(wrap);
			elem.after(popup);
			
			focus(elem);
		};
		
		t.each(init);
	};

	$.zenpen = function (target) {
		target = target || $.zenpen.defaults.autoLoadSelector;
		target = $(target);
		target.zenpen();
	};
	
	$.zenpen.actions = {
		bold: {
			create: createButtonFactory('bold', 'b'),
			exec: $.noop
		},
		italic: {
			create: createButtonFactory('italic', 'i'),
			exec: $.noop	
		},
		url: {
			create: function () {
				var btn = createButtonFactory('url useicons','&#xe005;')();
				var input = $('<input />').addClass('url-input')
					.attr('type','text')
					.attr('placeholder','Type or Paste URL here');
				
				return btn.add(input);
			},
			exec: $.noop
		},
		quote: {
			create: createButtonFactory('quote', '&rdquo;'),
			exec: $.noop
		}
	};
	
	$.zenpen.defaults = {
		autoLoad: true,
		autoLoadSelector: '*[contenteditable="true"]',
		actions: 'url,bold,italic,quote',
	};
	
	var autoLoad = function () {
		if (!!$.zenpen.defaults.autoLoad) {
			$.zenpen();
		}
	};
	
	$(autoLoad);
	
})(jQuery);