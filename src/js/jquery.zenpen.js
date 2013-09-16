/*
 *  jQuery ZenPen
 *
 *  Copyright (c) 2013 Deux Huit Huit (http://www.deuxhuithuit.com/)
 *  Licensed under the MIT (https://github.com/DeuxHuitHuit/jQuery-zenpen/blob/master/LICENSE.txt)
 *  Based on the work of Tim Holman (https://github.com/tholman/zenpen)
 *  Licensed under the Apache License (https://github.com/tholman/zenpen/blob/master/licence.md)
 */
 
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
	
	var rehighlightLastSelection = function (lastRange) {
		if (!!lastRange) {
			var selection = getSelection();
			selection.removeAllRanges();
			selection.addRange( lastRange );
		}
	}
	
	var parseHtmlEntity = function (he) {
		return $('<div />').html(he).text();	
	};
	
	var execCommandFactory = function () {
		var a = arguments;
		return function (btn, popup, lastSelection) {
			document.execCommand.apply(document, a);	
		};	
	};
	
	var createButtonFactory = function (cla, text, key) {
		return createButton = function () {
			var b = $('<button />').addClass(cla).text(text);
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
				cb(action, i, a);
			} else {
				console.error('Action %s does not exists in `$.zenpen.actions`', a);
			}
		});
	};
	
	var createPopUp = function (actions) {
		var popup = $('<div />').addClass('zenpen-panel');
		var options = $('<div />').addClass('zenpen-options');
		eachActions(actions, function (action, i, a) {
			options.append(action.create());
		});
		return popup.append(options);
	};
	
	var zenpen = function (options) {
		return function init(index, elem) {
			elem = $(elem);
			
			var id = (++counter);
			var namespace = '.zenpen-' + id;
			var popup = createPopUp(options.actions);
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
					left: lastMovePos.x - popupOpts.width()/2 //(boundary.left)// + boundary.right)/2 + "px"
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
					action.exec(t, popup, lastSelection);
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
	
	$.zenpen.actions = {
		bold: {
			validNode: function (node) {
				return !!node.closest('b, strong').length;	
			},
			create: createButtonFactory('bold', 'b', 'bold'),
			exec: execCommandFactory('bold', false )
		},
		italic: {
			validNode: function (node) {
				return !!node.closest('i, em').length;	
			},
			create: createButtonFactory('italic', 'i', 'italic'),
			exec: execCommandFactory('italic', false )	
		},
		url: {
			validNode: function (node) {
				return !!node.closest('a').length;	
			},
			create: function () {
				var btn = createButtonFactory('url useicons', parseHtmlEntity('&#xe005;'), 'url')();
				var input = $('<input />').addClass('url-input')
					.attr('type','text')
					.attr('placeholder','Type or Paste URL here');
					
				var self = this;
					
				var realExec = function () {
					var url = input.val();

					rehighlightLastSelection(self._options.range);
			
					// Unlink any current links
					document.execCommand( 'unlink', false );
			
					if (!!url) {
					
						// Insert HTTP if it doesn't exist.
						if ( !url.match("^(http|https|ftp|ftps|sftp)://") 
						  && !url.match("^(mailto|tel|fax|skype|irc):")
						  && !url.match("^/")  ) {
							url = "http://" + url;	
						}
			
						document.execCommand( 'createLink', false, url );
						
						input.val(''); // creates a blur
						
						self._options.popup.trigger('update');
					}
				};
				
				input.keyup(function (e) {
					if (e.which === 13) {
						realExec();
					} else if (e.which === 27) {
						self.exec(self._options.btn, self._options.popup);
					}
				});
				
				input.blur(function (e) {
					self.exec(self._options.btn, self._options.popup);
				});
				
				return btn.add(input);
			},
			exec: function ( btn, popup, lastSelection ) {
				var opts = popup.find('.zenpen-options');
				var has = opts.hasClass('url-mode');
				var fx = has ? 'removeClass' : 'addClass';
				opts[fx]('url-mode');
				
				// save options
				if (!!lastSelection) {
					this._options = {
						btn: btn,
						popup: popup,
						range: lastSelection.getRangeAt(0)
					};
				}
				
				if (!has) {
					setTimeout(function () {
						popup.find('input.url-input').focus();
					}, 50);
				}
			}
		},
		quote: {
			validNode: function (node) {
				return !!node.closest('blockquote').length;	
			},
			create: createButtonFactory('quote', parseHtmlEntity('&rdquo;'), 'quote'),
			exec: function (btn, popup, lastSelection ) {
		
				if ( this.validNode($(lastSelection.focusNode)) ) {
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