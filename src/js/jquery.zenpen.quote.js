/*
 *  jQuery ZenPen quote action
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
	
	$.zenpen.actions.quote = {
		validNode: function (node) {
			return !!node.closest('blockquote').length;	
		},
		create: $.zenpen.api.createButtonFactory('quote', '&rdquo;', 'quote'),
		exec: function (btn, popup, lastSelection ) {
	
			if ( this.validNode($(lastSelection.focusNode)) ) {
				document.execCommand( 'formatBlock', false, 'p' );
				document.execCommand( 'outdent' );
			} else {
				document.execCommand( 'formatBlock', false, 'blockquote' );
			}
		}
	};
		
})(jQuery);