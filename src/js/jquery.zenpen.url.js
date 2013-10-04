/*
 *  jQuery ZenPen url/link action
 *
 *  Copyright (c) 2013 Deux Huit Huit (http://www.deuxhuithuit.com/)
 *  Licensed under the MIT (http://deuxhuithuit.mit-license.org)
 *  Based on the work of Tim Holman (https://github.com/tholman/zenpen)
 *  Licensed under the Apache License (https://github.com/tholman/zenpen/blob/master/licence.md)
 */
 
(function ($) {
	
	if (!$.zenpen) {
		return;	
	}
	
	var api = $.zenpen.api;
	
	$.zenpen.actions.url = {
		validNode: function (node) {
			return !!node.closest('a').length;	
		},
		create: function (options) {
			var btn = api.createButtonFactory('url useicons', '&#xe005;', 'url')();
			var input = $('<input />').addClass('url-input')
				.attr('type','text')
				.attr('placeholder','Type or Paste URL here');
				
			var self = this;
			
			var exit = function () {
				setTimeout(function () {
					self._options.opts.removeClass('url-mode');
					self._options.popup.width(self._options.popup.data().width);
				}, 100);	
			};
				
			var realExec = function () {
				var url = input.val();

				api.rehighlightLastSelection(self._options.range);
		
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
					exit();
				}
			});
			
			input.blur(exit);
			
			return btn.add(input);
		},
		exec: function ( btn, popup, lastSelection, options ) {
			var opts = popup.find('.zenpen-options');
			
			if (!opts.hasClass('url-mode')) {
				
				var width = popup.width();
				
				opts.addClass('url-mode');
				
				var newWidth = /*popup.find('input.url-input').width()*/245 + btn.width();
				popup.width(newWidth);
				
				// save options
				if (!!lastSelection && !lastSelection.isCollapsed) {
					this._options = {
						btn: btn,
						popup: popup,
						opts: opts,
						range: lastSelection.getRangeAt(0)
					};
					popup.data('width', width);
					
					popup.find('input.url-input').val($(lastSelection.focusNode).closest('a').attr('href'));
				}
				
				setTimeout(function () {
					popup.find('input.url-input').focus();
				}, 50);
			}
		}
	};

		
})(jQuery);