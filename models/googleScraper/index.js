"use strict";
/**
 * @Purpose: Interface to phantom library
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson@stickyeyes.com>
 *
 */

var event     = require('events').EventEmitter,
    phantom   = require('../phantomGatherer'),
    captcha   = require('../deCaptcha'),
    cropper   = require('../cropImage'),
    selector  = require('../selectors'),

/**
 * Main interface to phantom lib
 */
googleScraper = {
    __proto__: event.prototype,
    ph: null,
    page: null,
    phantom: null,
    captchaInfo: {},
    captchaCount:0,
    engine: null,
    keyword: null,
    region: null,
    serps:[],

    /**
     * Constructor
     *
     * @param engine
     * @param keyword
     * @param region
     * @returns {*}
     */
    init: function(engine, keyword, region) {
        this.phantom = phantom.init(engine, keyword, region);
        this.captcha = captcha.init();
        this.cropper = cropper.init();

        return this;
    },

    /**
     * Called from Main app
     * Listen to phantom signals (simulates human behaviour)
     */
    listen: function() {

        var self = this;

        // phantom ready
        this.phantom.once('hookup', function(params) {
            self.ph   = params.ph;
            self.page = params.page;

            self.phantom.open(self.page);
        });

        // pages loaded
        this.phantom.on('pageOpened', function pageOpened() {
            console.log("Page is open");
            setTimeout(function() {
                self.phantom.findQueryFormAndSubmit(self.page, selector, self.keyword);
            }, 2000);
        });

        // form found filled and submitted
        this.phantom.on('formSubmitted', function formSubmitted() {
            setTimeout(function() {
                console.log("Looking for localisation");
                self.phantom.findLocalisation(self.page, selector);
            },2000);
        });

        // localisation tab found
        this.phantom.on('foundLocalisation', function foundLocalisation() {
            console.log("Found search bar");
            self.phantom.findNextLocalisationElement(self.page, selector);
        });

        // localisation opened
        this.phantom.on('foundLocalisationText', function foundLocalisationText() {
            console.log("Found localisation element");
            self.phantom.evaluate(self.page, selector);
        });

        // Region box
        this.phantom.on('foundLocalisationNext', function foundLocalisationNext() {
            console.log("Adding localisation text");
            self.phantom.addNewLocalisationText(self.page, selector, 'Leeds');
        });

        // no localisation Google.com probably
        this.phantom.on('foundNoLocalisation', function foundNoLocalisation(){
            console.log('foundNoLocalisation');
            self.phantom.evaluate(self.page, selector);
        });

        // Page loaded and evaluated links returned
        this.phantom.on('linksFound', function linksFound(result){
            self.addLinks(result);
            self.getNext();
        });

        // Click next
        this.phantom.on('pageNext', function pageNext(){
            self.phantom.evaluate(self.page, selector);
        });

        // Captcha found, handle it
        this.phantom.on('captcha', function captcha(captcha){
            console.log("|Captcha is", captcha);
            self.handleCaptcha(captcha);
        });

        // Captcha image cropped and ready for sending
        this.cropper.on('imageCropped', function imageCropped(data) {
            console.log("Cropped true");
            self.captcha.send(data);
        });

        // De captha service responded, use the result
        this.captcha.on('deCaptcha', function deCaptcha(result) {
            console.log("deCaptcha", result);

            self.captchaInfo = result;
            self.phantom.findCaptchaFormAndSubmit (self.page, result.text, selector);
        });

        // Captcha defeated? Evaluate the page (will result in links or captcha)
        this.phantom.on('captchaSubmitted', function captchaSubmitted() {
            self.phantom.evaluate(self.page, selector);
        });

        // Handle all error signals
        this.phantom.on('error', function error(error) {
            self.handleErrors(error);
        });
    },

    /**
     * Kicks off the phantom headless browser
     */
    bootPhantom: function() {
        this.phantom.initPhantom();
    },

    /**
     * Handle captcha
     * @param captcha
     */
    handleCaptcha: function(captcha) {
        this.captchaCount ++;

        if(this.captchaCount == 2) {
            this.captcha.badPicture2(this.captchaInfo.majorId, this.captchaInfo.minorId);
        }

        if(this.captchaCount == 3) {
            this.captcha.badPicture2(this.captchaInfo.majorId, this.captchaInfo.minorId);
            setTimeout(function(){
                process.exit();
            }, 600000)
        }

        this.cropImage(this.page, captcha, null);
    },

    /**
     * Get the image pull its coords and crop it.
     * @param page
     * @param image
     * @param runData
     */
    cropImage: function(page, image, runData) {

        var self = this;

        // Phantom can take a screen shot. Cool
        page.render('./sorry.jpg', function takeScreenShot() {

            var captcha = {
                "x"     : image.image.x,
                "y"     : image.image.y,
                "width" : image.image.width,
                "height": image.image.height
            };

            self.cropper.crop(captcha, runData);
        });
    },

    /**
     * Push all found links into serps storage
     * @param links
     */
    addLinks: function(links) {
        if(links) {
           this.serps.push(links);
        }
    },

    /**
     * Work out Next or jack
     */
    getNext: function() {
        if(this.getNumberOfSerpsGatherered() > 100) {
            this.emit('success', this.serps);
            this.ph.exit();
        } else {
            this.phantom.clickNext(this.page, selector);
        }
    },

    /**
     * Return number of links
     * Need to drill down
     *
     * @returns {number}
     */
    getNumberOfSerpsGatherered: function() {
        var i, serp={}, count=0;

        for(i in this.serps) {
            if(this.serps.hasOwnProperty(i)){
                serp=this.serps[i];
                if(serp.links && serp.links.length > 0) {
                    count += serp.links.length;
                }
            }
        }

        return count;
    },

    /**
     * Error Handler
     *
     * @param error
     */
    handleErrors: function(error) {
        switch(error.code) {
            default:
               this.emit('error', error);
        }
    }
};

module.exports = googleScraper;