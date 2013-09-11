
(function ($) {
	
	if (!!$.zenpen) {
		return;	
	}
	
	var counter = 0;
	
	var focus = function (elem) {
		var range = document.createRange();
		var selection = window.getSelection();
		range.setStart(elem.get(0), 1);
		selection.removeAllRanges();
		selection.addRange(range);
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
			var wrap = $('<div />').addClass('zenpen-wrap');
			var scrollTimeout = 0;
			var lastType = false;
			
			var checkTextHighlighting = function (event) {

				var selection = window.getSelection();
		
				if ( (event.target.className === "url-input" ||
				     event.target.classList.contains( "url" ) ||
				     event.target.parentNode.classList.contains( "ui-inputs")) ) {
		
					currentNodeList = findNodes( selection.focusNode );
					updateBubbleStates();
					return;
				}
		
				// Check selections exist
				if ( selection.isCollapsed === true && lastType === false ) {
		
					onSelectorBlur();
				}
		
				// Text is selected
				if ( selection.isCollapsed === false ) {
		
					currentNodeList = findNodes( selection.focusNode );
		
					// Find if highlighting is in the editable area
					if ( hasNode( currentNodeList, "ARTICLE") ) {
						updateBubbleStates();
						updateBubblePosition();
		
						// Show the ui bubble
						textOptions.className = "text-options active";
					}
				}
		
				lastType = selection.isCollapsed;
			};

			var updateBubblePosition = function () {
				var selection = window.getSelection();
				var range = selection.getRangeAt(0);
				var boundary = range.getBoundingClientRect();
				
				textOptions.style.top = boundary.top - 5 + window.pageYOffset + "px";
				textOptions.style.left = (boundary.left + boundary.right)/2 + "px";
			};
		
			var updateBubbleStates = function () {
		
				// It would be possible to use classList here, but I feel that the
				// browser support isn't quite there, and this functionality doesn't
				// warrent a shim.
		
				if ( hasNode( currentNodeList, 'B') ) {
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
				}
			};
		
			var onSelectorBlur = function () {
		
				textOptions.className = "text-options fade";
				setTimeout( function() {
		
					if (textOptions.className == "text-options fade") {
		
						textOptions.className = "text-options";
						textOptions.style.top = '-999px';
						textOptions.style.left = '-999px';
					}
				}, 260 )
			};

			
			elem.wrap(wrap);
			elem.after(popup);
			elem.attr('data-zenpen', id);
			
			elem
				.on('keyup' + namespace, checkTextHighlighting)
				.on('mousedown' + namespace, checkTextHighlighting)
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
			exec: execCommandFactory('bold', false )
		},
		italic: {
			create: createButtonFactory('italic', 'i'),
			exec: execCommandFactory('italic', false )	
		},
		url: {
			create: function () {
				var btn = createButtonFactory('url useicons','&#xe005;')();
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
			create: createButtonFactory('quote', '&rdquo;'),
			exec: function () {
		
				var nodeNames = findNodes( window.getSelection().focusNode );
		
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
	};
	
	var resize = function () {
			
	};
	
	$(autoLoad);
	
	$(window).resize(resize);
	
})(jQuery);