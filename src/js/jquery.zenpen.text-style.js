/*
 *  jQuery ZenPen Text Style actions
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
	
	$.zenpen.actions.bold = {
		validNode: function (node) {
			return !!node.closest('b, strong').length;	
		},
		create: api.createButtonFactory('bold', 'b', 'bold'),
		exec: api.execCommandFactory('bold', false )
	};
		
	$.zenpen.actions.italic = {
		validNode: function (node) {
			return !!node.closest('i, em').length;	
		},
		create: api.createButtonFactory('italic', 'i', 'italic'),
		exec: api.execCommandFactory('italic', false )	
	};
	
	$.zenpen.actions.small = {
		validNode: function (node) {
			return !!node.closest('small').length;	
		},
		create: api.createButtonFactory('small', 's', 'small'),
		exec: api.execCommandFactory('small', false )	
	};
	
	$.zenpen.actions.small = {
		validNode: function (node) {
			return !!node.closest('big').length;	
		},
		create: api.createButtonFactory('big', 'B', 'big'),
		exec: api.execCommandFactory('big', false )	
	};
		
})(jQuery);