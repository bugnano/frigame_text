/*global friGame */
/*jslint white: true, browser: true */

// Copyright (c) 2011-2014 Franco Bugnano

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

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	fg.PFont = {
		init: function (options) {
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
				style: 'normal',		// normal, italic, oblique
				weight: 'normal',		// normal, bold, bolder, lighter, 100, 200, 300, 400, 500, 600, 700, 800, 900
				size: 10,				// px
				family: 'sans-serif'

				// Implementation details
			});

			// TO DO -- The line-height property should be calculated here in order to be consistent with an eventual DOM text backend

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

			this.CSSString = [my_options.style, ' ', String(my_options.weight), ' ', String(my_options.size), 'px ', my_options.family].join('');
		}

		// Public functions

		// Implementation details
	};

	fg.Font = fg.Maker(fg.PFont);

	fg.resourceManager.addFont = function (name) {
		var
			args = Array.prototype.slice.call(arguments, 1),
			font = fg.Font.apply(this, args)
		;

		font.name = name;

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
				new_options = options || {},
				canvas
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

			this.old_options = {};

			this.gradients = {};

			canvas = document.createElement('canvas');
			canvas.width = 16;
			canvas.height = 16;

			this.canvas = canvas;
			this.canvas_width = 16;
			this.canvas_height = 16;
			this.ctx = canvas.getContext('2d');

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
			var
				options = this.options,
				old_options = this.old_options,
				fill_color = options.fillColor,
				stroke_color = options.strokeColor,
				old_fill_color = old_options.fillColor,
				old_stroke_color = old_options.strokeColor
			;

			if (old_fill_color && old_fill_color.removeGroup) {
				old_fill_color.removeGroup(this);
			}

			if (old_stroke_color && old_stroke_color.removeGroup) {
				old_stroke_color.removeGroup(this);
			}

			if (fill_color && fill_color.removeGroup) {
				fill_color.removeGroup(this);
			}

			if (stroke_color && stroke_color.removeGroup) {
				stroke_color.removeGroup(this);
			}

			fg.PBaseSprite.remove.apply(this, arguments);
		},

		setText: function (options) {
			var
				my_options = this.options,
				new_options = options || {},
				text,
				font,
				text_redefined = new_options.text !== undefined,
				font_redefined = new_options.font !== undefined,
				ctx = fg.ctx
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

			text = my_options.text;
			font = my_options.font;

			if (text_redefined || font_redefined) {
				if (text && font) {
					ctx.save();
					ctx.font = font.CSSString;
					new_options.width = ctx.measureText(text).width;
					new_options.height = font.size;
					ctx.restore();
				} else {
					new_options.width = 0;
					new_options.height = 0;
				}

				// Call the resize method with all the options in order to update the position
				fg.PBaseSprite.resize.call(this, new_options);
			}

			if (text && font && (my_options.fillColor || (my_options.strokeColor && my_options.strokeWidth))) {
				this.needsPrerender = true;
			}

			return this;
		},

		resize: null,	// Text cannot be explicitly resized

		// Implementation details

		draw: function () {
			var
				options = this.options,
				old_options = this.old_options,
				width = this.width,
				height = this.height,
				text = options.text,
				font = options.font,
				fill_color = options.fillColor,
				stroke_color = options.strokeColor,
				stroke_width = (stroke_color && options.strokeWidth) || 0,
				stroke_half_width = stroke_width / 2,
				target_width = width + stroke_width,
				target_height = (height * 2) + stroke_width,
				old_fill_color = old_options.fillColor,
				old_stroke_color = old_options.strokeColor,
				fill_color_changed = fill_color !== old_fill_color,
				stroke_color_changed = stroke_color !== old_stroke_color,
				size_changed = (width !== old_options.width) || (height !== old_options.height),
				angle = options.angle,
				scaleh = options.scaleh,
				scalev = options.scalev,
				alpha = options.alpha,
				old_alpha,
				ctx = fg.ctx,
				canvas = this.canvas,
				my_ctx = this.ctx
			;

			if (fg.insidePlayground(this) && text && font && alpha && scaleh && scalev && !options.hidden && (fill_color || stroke_width)) {
				if (fill_color_changed || stroke_color_changed || size_changed) {
					if (fill_color_changed || size_changed) {
						if (old_fill_color && old_fill_color.removeGroup) {
							this.gradients[old_fill_color.name] -= 1;
							if (size_changed || (!this.gradients[old_fill_color.name])) {
								old_fill_color.removeGroup(this);
							}
						}

						if (fill_color && fill_color.addGroup) {
							if (!this.gradients[fill_color.name]) {
								this.gradients[fill_color.name] = 1;
							} else {
								this.gradients[fill_color.name] += 1;
							}

							fill_color.addGroup(my_ctx, this);
						}

						old_options.fillColor = fill_color;
					}

					if (stroke_color_changed || size_changed) {
						if (old_stroke_color && old_stroke_color.removeGroup) {
							this.gradients[old_stroke_color.name] -= 1;
							if (size_changed || (!this.gradients[old_stroke_color.name])) {
								old_stroke_color.removeGroup(this);
							}
						}

						if (stroke_color && stroke_color.addGroup) {
							if (!this.gradients[stroke_color.name]) {
								this.gradients[stroke_color.name] = 1;
							} else {
								this.gradients[stroke_color.name] += 1;
							}

							stroke_color.addGroup(my_ctx, this);
						}

						old_options.strokeColor = stroke_color;
					}

					old_options.width = width;
					old_options.height = height;
				}

				if (this.needsPrerender) {
					this.needsPrerender = false;

					if (this.canvas_width < target_width) {
						canvas.width = target_width;
						this.canvas_width = target_width;
					}

					if (this.canvas_height < target_height) {
						canvas.height = target_height;
						this.canvas_height = target_height;
					}

					my_ctx.clearRect(0, 0, target_width, target_height);
					my_ctx.lineJoin = 'round';
					my_ctx.font = font.CSSString;
					my_ctx.textBaseline = 'top';

					if (stroke_width) {
						stroke_color.setStrokeStyle(my_ctx, this);
						my_ctx.lineWidth = stroke_width;
						my_ctx.strokeText(text, stroke_half_width, stroke_half_width);
					}

					if (fill_color) {
						fill_color.setFillStyle(my_ctx, this);
						my_ctx.fillText(text, stroke_half_width, stroke_half_width);
					}
				}

				ctx.save();

				ctx.translate(this.centerx, this.centery);

				if (angle) {
					ctx.rotate(angle);
				}

				if ((scaleh !== 1) || (scalev !== 1)) {
					ctx.scale(scaleh, scalev);
				}

				old_alpha = fg.globalAlpha;
				if (alpha !== 1) {
					fg.globalAlpha *= alpha;
					ctx.globalAlpha = fg.globalAlpha;
				}

				fg.safeDrawImage(
					ctx,
					canvas,
					0,
					0,
					target_width,
					target_height,
					-(this.halfWidth + stroke_half_width),
					-(this.halfHeight + stroke_half_width),
					target_width,
					target_height
				);

				ctx.restore();

				fg.globalAlpha = old_alpha;
			}
		}
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

