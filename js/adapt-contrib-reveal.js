/*
* adapt-contrib-reveal
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Brian Quinn <brian@learningpool.com>
*/
define(function(require) {

    var ComponentView = require("coreViews/componentView");
    var Adapt = require("coreJS/adapt");

    var Reveal = ComponentView.extend({
        
        events: function () {
            return Adapt.device.touch == true ? {
                'touchstart .reveal-widget-control-left':'clickReveal',
                'touchstart .reveal-widget-control-right':'clickReveal',
                'inview' : 'inview'
            }:{
                'click .reveal-widget-control-left':'clickReveal',
                'click .reveal-widget-control-right':'clickReveal',
                'inview' : 'inview'
            }
        },

        preRender: function() {
            this.listenTo(Adapt, 'pageView:ready', this.setupReveal, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);

            this.setDeviceSize();
        },

        setupReveal: function() {
            var direction = !this.model.get('_direction') ? "left" : this.model.get('_direction');
            var imageWidth = this.$('.reveal-widget').width();
            this.$('.reveal-widget-slider').css('margin-left', (direction == 'right') ? -imageWidth : 0);
console.log('slider margin ' + this.$('.reveal-widget-slider').css('margin-left'));
            this.$('.reveal-widget-item').addClass('reveal-' + direction);
console.log('Hi');
            //this.$('.reveal-widget-control-left').addClass('reveal-' + direction);
            //this.$('.reveal-widget-control-right').addClass('reveal-' + direction);

            this.model.set('_direction', direction);
            this.model.set('_active', true);
            this.model.set('_revealed', false);

            this.setControlText(false);

            this.calculateWidths();
        },

        setControlText: function(isRevealed) {
            if (this.model.get('_control')) {
                if (!isRevealed && this.model.get('control').showText) {

                    this.$('.reveal-widget-control-right').attr('title', this.model.get('control').showText);
                }

                if (isRevealed && this.model.get('control').hideText) {
                    this.$('.reveal-widget-control-left').attr('title', this.model.get('control').hideText);
                }
            }
        },

        calculateWidths: function() {
            var direction = this.model.get('_direction');
            var imageWidth = this.$('.reveal-widget').width();
            var margin = -imageWidth; 

            this.$('.reveal-widget-slider').css('width', 2 * imageWidth);

            this.$('.reveal-widget-slider').css('margin-' + direction, margin);

            this.model.set('_scrollWidth', imageWidth);
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false)
            }
        },

        resizeControl: function() {           
            var imageWidth = this.$('.reveal-widget').width();
            var direction = this.model.get('_direction');
            var scrollWidth = this.model.get('_scrollWidth');

            var sliderAnimation = {};

            if (this.model.get('_revealed')) {
                this.$('.reveal-widget-slider').css('margin-left', (direction == 'left') ? -imageWidth : 0);
                sliderAnimation['margin-left'] = (direction == 'left') ? 0 :  -imageWidth
                this.$('.reveal-widget-slider').animate(sliderAnimation);
            } else {
                this.$('.reveal-widget-slider').css('margin-left', (direction == 'left') ? imageWidth : 0);
            }

            this.$('.reveal-widget-slider').css('width', 2 * imageWidth);
            this.$('.reveal-widget-slider').css('margin-' + direction, -imageWidth);            
            this.model.set('_scrollWidth', imageWidth);
        },

        postRender: function () {
            this.$('.reveal-widget').imageready(_.bind(function() {
                this.setReadyStatus();
            }, this));
        },

        getOppositeDirection: function(direction) {
            switch(direction) {
                case 'left':
                    oppositeDirection = 'right';
                    break;
                case 'right':
                    oppositeDirection = 'left';
                    break;
            }
            return oppositeDirection;
        },

        clickReveal: function (event) {
            event.preventDefault();

            var direction = this.model.get('_direction');
            var scrollWidth = this.model.get('_scrollWidth');
            var controlMovement = (!this.model.get('_revealed')) ? scrollWidth : scrollWidth; 
            var operator = !this.model.get('_revealed') ? '+=' : '-=';
            var controlAnimation = {}, sliderAnimation = {};

            if (!this.model.get('_revealed')) {
                this.model.set('_revealed', true);
                this.$('.reveal-widget').addClass('reveal-showing');

                sliderAnimation['margin-left'] = (direction == 'left') ? 0 : -scrollWidth;

                this.setCompletionStatus();
            } else {
                this.model.set('_revealed', false);
                this.$('.reveal-widget').removeClass('reveal-showing');
                // set the values for slider animation
                sliderAnimation['margin-left'] = (direction == 'left') ? operator + controlMovement : 0
            }
            // Change the UI to handle the new state
            this.$('.reveal-widget-slider').animate(sliderAnimation);
            this.setControlText(this.model.get('_revealed'));
        }
    });
    
    Adapt.register("reveal", Reveal);
    
    return Reveal;
});