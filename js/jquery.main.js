/*
 * jQuery PushMenu plugin
 */
;(function($){
    function PushMenu(options){
        this.options = $.extend({
            opener: '.js-push-opener',
            slide: '.js-push-slide',
            activeClass: 'pushed',
            direction: 'left', // or right
            hideOnClickOutside: false,
            pushContainer: true,
            stretchSlideToContainer: false,
            animSpeed: 400,
            onInit:null,
            animStart:null,
            animEnd:null
        }, options);
        this.init();
    }
    PushMenu.prototype = {
        init: function(){
            this.findElements();
            this.attachEvents();

            this.makeCallback('onInit', this);
        },
        findElements: function(){
            this.holder = $(this.options.holder);
            this.opener = this.holder.find(this.options.opener);
            this.slide = this.holder.find(this.options.slide);

            this.slideWidth = this.slide.outerWidth();
            this.propObj = {};
            
            if (this.options.pushContainer){
                this.box = this.holder;
                this.direction = (this.options.direction === 'right') ? -1 : 1;
                this.propObj.marginLeft = (this.holder.hasClass(this.options.activeClass)) ? this.slideWidth * this.direction : 0
            } else {
                this.box = this.slide;
                this.propObj = {position: 'absolute'};
                this.propObj[this.options.direction] = (this.holder.hasClass(this.options.activeClass)) ? this.slideWidth : 0;
            }

            this.box.css(this.propObj);

            if (this.holder.hasClass(this.options.activeClass)){
                if (this.options.stretchSlideToContainer){
                    this.slide.height(this.holder.outerHeight());
                }
            }
        },
        attachEvents: function(){
            var self = this,
                winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                timer;

            this.clickHandler = function(e){
                e.preventDefault();

                if (self.holder.hasClass(self.options.activeClass)) {
                    self.hideSlide();
                } else {
                    self.showSlide();
                }
            };
            this.outsideClickHandler = function(e) {
                if(self.options.hideOnClickOutside) {
                    var target = $(e.target);
                    if (!target.closest(self.slide).length && !target.closest(self.opener).length) {
                        self.hideSlide();
                    }
                }
            };
            this.resizeHandler = function(){
                if (timer) clearTimeout(timer);
                timer = setTimeout(function(){
                    if (+winWidth !== +(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)){
                        self.hideSlide();
                        winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;;
                    }
                }, 100);
            };

            if (this.holder.hasClass(this.options.activeClass)) {
                $(document).on('click touchstart', this.outsideClickHandler);
            }

            this.opener.on('click touchstart', this.clickHandler);
            $(window).on('resize orientationchange', this.resizeHandler);
        },
        showSlide: function(){
            var self = this;
            if (this.options.pushContainer){
                this.propObj.marginLeft = this.slideWidth * this.direction;
            } else {
                this.propObj[this.options.direction] = this.slideWidth;
            }

            this.makeCallback('animStart', true, this);
            this.box.stop().animate(this.propObj, this.options.animSpeed, function(){
                self.makeCallback('animEnd', true, self);
            });

            if (this.options.stretchSlideToContainer){
                this.slide.height(this.holder.outerHeight());
            }

            this.holder.addClass(this.options.activeClass);

            $(document).on('click touchstart', this.outsideClickHandler);
        },
        hideSlide: function(){
            var self = this;
            if (this.options.pushContainer){
                this.propObj.marginLeft = 0;
            } else {
                this.propObj[this.options.direction] = 0;
            }

            this.makeCallback('animStart', false, this);
            this.box.stop().animate(this.propObj, this.options.animSpeed, function(){
                self.makeCallback('animEnd', false, self);
            });

            this.holder.removeClass(this.options.activeClass)

            $(document).off('click touchstart', this.outsideClickHandler);
        },
        makeCallback: function(name) {
            if(typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments, 1);
                this.options[name].apply(this, args);
            }
        },
        destroy: function(){
            this.holder.css({marginLeft: ''}).removeClass(this.options.activeClass);
            this.opener.off('click touchstart', this.clickHandler);
            this.slide.css({position:'',left:'', right:'',height:''});
            $(window).off('resize orientationchange', this.resizeHandler);
            $(document).off('click touchstart', this.outsideClickHandler);
            this.holder.removeData('PushMenu')
        }
    }

    $.fn.pushMenu = function(options){
        return this.each(function(){
            var elem = $(this);
            if (!elem.data('PushMenu')){
                elem.data('PushMenu', new PushMenu($.extend(options, {holder:this})));
            }
        });
    };
})(jQuery);
