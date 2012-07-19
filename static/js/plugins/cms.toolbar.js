/*##################################################|*/
/* #CMS.TOOLBAR# */
var CMS = CMS || {};

jQuery(document).ready(function ($) {
	// assign correct jquery to $ namespace
	// $ = CMS.$ || $;

	/*!
	 * Toolbar
	 * @public_methods:
	 *	- CMS.API.Toolbar.toggleToolbar();
	 *	- CMS.API.Toolbar.registerItem(obj);
	 *	- CMS.API.Toolbar.registerItems(array);
	 *	- CMS.API.Toolbar.removeItem(id);
	 *	- CMS.API.Toolbar.registerType(function);
	 *  - CMS.API.Toolbar.isToolbarHidden();
	 * @compatibility: IE >= 6, FF >= 2, Safari >= 4, Chrome > =4, Opera >= 10
	 * TODO: login needs special treatment (errors, login on enter)
	 * TODO: styling of the collapser button needs to be somehow transparent
	 */
	CMS.Toolbar = new Class({

		options: {},

		initialize: function (container, options) {
			// save reference to this class
			var that = this;
			// merge passed argument options with internal options
			this.options = $.extend(true, {}, this.options, options);

			// set initial variables
			this.container = $(container);
			this.toolbar = this.container.find('.cms_toolbar');
			this.body = $('body');

			this.sideframe = this.container.find('#cms_sideframe');

			// bind event to toggle button so toolbar can be shown/hidden
			this.toggle = this.container.find('.cms_toolbar-trigger');
			this.toggle.bind('click', function (e) {
				e.preventDefault();
				that.toggleToolbar();
			});

			// initial setups
			this._setup();
		},

		/**
		 * All methods with an underscore as prefix should not be called through the API namespace
		 */
		_setup: function () {

			// decide to hide or show the toolbar
			(this._getStorage('toolbar-active') === 'true') ? this._showToolbar(true) : this._hideToolbar(true);

			// disable initial handler
			this.container.find('.cms_toolbar-item_navigation-disabled').live('click', function (e) {
				e.preventDefault();
				console.log('can\'t touch me');
			});

			// handle related menu functionality
			this._menu();
		},

		// Checks whether the toolbar is hidden right now
		isToolbarHidden: function(){
			return this.toolbar.data('collapsed');
		},

		/**
		 * Binds the collapsed data element to the toolbar
		 * Calls private methods _showToolbar and _hideToolbar when required
		 * Saves current state in a cookie
		 */
		toggleToolbar: function () {
			(this.toolbar.data('collapsed')) ? this._showToolbar() : this._hideToolbar();

			return this.toolbar.data('collapsed');
		},

		// sets collapsed data to false
		_showToolbar: function (initial) {
			// show toolbar
			(initial) ? this.toolbar.show() : this.toolbar.slideDown(200);
			// change data information
			this.toolbar.data('collapsed', false);
			// remove class from trigger
			this.toggle.removeClass('cms_toolbar-collapsed');
			// add show event to toolbar
			this.toolbar.trigger('cms.toolbar.show');
			// save state
			this._setStorage('toolbar-active', true);
		},

		// sets collapsed data to true
		_hideToolbar: function () {
			// hide toolbar
			this.toolbar.slideUp(200);
			// change data information
			this.toolbar.data('collapsed', true);
			// add class to trigger
			this.toggle.addClass('cms_toolbar-collapsed');
			// add hide event to toolbar
			this.toolbar.trigger('cms.toolbar.hide');
			// save state
			this._setStorage('toolbar-active', false);
		},

		_menu: function () {
			var that = this;
			// set active class
			this.menus = this.container.find('.cms_toolbar-item_navigation > li');
			this.menus.bind('mouseenter mouseleave', function (e) {
				that.menus.removeClass('active');

				// cancel if leaving
				if(e.type === 'mouseleave') return false;
				// cancel if is disabled
				if($(this).hasClass('cms_toolbar-item_navigation-disabled')) return false;

				$(this).addClass('active');
			});

			// revent link events
			this.menus.find('* a').bind('click', function (e) {
				e.preventDefault();

				// open sideframe with content
				switch($(this).attr('rel')) {
					case 'ajax':
						that.loadAjax($(this).attr('href'), $(this));
						break;
					case 'modal':
						that.loadModal();
						break;
					case 'sideframe':
						that.loadSideframe($(this).attr('href'));
						break;
					default:
						window.location = $(this).attr('href');
				}
			});

			// attach menu events
			this._menuEvents();

			// autoadd sideframe
			//this.loadSideframe('test/');

		},

		_menuEvents: function () {
			var that = this;
			var trigger = this.sideframe.find('.cms_sideframe-resize');

			trigger.bind('mousedown', function (e) {
				e.preventDefault();
				that.isResizing = true;
				that._startResize.call(that);
			});
			// we need to listen do the entire document mouseup event
			$(document).bind('mouseup.cms', function (e) {
				if(that.isResizing) that._stopResize.call(that);
			});
		},

		loadAjax: function (url, el) {
			var that = this;

			$.ajax({
				'method': 'post',
				'data': {},
				'url': url,
				'success': function (data) {
					// handle logout for prototype
					if(data === 'logout') window.location = '?logout=true';
					// handle delete for prototype
					if(data === 'delete') {
						// TODO we might want to trigger a customized modal window
						var q = confirm('Are you sure you want to delete this page');
						if(q) window.location.reload();
					}
					if(data === 'template') {
						// cancel if the template is already selected
						if(el.parent().hasClass('active')) return false;

						el.closest('ul').find('li').removeClass('active');
						el.parent().addClass('active');
						// some delay to show that the template is changed for prototypal purpose
						setTimeout(function () {
							window.location.reload();
						}, 1000);
					}
				},
				'error': function () {
					that._showError('The ajax request could not be called.');
				}
			});
		},

		loadModal: function (url) {
			console.log('modal');
		},

		loadSideframe: function (url) {
			var iframe = $('<iframe src="'+url+'" class="" frameborder="0" />');
			var holder = this.sideframe.find('.cms_sideframe-frame');
			var width = 275;

			// load iframe content
			holder.html(iframe);

			// cancel animation if sidebar is already shown
			if(this.sideframe.is(':visible')) return false;
			// show container
			this.sideframe.show().css('width', 0).animate({
				'width': width
			});
			this.body.animate({
				'margin-left': width
			});
		},

		_startResize: function () {
			var that = this;
			// disable iframe
			this.sideframe.find('.cms_sideframe-frame-overlay').css('z-index', 20);

			$(document).bind('mousemove.cms', function (e) {
				that.sideframe.css('width', e.clientX);
				that.sideframe.find('.cms_sideframe-frame').css('width', e.clientX);
				that.body.css('margin-left', e.clientX);
			});
		},

		_stopResize: function () {
			console.log('stop');
			this.sideframe.find('.cms_sideframe-frame-overlay').css('z-index', 1);

			$(document).unbind('mousemove.cms');
		},

		_showError: function (msg) {
			return new Error(msg);
		},

		// TODO FOR DEVELOPMENT ONLY
		_setStorage: function (attribute, value) {
			// cancel if this feature is not supported by some browser
			if($.browser.msie) return false;
			// save storage
			localStorage.setItem(attribute, value);
		},

		_getStorage: function (attribute) {
			// cancel if feature is not supported by some browser
			if($.browser.msie) return false;
			// retrieve storage
			return localStorage.getItem(attribute);
		}

	});
});