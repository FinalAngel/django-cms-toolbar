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

			// setup basic bars
			this._bars();

			// adding drop feature
			this._expandable();

            // init drag and drop
            this._dragging();
		},

		_bars: function () {
			var that = this;

			this.bars = $('.cms_placeholder-bar');
			this.bars.each(function (index, item) {

				item = $(item);
				item.find('.cms_placeholder-btn > a').bind('click', function (e) {
					e.preventDefault();

					that.bars.css('z-index', 100);
					item.css('z-index', 1000);

					item.find('ul').fadeToggle(200);
				});
			});
		},

		_expandable: function () {
			var expendables = $('.cms_dragitem-collapsable');
				expendables.on('click', function (e) {
					$(this).parent().find('.cms_dragholder').toggle();
					$(this).toggleClass('cms_dragitem-collapsed');
				});
		},

		_dragging: function () {
			var dragitems = $('.cms_dragholder-draggable');
			var dropareas = $('.cms_dragholder-droppable');

			// starting drag event
			dragitems.each(function () {
				$(this).draggable({
					'connectToSortable': $(this).parent().filter('.cms_dragholder'),
					'revert': 'invalid',
					'helper': 'clone',
					'cursor': 'move',
					'appendTo': 'body',
					'zindex': 99999,
					'handle': '> .cms_dragitem',
					'scope': 'global'
				}).bind({
					'dragstart': function (e, ui) {
						console.log('start dragging');
					},
					'dragstop': function (e, ui) {
						console.log('stop dragging');
					}
				});

				// sortable allows to rearrange items
				$(this).parent().filter('.cms_dragholder').sortable({
					'revert': true,
					'placeholder': 'cms_dragholder-placeholder'
				}).disableSelection();
			});

			dropareas.each(function () {
				// TODO PREVENT READDING IN SAME CONTAINER

				$(this).droppable({
					'greedy': true,
					'scope': 'global',
					'tolerance': 'pointer',
					'activeClass': 'cms_dragholder-allowed',
					'hoverClass': 'cms_dragholder-hover-allowed',
					'drop': function(e, ui) {
						// prevent same item from being called
						console.log($(ui.draggable));


						if($(this).hasClass('cms_dragholder-empty')) {
							$(ui.draggable).attr('style', '').insertBefore(this);
						} else {
							$(ui.draggable).attr('style', '').appendTo(this);
						}

						console.log('drop');
					}
				});
			});






			/*dragitems.on({
				// start dragging
				'draginit': function(e, drag) {
					// creating custom ghosted element
					var ghost = drag.ghost();
						ghost.appendTo('body');
						ghost.addClass('cms_dragholder-dragging');

					console.log('draginit');
				}
			});*/
/*
			dropareas.on({
				'dropover': function (e, drop, drag) {
					dropareas.removeClass('cms_dragholder-allowed');

					$(this).addClass('cms_dragholder-allowed');

					// TODO NEED BETTER CHECKING ALSO FOR ITSELF
				},

				'dropout': function (e, drop, drag) {
					$(this).removeClass('cms_dragholder-allowed');
				},

				'dropon': function (e, drop, drag) {
					// first lets check if its an initial element
					if($(this).hasClass('cms_dragholder-empty')) {
						$(drag.delegate).insertAfter(this);
					} else {
						$(drag.delegate).appendTo(this);
					}
				}
			});*/
		}

	});

});