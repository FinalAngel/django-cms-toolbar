/*##################################################|*/
/* #CMS.TOOLBAR# */
var CMS = CMS || {};

jQuery(document).ready(function ($) {
	// assign correct jquery to $ namespace
	// $ = CMS.$ || $;

	CMS.Layout = new Class({

		options: {
			'debug': false, // not integrated yet
			'mode': '', // edit, layout, view
			'lang': {
				'move_warning': '',
				'delete_request': '',
				'cancel': 'Cancel'
			}
		},

		initialize: function (container, options) {
			// merge argument options with internal options
			this.options = $.extend(this.options, options);
			// class vars
			this.placeholders = $('.cms_placeholder');

			// we need to inject each element to the dom and style it somehow (where do we get the name?)
			//this._injectDragElement();



			var dragitems = $('.cms_dragholder');

			dragitems.bind('draginit', function (e, drag) {
				drag.limit($(this).parent());

				drag.ghost();
				drag.horizontal();
			});
		}

	});

});