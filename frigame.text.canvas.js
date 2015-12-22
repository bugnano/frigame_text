/*global friGame */
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

(function (fg) {
	'use strict';

	var
		overrides = {}
	;

	overrides.PText = fg.pick(fg.PText, [
		'init',
		'remove',
		'setText'
	]);

	fg.extend(fg.PText, {
		init: function (name, options, parent) {
			var
				canvas
			;

			canvas = document.createElement('canvas');
			canvas.width = 16;
			canvas.height = 16;

			this.canvas = canvas;
			this.canvas_width = 16;
			this.canvas_height = 16;
			this.ctx = canvas.getContext('2d');

			this.needsPrerender = false;

			overrides.PText.init.apply(this, arguments);

			this.old_options = {};

			this.gradients = {};
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

			overrides.PText.remove.apply(this, arguments);
		},

		setText: function (options) {
			var
				my_options = this.options
			;

			overrides.PText.setText.apply(this, arguments);

			if (my_options.text && my_options.font && (my_options.fillColor || (my_options.strokeColor && my_options.strokeWidth))) {
				this.needsPrerender = true;
			}

			return this;
		},

		// Implementation details

		calcWidth: function (font, text) {
			var
				ctx = fg.ctx,
				width
			;

			ctx.save();
			ctx.font = font.CSSString;
			width = ctx.measureText(text).width;
			ctx.restore();

			return width;
		},

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
}(friGame));

