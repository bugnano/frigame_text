/*global Modernizr, jQuery, friGame */
/*jshint bitwise: true, curly: true, eqeqeq: true, esversion: 3, forin: true, freeze: true, funcscope: true, futurehostile: true, iterator: true, latedef: true, noarg: true, nocomma: true, nonbsp: true, nonew: true, notypeof: false, shadow: outer, singleGroups: false, strict: true, undef: true, unused: true, varstmt: false, eqnull: false, plusplus: true, browser: true, laxbreak: true, laxcomma: true */

// Copyright (c) 2011-2015 Franco Bugnano

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Uses ideas and APIs inspired by:
// gameQuery Copyright (c) 2008 Selim Arsever (gamequery.onaluf.org), licensed under the MIT

(function ($, fg) {
	'use strict';

	var
		overrides = {},
		fonts_to_init = [],
		FONT_PREFIX = 'friGame_font_'
	;

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	if (Modernizr.textshadow) {
		fg.support.textshadow = Modernizr.prefixed('textShadow');
	}

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	overrides.PFont = fg.pick(fg.PFont, [
		'init',
		'remove'
	]);

	fg.extend(fg.PFont, {
		init: function (name, options) {
			overrides.PFont.init.apply(this, arguments);

			if (fg.s.playground) {
				// If the playground has been initialized, initialize the DOM
				this.initDOM();
			} else {
				// If the playground has not been initialized, mark this font to be initialized after the playground
				fonts_to_init.push(name);
			}
		},

		// Public functions

		remove: function () {
			if (this.dom) {
				this.dom.remove();
			}

			overrides.PFont.remove.apply(this, arguments);
		},

		// Implementation details

		initDOM: function () {
			var
				dom = $(['<span id="', FONT_PREFIX, this.name, '"></span>'].join('')).appendTo(fg.s.playground.parentDOM)
			;

			dom
				.addClass(fg.cssClass)	// Reset background properties set by external CSS
				.css('font', this.CSSString)
				.hide()
			;

			this.dom = dom;
		}
	});

	fg.playgroundCallback(function (dom) {
		var
			i,
			length = fonts_to_init.length
		;

		// Now that the playground has been initalized, initialize the DOM of the fonts
		for (i = 0; i < length; i += 1) {
			fg.r[fonts_to_init[i]].initDOM();
		}
		fonts_to_init.splice(0, length);
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	overrides.PText = fg.pick(fg.PText, [
		'init',
		'remove'
	]);

	fg.extend(fg.PText, {
		init: function (name, options, parent) {
			overrides.PText.init.apply(this, arguments);

			this.old_options = {};
		},

		// Public functions

		remove: function () {
			if (this.dom) {
				this.dom.remove();
			}

			overrides.PText.remove.apply(this, arguments);
		},

		// Implementation details

		calcWidth: function (font, text) {
			var
				font_dom = font.dom,
				width
			;

			font_dom.html(text);
			width = font_dom.width();

			return width;
		},

		draw: function () {
			var
				options = this.options,
				old_options = this.old_options,
				insidePlayground = fg.insidePlayground(this),
				dom = this.dom,
				left = this.left,
				top = this.top,
				text = options.text,
				font = options.font,
				fill_color = options.fillColor,
				stroke_color = options.strokeColor,
				stroke_width = (stroke_color && options.strokeWidth) || 0,
				angle = options.angle,
				scaleh = options.scaleh,
				scalev = options.scalev,
				alpha = options.alpha,
				hidden = options.hidden,
				css_options = {},
				update_css = false,
				support = fg.support,
				transformFunction = support.transformFunction,
				ieFilter = support.ieFilter,
				apply_ie_filters = false,
				last_sprite = fg.last_sprite,
				solid_color
			;

			if (fg.insidePlayground(this) && text && font && alpha && scaleh && scalev && !hidden && (fill_color || stroke_width)) {
				if (!dom) {
					dom = $(['<div id="', fg.domPrefix, this.name, '"></div>'].join(''));
					dom.addClass(fg.cssClass);	// Reset background properties set by external CSS

					if (last_sprite === parent) {
						dom.prependTo(fg.s[parent].dom);
					} else {
						dom.insertAfter(fg.s[last_sprite].dom);
					}

					old_options.last_sprite = last_sprite;

					this.dom = dom;

					if (ieFilter) {
						this.ieFilters = {
							matrix: '',
							alpha: '',
							gradient: '',
							image: ''
						};
					}
				} else {
					if (last_sprite !== old_options.last_sprite) {
						// The position in the DOM has changed
						dom.detach();
						if (last_sprite === parent) {
							dom.prependTo(fg.s[parent].dom);
						} else {
							dom.insertAfter(fg.s[last_sprite].dom);
						}

						old_options.last_sprite = last_sprite;
					}
				}

				fg.last_sprite = this.name;

				if (insidePlayground !== old_options.insidePlayground) {
					dom.show();
					old_options.insidePlayground = insidePlayground;
				}

				if (hidden !== old_options.hidden) {
					dom.show();
					old_options.hidden = hidden;
				}

				if (left !== old_options.left) {
					css_options.left = [String(left - options.posOffsetX), 'px'].join('');
					update_css = true;

					old_options.left = left;
				}

				if (top !== old_options.top) {
					css_options.top = [String(top - options.posOffsetY), 'px'].join('');
					update_css = true;

					old_options.top = top;
				}

				if (font !== old_options.font) {
					if (!old_options.font) {
						dom.show();
					}

					css_options.font = font.CSSString;
					update_css = true;

					if (ieFilter) {
						if (angle || (scaleh !== 1) || (scalev !== 1)) {
							// For transformed objects force the update of the ie filters in order
							// to have the position adjusted according to the transformed width and height
							apply_ie_filters = true;
						}
					}

					old_options.font = font;
				}

				if (fill_color !== old_options.fillColor) {
					if (fill_color) {
						css_options.color = fill_color.getSolidColor();
					} else {
						css_options.color = 'transparent';
					}
					update_css = true;

					old_options.fillColor = fill_color;
				}

				if ((stroke_width !== old_options.strokeWidth) || (stroke_color !== old_options.strokeColor)) {
					if (support.textshadow) {
						if (stroke_width) {
							solid_color = stroke_color.getSolidColor();
							css_options[support.textshadow] = [
								'-1px -1px 0 ', solid_color, ', ',
								'1px -1px 0 ', solid_color, ', ',
								'-1px 1px 0 ', solid_color, ', ',
								'1px 1px 0 ', solid_color
							].join('');
						} else {
							css_options[support.textshadow] = '';
						}
						update_css = true;
					}

					old_options.strokeWidth = stroke_width;
					old_options.strokeColor = stroke_color;
				}

				if (text !== old_options.text) {
					if (!old_options.text) {
						dom.show();
					}

					dom.html(text);

					if (ieFilter) {
						if (angle || (scaleh !== 1) || (scalev !== 1)) {
							// For transformed objects force the update of the ie filters in order
							// to have the position adjusted according to the transformed width and height
							apply_ie_filters = true;
						}
					}

					old_options.text = text;
				}

				if	(
						(angle !== old_options.angle)
					||	(scaleh !== old_options.scaleh)
					||	(scalev !== old_options.scalev)
					) {
					if ((!old_options.scaleh) || (!old_options.scalev)) {
						dom.show();
					}

					if (transformFunction) {
						css_options[transformFunction] = this.transform();
						update_css = true;
					} else if (ieFilter) {
						this.ieTransform();
						update_css = true;
						apply_ie_filters = true;
					} else {
						$.noop();	// Transforms not supported
					}

					old_options.angle = angle;
					old_options.scaleh = scaleh;
					old_options.scalev = scalev;
				}

				if (alpha !== old_options.alpha) {
					if (!old_options.alpha) {
						dom.show();
					}

					if (support.opacity) {
						if (alpha !== 1) {
							css_options[support.opacity] = String(alpha);
						} else {
							css_options[support.opacity] = '';
						}
						update_css = true;
					} else if (ieFilter) {
						this.ieAlpha();
						update_css = true;
						apply_ie_filters = true;
					} else {
						$.noop();	// Opacity not supported
					}

					old_options.alpha = alpha;
				}

				if (update_css) {
					dom.css(css_options);
				}

				if (ieFilter && apply_ie_filters) {
					this.applyIeFilters();
				}
			} else {
				if (dom) {
					fg.last_sprite = this.name;

					if (!insidePlayground && (insidePlayground !== old_options.insidePlayground)) {
						dom.hide();
						old_options.insidePlayground = insidePlayground;
					}

					if (!font && (font !== old_options.font)) {
						dom.hide();
						old_options.font = font;
					}

					if ((!fill_color) && (fill_color !== old_options.fillColor)) {
						dom.css('color', 'transparent');
						old_options.fillColor = fill_color;
					}

					if ((!stroke_width) && ((stroke_width !== old_options.strokeWidth) || (stroke_color !== old_options.strokeColor))) {
						if (support.textshadow) {
							dom.css(support.textshadow, '');
						}

						old_options.strokeWidth = stroke_width;
						old_options.strokeColor = stroke_color;
					}

					if ((!text) && (text !== old_options.text)) {
						dom
							.html('')
							.hide()
						;

						old_options.text = text;
					}

					if (hidden && (hidden !== old_options.hidden)) {
						dom.hide();
						old_options.hidden = hidden;
					}

					if ((!alpha) && (alpha !== old_options.alpha)) {
						dom.hide();
						old_options.alpha = alpha;
					}

					if ((!scaleh) && (scaleh !== old_options.scaleh)) {
						dom.hide();
						old_options.scaleh = scaleh;
					}

					if ((!scalev) && (scalev !== old_options.scalev)) {
						dom.hide();
						old_options.scalev = scalev;
					}
				}
			}
		}
	});
}(jQuery, friGame));

