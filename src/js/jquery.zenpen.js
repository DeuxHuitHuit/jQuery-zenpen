
(function ($) {
	
	if (!!$.zenpen) {
		return;	
	}
	
	var counter = 0;
	
	var log = !!window.console ? console.error || console.log : window.alert;
	
	var getSelection = function () {
		if (!!window.getSelection) {
			return window.getSelection();
		} else if (!!document.selection) {
			return document.selection;
		}
		log('No selection API found');
	};
	
	var focus = function (elem) {
		var range = document.createRange();
		var selection = getSelection();
		range.setStart(elem.get(0), 1);
		selection.removeAllRanges();
		selection.addRange(range);
	};
	
	rehighlightLastSelection function (lastSelection) {
		if (!!lastSelection) {
			var selection = getSelection();
			selection.removeAllRanges();
			selection.addRange( lastSelection.getRangeAt(0) );
	}
	
	var parseHtmlEntity = function (he) {
		return $('<div />').html(he).text();	
	};
	
	var execCommandFactory = function () {
		var a = arguments;
		return execCommand = function () {
			document.execCommand(a);	
		};	
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
			} else {
				console.error('Action %s does not exists in `$.zenpen.actions`', a);
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
			
			var id = (++counter);
			var namespace = '.zenpen-' + id;
			var popup = createPopUp(options.actions);
			var popupOpts = popup.find('.zenpen-options');
			var wrap = $('<div />').addClass('zenpen-wrap');
			var scrollTimeout = 0;
			var lastSelection = null;
			var lastMovePos = {x:0,y:0};
			var currentNode = $();
			
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
				else if ( selection.isCollapsed && !selectedText) {
		
					onSelectorBlur();
				}
		
				// Text is selected
				else if ( !selection.isCollapsed ) {
					
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
				}
		
				// preverse selection object
				lastSelection = selection;
			};

			var updateBubblePosition = function () {
				var selection = getSelection();
				var range = selection.getRangeAt(0);
				var boundary = range.getBoundingClientRect();
				
				popup.css({
					top: boundary.top - popupOpts.height()*1.4,// - 5 + window.pageYOffset + "px",
					left: lastMovePos.x - popupOpts.width()/2 //(boundary.left)// + boundary.right)/2 + "px"
				});
			};
		
			var updateBubbleStates = function () {
		
				var update = function (mustHave) {
					
				};
		
				/*if ( currentNode.closest('b').length ) {
					boldButton.className = "bold active"
				} else {
					boldButton.className = "bold"
				}
		
				if ( hasNode( currentNodeList, 'I') ) {
					italicButton.className = "italic active"
				} else {
					italicButton.className = "italic"
				}
		
				if ( hasNode( currentNodeList, 'BLOCKQUOTE') ) {
					quoteButton.className = "quote active"
				} else {
					quoteButton.className = "quote"
				}
		
				if ( hasNode( currentNodeList, 'A') ) {
					urlButton.className = "url useicons active"
				} else {
					urlButton.className = "url useicons"
				}*/
			};
		
			var onSelectorBlur = function () {
				
				if (popup.hasClass('active') && !popup.hasClass('fade')) {
			
					popup.removeClass('active').addClass('fade');
					
					setTimeout( function() {
			
						popup.removeClass('fade').css({top:'',left:''});
						
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
							
			focus(elem);
		};
		
		return t.each(init);
	};

	$.zenpen = function (target) {
		target = target || $.zenpen.defaults.autoLoadSelector;
		target = $(target);
		target.zenpen();
	};
	
	$.zenpen.actions = {
		bold: {
			create: createButtonFactory('bold', 'b'),
			exec: execCommandFactory('bold', false )
		},
		italic: {
			create: createButtonFactory('italic', 'i'),
			exec: execCommandFactory('italic', false )	
		},
		url: {
			create: function () {
				var btn = createButtonFactory('url useicons', parseHtmlEntity('&#xe005;'))();
				var input = $('<input />').addClass('url-input')
					.attr('type','text')
					.attr('placeholder','Type or Paste URL here');
				
				return btn.add(input);
			},
			exec: function ( url ) {

				rehighlightLastSelection();
		
				// Unlink any current links
				document.execCommand( 'unlink', false );
		
				if (url !== "") {
				
					// Insert HTTP if it doesn't exist.
					if ( !url.match("^(http|https)://") ) {
		
						url = "http://" + url;	
					} 
		
					document.execCommand( 'createLink', false, url );
				}
			}
		},
		quote: {
			create: createButtonFactory('quote', parseHtmlEntity('&rdquo;')),
			exec: function () {
		
				var nodeNames = findNodes( getSelection().focusNode );
		
				if ( hasNode( nodeNames, 'BLOCKQUOTE' ) ) {
					document.execCommand( 'formatBlock', false, 'p' );
					document.execCommand( 'outdent' );
				} else {
					document.execCommand( 'formatBlock', false, 'blockquote' );
				}
			}
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
		if (!document.execCommand) {
			log('Your browser does not support `document.execCommand`');
		}
		if (!getSelection()) {
			log('Your browser does not support text selection');
		}
	};
	
	var resize = function () {
		// TODO
	};
	
	$(autoLoad);
	
	$(window).resize(resize);
	
})(jQuery);