/*
 *  jQuery ZenPen headers action
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
	
	var factory = function (tag) {
		return {
			validNode: function (node) {
				return !!node.closest(tag).length;	
			},
			create: $.zenpen.api.createButtonFactory(tag, tag, tag),
			exec: function (btn, popup, lastSelection ) {
		
				if ( this.validNode($(lastSelection.focusNode)) ) {
					document.execCommand( 'formatBlock', false, 'p' );
					document.execCommand( 'outdent' );
				} else {
					document.execCommand( 'formatBlock', false, tag );
				}
			}
		};
	};
	
	$.zenpen.actions.h1 = factory('h1');
	$.zenpen.actions.h2 = factory('h2');
	$.zenpen.actions.h3 = factory('h3');
	$.zenpen.actions.h4 = factory('h4');
	$.zenpen.actions.h5 = factory('h5');
	$.zenpen.actions.h6 = factory('h6');
		
})(jQuery);