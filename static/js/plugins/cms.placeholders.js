/*##################################################|*/
/* #CMS.TOOLBAR# */
var CMS = CMS || {};

jQuery(document).ready(function ($) {
	// assign correct jquery to $ namespace
	// $ = CMS.$ || $;

	/*!
	 * Placeholders
	 * @public_methods:
	 *	- CMS.API.Placeholder.addPlugin(obj, url);
	 *	- CMS.API.Placeholder.editPlugin(placeholder_id, plugin_id);
	 *	- CMS.API.Placeholder.deletePlugin(placeholder_id, plugin_id, plugin);
	 *	- CMS.API.Placeholder.toggleFrame();
	 *	- CMS.API.Placeholder.toggleDim();
	 * @compatibility: IE >= 6, FF >= 2, Safari >= 4, Chrome > =4, Opera >= 10
	 */

	CMS.Placeholders = new Class({

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

			// adds editable tooltip in edit mode
			this._tooltip();

			// TODO placeholder call for testing
			// TODO IF EDIT MODE
			this._registerPlaceholders();
			this._preventEvents();


			/*
			this.wrapper = $(container);
			this.toolbar = this.wrapper.find('#cms_toolbar-toolbar');
			this.dim = this.wrapper.find('#cms_placeholder-dim');
			this.frame = this.wrapper.find('#cms_placeholder-content');
			this.timer = null;
			this.overlay = this.wrapper.find('#cms_placeholder-overlay');
			this.overlayIsHidden = false;
			this.success = this.wrapper.find('#cms_placeholder-success');

			// setup everything
			this._setup();
			*/
		},

		_tooltip: function () {
			var tooltip = $('.cms_placeholders-tooltip');

			// save placeholder elements
			$(document.body).bind('mousemove.cms', function (e) {
				tooltip.css({
					'left': e.pageX + 20,
					'top': e.pageY - 10
				});
			});

			// add tooltip event to every placeholder
			this.placeholders.each(function (index, item) {
				var placeholder = $(item);
					placeholder.bind('mouseenter.cms mouseleave.cms', function (e) {
						(e.type === 'mouseenter') ? tooltip.show() : tooltip.hide();
					});
			});
		},

		_registerPlaceholders: function () {
			var that = this;

			this.placeholders.bind('dblclick', function (e) {
				e.preventDefault();
				e.stopPropagation();

				that.event = e;

				// reset click and button events if dblclick
				clearTimeout(that.eventTimer);

				var id = parseInt($(this).attr('id').split('-')[1]);

				that._loadModal(id);
			});
		},

		_preventEvents: function () {
			var clicks = 0;
			var delay = 500;
			var timer = function () {};
			var prevent = true;

			$('a, button, input[type="submit"], input[type="button"]').bind('click', function (e) {
				if (prevent) {
					e.preventDefault();

					// clear timeout after click and increment
					clearTimeout(timer);

					timer = setTimeout(function () {
						// if there is only one click use standard event
						if(clicks === 1) {
							prevent = false;

							$(e.currentTarget)[0].click();
						}
						// reset
						clicks = 0;
					}, delay);

					clicks++;
				}

			});
		},

		_loadModal: function (id) {
			var that = this;
			var tooltip = $('.cms_placeholders-tooltip');

			// set loader
			tooltip.html('<span style="display:block; line-height:1px; font-size:1px;"><img src="/static/img/toolbar/loader.gif" alt="" style="padding-top:2px;" /></span>');

			// prepare fake html
			var html = '<div id="cms_toolbar-modal" class="cms_toolbar-modal">' +
					   '    <div class="cms_toolbar-modal-close">X</div>' +
					   '    <div class="cms_toolbar-modal-collapse">minimize <span>–</span></div>' +
					   '    <div class="cms_toolbar-modal-title"></div>' +
					   '    <div class="cms_toolbar-modal-resize"></div>' +
					   '    <div class="cms_toolbar-modal-iframe"><div class="shim"></div></div>' +
					   '</div>';

			// do some ajax stuff with the id
			$.ajax({
				'method': 'post',
				'url': '',
				'data': id,
				'success': function () {
					// artificial timeout
					setTimeout(function () {
						// reset tooltip
						tooltip.html('Edit');
						// show the modal
						that._destroyModal();
						that._renderModal({
							'html': html,
							'title': 'Multicolumn',
							'url': '/admin/cms/page/1/'
						});
					}, 1000);
				}
			});
		},

		_renderModal: function (data) {
			$(document.body).append(data.html);

			// set vars
			var that = this;
			var container = $('#cms_toolbar-modal');
				container.hide();

			var modal = container.find('.cms_toolbar-modal');
			var frame = container.find('.cms_toolbar-modal-iframe');
			var title = container.find('.cms_toolbar-modal-title');
			var minimize = container.find('.cms_toolbar-modal-collapse');
			var close = container.find('.cms_toolbar-modal-close');
			var resize = container.find('.cms_toolbar-modal-resize');

			// set iframe content
			frame.append('<iframe style="width:100%; height:100%; border:none;" src="' + data.url + '" />');

			// set title
			title.text(data.title);

			// set minimize event
			minimize.bind('click', function () {
				if(minimize.data('collapsed')) {
					frame.show();
					container.css('width', '80%');
					minimize.html('minimize <span>–</span>');
					minimize.data('collapsed', false)
				} else {
					frame.hide();
					container.css('width', 300).css('height', 'auto');
					minimize.html('maximize <span>+</span>');
					minimize.data('collapsed', true)
				}
			});

			// attach close event
			close.bind('click', function (e) {
				e.preventDefault();

				that._destroyModal();
			});

			// attach drag and move events
			title.bind('mousedown', function (e) {
				e.preventDefault();
				that._startMove.call(that, e);
				frame.find('.shim').show();
			});
			// we need to listen do the entire document mouseup event
			$(document).bind('mouseup.cms', function (e) {
				that._stopMove.call(that);
				frame.find('.shim').hide();
			});

			// attach drag and move events
			resize.bind('mousedown', function (e) {
				e.preventDefault();
				that._startResize.call(that, e);
				frame.find('.shim').show();
			});
			// we need to listen do the entire document mouseup event
			$(document).bind('mouseup.cms', function (e) {
				that._stopResize.call(that);
				frame.find('.shim').hide();
			});

			// now we need to do some nice animation ;)
			this._animateModal();
		},

		_animateModal: function () {
			var that = this;
			var container = $('#cms_toolbar-modal');

			container.css({
				'display': 'block',
				'left': this.event.pageX - $(window).scrollLeft() - 20,
				'top': this.event.pageY - $(window).scrollTop() - 10,
				'width': 30,
				'height': 30
			});

			container.animate({
				'left': '10%',
				//'right': '10%',
				'top': '15%',
				'width': '80%',
				'height': 300
			}, function () {
				that._updateIframeSize();
			});
		},

		_destroyModal: function (e) {
			$('#cms_toolbar-modal').remove();
		},

		_startMove: function (initial) {
			var that = this;
			var container = $('#cms_toolbar-modal');
			var position = container.position();
			var initX = initial.pageX;
			var initY = initial.pageY;

			$(document).bind('mousemove.cms', function (e) {
				container.css({
					'left': position.left - (initX - e.pageX) - $(window).scrollLeft(),
					'top': position.top - (initY - e.pageY) - $(window).scrollTop()
				});

				that._updateIframeSize();
			});
		},

		_stopMove: function () {
			$(document).unbind('mousemove.cms');
		},

		_startResize: function (initial) {
			var that = this;
			var container = $('#cms_toolbar-modal');
			var initX = initial.pageX;
			var initY = initial.pageY;
			var width = container.width();
			var height = container.height();

			$(document).bind('mousemove.cms', function (e) {
				container.css({
					'width': width - (initX - e.pageX),
					'height': height - (initY - e.pageY)
				});

				that._updateIframeSize();
			});
		},

		_stopResize: function () {
			$(document).unbind('mousemove.cms');
		},

		_updateIframeSize: function () {
			var container = $('#cms_toolbar-modal');
			var header = container.find('.cms_toolbar-modal-title');

			var frame = container.find('.cms_toolbar-modal-iframe');

			var cHeight = container.height();
			var hHeight = header.outerHeight(true);

			frame.css('height', cHeight - hHeight - 12);
		},























		
		_setup: function () {
			// save reference to this class
			var that = this;
			
			// set default dimm value to false
			this.dim.data('dimmed', false);
			
			// set defailt frame value to true
			this.frame.data('collapsed', true);
			
			// bind overlay event
			this.overlay.bind('mouseleave', function () {
				that.hideOverlay();
			});
			// this is for testing
			this.overlay.find('.cms_placeholder-overlay_bg').bind('click', function () {
				that.hideOverlay();
				
				// we need to hide the oberlay and stop the event for a while
				that.overlay.css('visibility', 'hidden');
				
				// add timer to show element after second mouseenter
				setTimeout(function () {
					that.overlayIsHidden = true;
				}, 100);
			});
		},

		addPlugin: function (values, addUrl, editUrl) {
			var that = this;
			// do ajax thingy
			$.ajax({
				'type': 'POST',
				'url': addUrl,
				'data': values,
				'success': function (response) {
					// we get the id back
					that.editPlugin.call(that, values.placeholder_id, response, editUrl);
				},
				'error': function () {
					throw new Error('CMS.Placeholders was unable to perform this ajax request. Try again or contact the developers.');
				}
			});
		},
		
		editPlugin: function (placeholder_id, plugin_id, url) {
			var that = this;
			var frame = this.frame.find('.cms_placeholder-content_inner');
			var needs_collapsing = false;
			
			// If the toolbar is hidden, editPlugin does not work properly,
			// therefore we show toggle it and save the old state.
			if (CMS.API.Toolbar.isToolbarHidden()){
				CMS.API.Toolbar.toggleToolbar();
				needs_collapsing = true;
			}
			
			// show framebox
			this.toggleFrame();
			this.toggleDim();
			
			// load the template through the data id
			// for that we create an iframe with the specific url
			var iframe = $('<iframe />', {
				'id': 'cms_placeholder-iframe',
				'src': url + placeholder_id + '/edit-plugin/' + plugin_id + '?popup=true&no_preview',
				'style': 'width:100%; height:0; border:none; overflow:auto;',
				'allowtransparency': true,
				'scrollbars': 'no',
				'frameborder': 0
			});
			
			// inject to element
			frame.html(iframe);
			
			// bind load event to injected iframe
			$('#cms_placeholder-iframe').load(function () {
				// set new height and animate
				// set a timeout for slower javascript engines (such as IE)
				setTimeout(function () {
					var height = $('#cms_placeholder-iframe').contents().find('body').outerHeight(true)+26;
					$('#cms_placeholder-iframe').animate({ 'height': height }, 500);
				}, 100);

				// remove loader class
				frame.removeClass('cms_placeholder-content_loader');

				// add cancel button
				var btn = $(this).contents().find('input[name^="_save"]');
					btn.addClass('default').css('float', 'none');
					btn.bind('click', function(){
						// If the toolbar was hidden before we started editing
						// this plugin, and it is NOT hidden now, hide it
						if (needs_collapsing && ! CMS.API.Toolbar.isToolbarHidden()){
							CMS.API.Toolbar.toggleToolbar();
						}
					});
				var cancel = $(this).contents().find('input[name^="_cancel"]');
					cancel.bind('click', function (e) {
						e.preventDefault();
						// hide frame
						that.toggleFrame();
						that.toggleDim();
						// If the toolbar was hidden before we started editing
						// this plugin, and it is NOT hidden now, hide it
						if (needs_collapsing && ! CMS.API.Toolbar.isToolbarHidden()){
							CMS.API.Toolbar.toggleToolbar();
						}
					});

				// do some css changes in template
				$(this).contents().find('#footer').css('padding', 0);
			});
			
			// we need to set the body min height to the frame height
			$(document.body).css('min-height', this.frame.outerHeight(true));
		},
		
		deletePlugin: function (plugin, plugin_id, url) {
			// lets ask if you are sure
			var message = this.options.lang.delete_request;
			var confirmed = confirm(message, true);

			// now do ajax
			if(confirmed) {
				$.ajax({
					'type': 'POST',
					'url': url,
					'data': { 'plugin_id': plugin_id },
					'success': function () {
						// remove plugin from the dom
						plugin.remove();
					},
					'error': function () {
						throw new Error('CMS.Placeholders was unable to perform this ajax request. Try again or contact the developers.');
					}
				});
			}
		},

		movePluginPosition: function (dir, plugin, values, url) {
			// save reference to this class
			var that = this;
			// get all siblings within the placeholder
			var holders = plugin.siblings('.cms_placeholder').andSelf();
			// get selected index and bound
			var index = holders.index(plugin);
			var bound = holders.length;

			// if the there is only 1 element, we dont need to move anything
			if(bound <= 1) {
				alert(this.options.lang.move_warning);
				return false;
			}

			// create the array
			var array = [];

			holders.each(function (index, item) {
				array.push($(item).data('options').plugin_id);
			});
			// remove current array
			array.splice(index, 1);

			// we need to check the boundary and modify the index if item jups to top or bottom
			if(index <= 0 && dir === 'moveup') {
				index = bound+1;
			} else if(index >= bound-1 && dir === 'movedown') {
				index = -1;
			}
			// add array to new position
			if(dir === 'moveup') array.splice(index-1, 0, values.plugin_id);
			if(dir === 'movedown') array.splice(index+1, 0, values.plugin_id);

			// now lets do the ajax request
			$.ajax({
				'type': 'POST',
				'url': url,
				'data': { 'ids': array.join('_') },
				'success': refreshPluginPosition,
				'error': function () {
					throw new Error('CMS.Placeholders was unable to perform this ajax request. Try again or contact the developers.');
				}
			});

			// lets refresh the elements in the dom as well
			function refreshPluginPosition() {
				if(dir === 'moveup' && index !== bound+1) plugin.insertBefore($(holders[index-1]));
				if(dir === 'movedown' && index !== -1) plugin.insertAfter($(holders[index+1]));
				// move in or out of boundary
				if(dir === 'moveup' && index === bound+1) plugin.insertAfter($(holders[index-2]));
				if(dir === 'movedown' && index === -1) plugin.insertBefore($(holders[index+1]));

				// close overlay
				that.hideOverlay();

				// show success overlay for a second
				that.success.css({
					'width': plugin.width()-2,
					'height': plugin.height()-2,
					'left': plugin.offset().left,
					'top': plugin.offset().top
				}).show().fadeOut(1000);
			}
		},

		morePluginOptions: function (plugin, values, url) {
			// save reference to this class
			var that = this;

			// how do we figure out all the placeholder names
			var array = [];
			$('.cms_placeholder-bar').each(function (index, item) {
				// TODO: get the data from the bar
				array.push($(item).attr('class').split('::')[1]);
			});

			// so whats the current placeholder?
			var current = plugin.attr('class').split('::')[1];

			// lets remove current from array - puke
			// unfortunately, Internet Explorer does not support indexOf, so
			// we use the jQuery cross browers compatible version
			var idx = $.inArray(current, array);
				array.splice(idx, 1);

			// grab the element
			var more = that.overlay.find('.cms_placeholder-options_more');
				more.show();

			var list = more.find('ul');

			// we need to stop if the array is empty
			if(array.length) list.html('');

			// loop through the array
			$(array).each(function (index, slot) {
				// do some brainfuck
				var text = $('.cms_placeholder-bar[class$="cms_placeholder_slot::' + slot + '"]').find('.cms_placeholder-title').text();
				list.append($('<li><a href="">' +text + '</a></li>').data({
					'slot': slot,
					'placeholder_id': values.placeholder,
					'plugin_id': values.plugin_id
				}));
			});

			// now we need to bind events to the elements
			list.find('a').bind('click', function (e) {
				e.preventDefault();
				// save slot var
				var slot = $(this).parent().data('slot');
				var placeholder_id = $(this).parent().data('placeholder_id');
				// now lets do the ajax request
				$.ajax({
					'type': 'POST',
					'url': url,
					'data': { 'placeholder': slot, 'placeholder_id': placeholder_id, 'plugin_id': $(this).parent().data('plugin_id') },
					'success': function () {
						refreshPluginPosition(slot);
					},
					'error': function () {
						throw new Error('CMS.Placeholders was unable to perform this ajax request. Try again or contact the developers.');
					}
				});
			});

			// if request is successfull move the plugin
			function refreshPluginPosition(slot) {
				// lets replace the element
				var els = $('.cms_placeholder[class$="cms_placeholder::' + slot + '"]');
				var length = els.length;

				if(length === 0) {
					plugin.insertAfter($('.cms_placeholder-bar[class$="cms_placeholder_slot::' + slot + '"]'));
				} else {
					plugin.insertAfter($(els.toArray()[length-1]));
				}

				// close overlay
				that.hideOverlay();

				// show success overlay for a second
				that.success.css({
					'width': plugin.width()-2,
					'height': plugin.height()-2,
					'left': plugin.offset().left,
					'top': plugin.offset().top
				}).show().fadeOut(1000);

				// we have to assign the new class slot to the moved plugin
				var cls = plugin.attr('class').split('::');
					cls.pop();
					cls.push(slot);
					cls = cls.join('::');
				plugin.attr('class', cls);
			}
		},

		showOverlay: function (holder) {
			// lets place the overlay
			this.overlay.css({
				'width': holder.width()-2,
				'height': holder.height()-2,
				'left': holder.offset().left,
				'top': holder.offset().top
			}).show();
		},
		
		hideOverlay: function () {
			// hide overlay again
			this.overlay.hide();
			// also hide submenu
			this.overlay.find('.cms_placeholder-options_more').hide();
		},
		
		showPluginList: function (el) {
			// save reference to this class
			// TODO: make sure the element is really shown over everything
			var that = this;
			var list = el.parent().find('.cms_placeholder-subnav');
				list.show();

			// add event to body to hide the list needs a timout for late trigger
			setTimeout(function () {
				$(document).bind('click', function () {
					that.hidePluginList.call(that, el);
				});
			}, 100);
			
			// Since IE7 (and lower) do not properly support z-index, do a cross browser hack
			if($.browser.msie && $.browser.version < '8.0') el.parent().parent().css({'position': 'relative','z-index': 999999});

			el.addClass('cms_toolbar-btn-active').data('collapsed', false);
		},
		
		hidePluginList: function (el) {
			var list = el.parent().find('.cms_placeholder-subnav');
				list.hide();

			// remove the body event
			$(document).unbind('click');

			// Since IE7 (and lower) do not properly support z-index, do a cross browser hack
			if($.browser.msie && $.browser.version < '8.0') el.parent().parent().css({'position': '','z-index': ''});

			el.removeClass('cms_toolbar-btn-active').data('collapsed', true);
		},

		toggleFrame: function () {
			(this.frame.data('collapsed')) ? this._showFrame() : this._hideFrame();
		},
		
		_showFrame: function () {
			var that = this;
			// show frame
			this.frame.fadeIn();
			// change data information
			this.frame.data('collapsed', false);
			// set dynamic frame position
			var offset = 43;
			var pos = $(document).scrollTop();
			// frame should always have space on top
			this.frame.css('top', pos+offset);
			// make sure that toolbar is visible
			if(this.toolbar.data('collapsed')) CMS.Toolbar.API._showToolbar();
			// listen to toolbar events
			this.toolbar.bind('cms.toolbar.show cms.toolbar.hide', function (e) {
				(e.handleObj.namespace === 'show.toolbar') ? that.frame.css('top', pos+offset) : that.frame.css('top', pos);
			});
		},
		
		_hideFrame: function () {
			// hide frame
			this.frame.fadeOut();
			// change data information
			this.frame.data('collapsed', true);
			// there needs to be a function to unbind the loaded content and reset to loader
			this.frame.find('.cms_placeholder-content_inner')
				.addClass('cms_placeholder-content_loader')
				.html('');
			// remove toolbar events
			this.toolbar.unbind('cms.toolbar.show cms.toolbar.hide');
		},

		toggleDim: function () {
			(this.dim.data('dimmed')) ? this._hideDim() : this._showDim();
		},
		
		_showDim: function () {
			var that = this;
			// clear timer when initiated within resize event
			if(this.timer) clearTimeout(this.timer);
			// attach resize event to window
			$(window).bind('resize', function () {
				// first we need to response to the window
				that.dim.css('height', $(window).height());
				// after a while we response to the document dimensions
				that.timer = setTimeout(function () {
					that.dim.css('height', $(document).height());
				}, 500);
			});
			// init dim resize
			// insure that onload it takes the document width
			this.dim.css('height', $(document).height());
			// change data information
			this.dim.data('dimmed', true);
			// show dim
			this.dim.css('opacity', 0.6).stop().fadeIn();
			// add event to dim to hide
			this.dim.bind('click', function () {
				that.toggleFrame.call(that);
				that.toggleDim.call(that);
			});
		},
		
		_hideDim: function () {
			// unbind resize event
			$(document).unbind('resize');
			// change data information
			this.dim.data('dimmed', false);
			// hide dim
			this.dim.css('opacity', 0.6).stop().fadeOut();
			// remove dim event
			this.dim.unbind('click');
		}

	});

	/**
	 * Placeholder
	 * @version: 1.0.0
	 * @description: Handles each placeholder separately
	 */
	CMS.Placeholder = new Class({

		initialize: function (container, options) {
			// save reference to this class
			var that = this;


			/*
			// do not merge options here
			this.options = options;
			this.container = $(container);

			// save data on item
			this.container.data('options', this.options);

			// attach event handling to placeholder buttons and overlay if editmode is active
			if(this.options.type === 'bar') {
				this._bars();
			}

			// attach events to the placeholder bars
			if(this.options.type === 'holder') {
				this.container.bind('mouseenter', function (e) {
					that._holders.call(that, e.currentTarget);
				});
			}*/
		},

		/* this private method controls the buttons on the bar (add plugins) */
		_bars: function () {
			// save reference to this class
			var that = this;
			var bar = this.container;

			// attach button event
			var barButton = bar.find('.cms_toolbar-btn');
				barButton.data('collapsed', true).bind('click', function (e) {
					e.preventDefault();

					($(this).data('collapsed')) ? CMS.API.Placeholders.showPluginList($(e.currentTarget)) : CMS.API.Placeholders.hidePluginList($(e.currentTarget));
				});

			// read and save placeholder bar variables
			var values = {
				'language': that.options.page_language,
				'placeholder_id': that.options.page_id,
				'placeholder': that.options.placeholder_id
			};

			// attach events to placeholder plugins
			bar.find('.cms_placeholder-subnav li a').bind('click', function (e) {
				e.preventDefault();
				// add type to values
				values.plugin_type = $(this).attr('rel').split('::')[1];

				// try to add a new plugin
				CMS.API.Placeholders.addPlugin(values, that.options.urls.add_plugin, that.options.urls.change_list);
			});
		},

		/* this private method shows the overlay when hovering */
		_holders: function (el) {
			// save reference to this class
			var that = this;
			var holder = $(el);

			// show overlay
			CMS.API.Placeholders.showOverlay(holder);

			// set overlay to visible
			if(CMS.API.Placeholders.overlayIsHidden === true) {
				CMS.API.Placeholders.overlay.css('visibility', 'visible');
				CMS.API.Placeholders.overlayIsHidden = false;
			}

			// get values from options
			var values = {
				'plugin_id': this.options.plugin_id,
				'placeholder': this.options.placeholder_id,
				'type': this.options.plugin_type,
				'slot': this.options.placeholder_slot
			};

			// attach events to each holder button
			var buttons = CMS.API.Placeholders.overlay.find('.cms_placeholder-options li');
				// unbind all button events
				buttons.find('a').unbind('click');

				// attach edit event
				buttons.find('a[rel^=edit]').bind('click', function (e) {
					e.preventDefault();
					CMS.API.Placeholders.editPlugin(values.placeholder, values.plugin_id, that.options.urls.change_list);
				});

				// attach move event
				buttons.find('a[rel^=moveup], a[rel^=movedown]').bind('click', function (e) {
					e.preventDefault();
					CMS.API.Placeholders.movePluginPosition($(e.currentTarget).attr('rel'), holder, values, that.options.urls.move_plugin);
				});

				// attach delete event
				buttons.find('a[rel^=delete]').bind('click', function (e) {
					e.preventDefault();
					CMS.API.Placeholders.deletePlugin(holder, values.plugin_id, that.options.urls.remove_plugin);
				});

				// attach more event
				buttons.find('a[rel^=more]').bind('click', function (e) {
					e.preventDefault();
					CMS.API.Placeholders.morePluginOptions(holder, values, that.options.urls.move_plugin);
				});
		}

	});

});