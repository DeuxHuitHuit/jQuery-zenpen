/*
 *  jQuery ZenPen url/link action
 *
 *  Copyright (c) 2013 Deux Huit Huit (http://www.deuxhuithuit.com/)
 *  Licensed under the MIT (https://github.com/DeuxHuitHuit/jQuery-zenpen/blob/master/LICENSE.txt)
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
		create: function () {
			var btn = api.createButtonFactory('url useicons', '&#xe005;', 'url')();
			var input = $('<input />').addClass('url-input')
				.attr('type','text')
				.attr('placeholder','Type or Paste URL here');
				
			var self = this;
				
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
	};

		
})(jQuery);