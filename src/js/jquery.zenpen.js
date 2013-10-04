/*
 *  jQuery ZenPen
 *
 *  Copyright (c) 2013 Deux Huit Huit (http://www.deuxhuithuit.com/)
 *  Licensed under the MIT (http://deuxhuithuit.mit-license.org)
 *  Based on the work of Tim Holman (https://github.com/tholman/zenpen)
 *  Licensed under the Apache License (https://github.com/tholman/zenpen/blob/master/licence.md)
 */
 
(function ($) {
	
	if (!!$.zenpen) {
		return;	
	}
	
	var counter = 0;
	
	var getSelection = function () {
		if (!!window.getSelection) {
			return window.getSelection();
		} else if (!!document.selection) {
			return document.selection;
		}
		console.error('No selection API found');
	};
	
	var focus = function (elem) {
		var range = document.createRange();
		var selection = getSelection();
		range.setStart(elem.get(0), 1);
		selection.removeAllRanges();
		selection.addRange(range);
	};
	
	var rehighlightLastSelection = function (lastRange) {
		if (!!lastRange) {
			var selection = getSelection();
			selection.removeAllRanges();
			selection.addRange( lastRange );
		}
	}
	
	var execCommandFactory = function () {
		var a = arguments;
		return function (btn, popup, lastSelection) {
			document.execCommand.apply(document, a);	
		};	
	};
	
	var createButtonFactory = function (cla, text, key) {
		return createButton = function () {
			var b = $('<button />').addClass(cla).html(text);
			if (!!key) {
				b.attr('data-key',key);
			}
			return b;
		};
	};
	
	var eachActions = function (actions, cb) {
		$.each(actions, function (i, a) {
			if (!!a) {
				var action = $.zenpen.actions[a];
				if (!!action) {
					cb(action, i, a);
				} else {
					console.info('Action '+ a +' does not exists in `$.zenpen.actions`');
				}
			}
		});
	};
	
	var createPopUp = function (options) {
		var popup = $('<div />').addClass('zenpen-panel');
		var poptions = $('<div />').addClass('zenpen-options');
		eachActions(options.actions, function (action, i, a) {
			poptions.append(action.create(options));
		});
		return popup.append(poptions);
	};
	
	var zenpen = function (options) {
		return function init(index, elem) {
			elem = $(elem);
			
			var id = (++counter);
			var namespace = '.zenpen-' + id;
			var popup = createPopUp(options);
			var popupOpts = popup.find('.zenpen-options');
			var wrap = $('<div />').addClass('zenpen-wrap');
			var scrollTimeout = 0;
			var lastSelection;
			var lastMovePos = {x:0,y:0};
			
			var checkTextHighlighting = function (e) {
				var t = $(e.target);
				var selection = getSelection();
				var selectedText = selection.toString();
				
				console.log(t, selection.isCollapsed, selectedText, selection);
		
				if ( t.is('input, textarea, button, *[contenteditable="true"]') ) {
		
					//currentNodeList = findNodes( selection.focusNode );
					updateBubbleStates();
				}
		
				// Check selections exist
				else if ( selection.isCollapsed || !selectedText) {
		
					onSelectorBlur();
				}
		
				// Text is selected
				else if ( !selection.isCollapsed && !!selectedText) {
					
					lastMovePos.x = e.clientX;
					lastMovePos.y = e.clientY;
		
					//currentNodeList = findNodes( selection.focusNode );
		
					// Find if highlighting is in the editable area
					//if ( hasNode( currentNodeList, "ARTICLE") ) {
						updateBubbleStates();
						updateBubblePosition();
					
						// Show the ui bubble
						//textOptions.className = "text-options active";
						popup.addClass('active');
					//}
					
					// preverse selection object
					lastSelection = selection;
				}
				
			};

			var updateBubblePosition = function () {
				var selection = getSelection();
				var range = selection.getRangeAt(0);
				var boundary = range.getBoundingClientRect();
				
				popup.css({
					top: boundary.top - popupOpts.height()*1.4,// - 5 + window.pageYOffset + "px",
					left: lastMovePos.x - popupOpts.width()/2, //(boundary.left)// + boundary.right)/2 + "px"
					width: (function () {
						var sum = options.actions.length;
						eachActions(options.actions, function (action, i, a) {
							var btn = popupOpts.find('*[data-key="'+a+'"]');
							sum += btn.outerWidth(true);
						});
						return sum;
					})()
				});
			};
		
			var updateBubbleStates = function () {
				if (!lastSelection) {
					return;
				}
				eachActions(options.actions, function (action, i, a) {
					var btn = popupOpts.find('*[data-key="'+a+'"]');
					var fx = action.validNode($(lastSelection.focusNode)) ? 'addClass' : 'removeClass';
					btn[fx]('active');
				});
			};
		
			var onSelectorBlur = function () {
				
				if (popup.hasClass('active') && !popup.hasClass('fade')) {
			
					popup.removeClass('active').addClass('fade');
					
					setTimeout( function() {
			
						popup.removeClass('fade');
						
					}, 260 );
				}
			};

			
			elem.wrap(wrap);
			elem.after(popup);
			elem.attr('data-zenpen', id);
			
			elem
				.on('keyup' + namespace, checkTextHighlighting)
				//.on('mousedown' + namespace, checkTextHighlighting)
				//.on('selectstart'+ namespace, checkTextHighlighting)
				//.on('selectionchange'+ namespace, checkTextHighlighting)
				.on('mouseup' + namespace, checkTextHighlighting);
				
			wrap.on('scroll' + namespace, function() {
				if ( !!scrollTimeout ) {
					clearTimeout(scrollTimeout);
					scrollTimeout = 0;
				}
				scrollTimeout = setTimeout(updateBubblePosition, 100);
			});
			
			popup.on('click' + namespace, '*[data-key]', function () {
				var t = $(this);
				var key = t.attr('data-key');
				var action = $.zenpen.actions[key];
				if (!!action) {
					action.exec(t, popup, lastSelection, options);
					updateBubbleStates();
				}
			});
			
			popup.on('update' + namespace, updateBubbleStates);
							
			focus(elem);
		};
	};

	$.fn.zenpen = function (options) {
		options = $.extend(true, {}, $.zenpen.defaults, options);
		
		if (!$.isArray(options.actions)) {
			options.actions = options.actions.split(',');
		}
		
		var t = $(this);
		
		return t.each(zenpen(options));
	};

	$.zenpen = function (target) {
		target = target || $.zenpen.defaults.autoLoadSelector;
		target = $(target);
		target.zenpen();
	};
	
	$.zenpen.actions = {};
		
	$.zenpen.defaults = {
		autoLoad: true,
		autoLoadSelector: '*[contenteditable="true"]',
		actions: 'url,h1,bold,italic,quote'
	};
	
	$.zenpen.api = {
		rehighlightLastSelection: rehighlightLastSelection,
		getSelection: getSelection,
		execCommandFactory: execCommandFactory, 
		createButtonFactory: createButtonFactory
	};
	
	var autoLoad = function () {
		if (!!$.zenpen.defaults.autoLoad) {
			$.zenpen();
		}
		if (!document.execCommand) {
			console.error('Your browser does not support `document.execCommand`');
		}
		if (!getSelection()) {
			console.error('Your browser does not support text selection');
		}
	};
	
	var resize = function () {
		// TODO
	};
	
	$(autoLoad);
	
	$(window).resize(resize);
	
})(jQuery);