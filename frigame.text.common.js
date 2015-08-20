/*global friGame */
/*jslint white: true, browser: true */

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

(function (fg) {
	'use strict';

	var
		texts = {}
	;

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.PFont = {
		init: function (name, options) {
			var
				my_options,
				new_options = options || {}
			;

			if (this.options) {
				my_options = this.options;
			} else {
				my_options = {};
				this.options = my_options;
			}

			this.name = name;

			// Set default options
			fg.extend(my_options, {
				// Public options
				style: 'normal',		// normal, italic, oblique
				weight: 'normal',		// normal, bold, bolder, lighter, 100, 200, 300, 400, 500, 600, 700, 800, 900
				size: 10,				// px
				family: 'sans-serif'

				// Implementation details
			});

			new_options = fg.extend(my_options, fg.pick(new_options, [
				'style',
				'weight',
				'size',
				'family'
			]));

			fg.extend(this, fg.pick(my_options, [
				'style',
				'weight',
				'size',
				'family'
			]));

			if (navigator.isCocoonJS) {
				// Ugly user agent sniffing in order to support CocoonJS poor font string implementation
				this.CSSString = [String(my_options.size), 'px ', my_options.family].join('');
			} else {
				this.CSSString = [my_options.style, ' ', String(my_options.weight), ' ', String(my_options.size), 'px/', String(my_options.size), 'px ', my_options.family].join('');
			}
		},

		// Public functions

		remove: function () {
			var
				name,
				text
			;

			for (name in texts) {
				if (texts.hasOwnProperty(name)) {
					text = fg.s[name];
					if (text.options.font === this) {
						text.setText({font: null});
					}
				}
			}
		}

		// Implementation details
	};

	fg.Font = fg.Maker(fg.PFont);

	fg.resourceManager.addFont = function (name, options) {
		var
			font = fg.Font(name, options)
		;

		return fg.resourceManager.addResource(name, font);
	};

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.PText = Object.create(fg.PBaseSprite);
	fg.extend(fg.PText, {
		init: function (name, options, parent) {
			var
				my_options,
				new_options = options || {}
			;

			if (this.options) {
				my_options = this.options;
			} else {
				my_options = {};
				this.options = my_options;
			}

			// Set default options
			fg.extend(my_options, {
				// Public options
				text: null,
				font: null,
				fillColor: null,
				strokeColor: null,
				strokeWidth: 2

				// Implementation details
			});

			fg.PBaseSprite.init.apply(this, arguments);

			texts[name] = true;

			// If the text has not been defined, force
			// the text to null in order to resize and move
			// the sprite inside setText
			if (new_options.text === undefined) {
				new_options.text = null;
			}

			this.setText(new_options);
		},

		// Public functions

		remove: function () {
			delete texts[this.name];

			fg.PBaseSprite.remove.apply(this, arguments);
		},

		setText: function (options) {
			var
				my_options = this.options,
				new_options = options || {},
				text,
				font,
				text_redefined = new_options.text !== undefined,
				font_redefined = new_options.font !== undefined
			;

			if (text_redefined) {
				my_options.text = new_options.text;
			}

			if (font_redefined) {
				my_options.font = fg.r[new_options.font];
			}

			if (new_options.fillColor !== undefined) {
				my_options.fillColor = fg.r[new_options.fillColor];
			}

			if (new_options.strokeColor !== undefined) {
				my_options.strokeColor = fg.r[new_options.strokeColor];
			}

			if (new_options.strokeWidth !== undefined) {
				my_options.strokeWidth = new_options.strokeWidth * 2;
			}

			if (text_redefined || font_redefined) {
				text = my_options.text;
				font = my_options.font;

				if (text && font) {
					new_options.width = this.calcWidth(font, text);
					new_options.height = font.size;
				} else {
					new_options.width = 0;
					new_options.height = 0;
				}

				// Call the resize method with all the options in order to update the position
				fg.PBaseSprite.resize.call(this, new_options);
			}

			return this;
		},

		resize: null	// Text cannot be explicitly resized
	});

	fg.Text = fg.Maker(fg.PText);

	fg.extend(fg.PSpriteGroup, {
		addText: function (name, options) {
			var
				text = fg.Text(name, options, this.name)
			;

			this.layers.push({name: name, obj: text});

			return this;
		},

		insertText: function (name, options) {
			var
				text = fg.Text(name, options, this.name)
			;

			this.layers.unshift({name: name, obj: text});

			return this;
		}
	});
}(friGame));

