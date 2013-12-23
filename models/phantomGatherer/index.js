"use strict";

/**
 * @Purpose: PhantomJs Headless browser interface. Simulate human behaviour
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson@stickyeyes.com>
 * @Website: http://phantomjs.org/, https://github.com/sgentle/phantomjs-node
 * @type {*}
 */

var phantom   = require('phantom');
var event     = require('events').EventEmitter;

/**
 *
 * @type {
 *   {
 *     __proto__: *,
 *     engine: null,
 *     keyword: null,
 *     region: null,
 *     start: number,
 *     init:, initPhantom:, createPage:, setUp:, open:, findQueryFormAndSubmit: Function,
 *     findLocalisation:, findNextLocalisationElement:, addNewLocalisationText: Function,
 *     evaluate:, clickNext:, findCaptchaFormAndSubmit:, getPageNumber: Function
 *   }
 * }
 */
var PhantomGatherer = {
    __proto__: event.prototype,

    engine  : null,
    keyword : null,
    region  : null,
    start   : 0,

    /**
     * Constructor
     *
     * @param engine
     * @param keyword
     * @param region
     * @returns {*}
     */
    init: function(engine, keyword, region) {
        this.engine  = engine;
        this.keyword = keyword;
        this.region  = region;

        return this;
    },

    /**
     * Setup PhantomJs
     * @returns {*}
     */
    initPhantom: function() {
        var self = this;

        return phantom.create(function(ph){
            self.createPage(ph);
        });
    },

    /**
     * Follow
     * @param ph
     * @returns {*}
     */
    createPage: function(ph) {
        var self = this;
        return ph.createPage(function(page) {

            if(page) {
                self.setUp(page);
                self.emit('hookup', {'ph': ph, 'page': page});
            } else {
                self.emit('error', {'code': 100, 'message': 'Failed to create phantom instance'});
            }
        });
    },

    /**
     * Setup the page
     *
     * @param page
     */
    setUp: function(page) {

        page.set('Referer', this.engine);
        page.set('settings.userAgent', 'Mozilla/5.0 (Windows NT 6.2) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.12 Safari/535.11');
        page.set('settings.javascriptEnabled', true);
        page.set('settings.loadImages', true);
        page.set('cookiesFile', '/tmp/cookies.txt');

        page.set('onConsoleMessage', function (msg) {
            console.log(msg);
        });

        page.set('onError', function (msg, trace)  {
            console.log(msg, trace);
        });

        page.set('onResourceRequested', function (request) {
            // console.log('Request ' + JSON.stringify(request, undefined, 4));
        });
    },

    /**
     * Open the page
     *
     * @param page
     */
    open: function(page) {
        var self = this;

        page.open(self.engine, function(status) {
            console.log("opened site? ", status);

            page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                if(status == "success") {
                    self.emit('pageOpened');
                } else {
                    self.emit('error', {'code': 200, 'message': 'page open failure'});
                }
            });
        });
    },

    /**
     * Fill in the query form
     *
     * @param page
     * @param selector
     * @returns {*}
     */
    findQueryFormAndSubmit: function(page, selector) {
        var self = this;

        return page.evaluate(function(selector, keyword) {

            // Always check
            if(document.querySelector(selector.sorry)) {

                var img = document.querySelector(selector.sorry),
                    src = img.getAttribute('src');

                return {
                    "state"  : "captcha",
                    "image"  : img,
                    "source" : src,
                    "method" : "findQueryFormAndSubmit"
                }
            }

            // Set query and submit
            if(document.querySelector(selector.queryForm)) {

                document.querySelector(selector.queryForm).value = keyword;

                console.log("Form set to", document.querySelector(selector.queryForm).value);

                if(document.forms[0]) {
                    var forms   = document.forms[0];
                    var newForm = document.createElement('form');
                    newForm.submit.apply(forms);
                    return true;
                }
            }

            return false;

        },
        /**
         * Callback for above evaluate (Phantom evaluate is sandboxed)
         * Tis how this is done
         * @param result
         */
        function(result) {
            console.log(result);

            // We can emit ourselves out of here
            if(result == true) {
                self.emit('formSubmitted');
            }
            else if (result == false || result == null ) {
                self.emit('error', {'code': 300, 'message': 'Cannot fill in or submit the form'});
            }
            else if(result && result.state && result.state == "captcha" ) {
                self.emit('captcha', result);
            }

        }, selector, this.keyword);
    },

    /**
     * Find localisation
     *
     * @param page
     * @param selector
     * @returns {*}
     */
    findLocalisation: function(page, selector) {

        var self = this;

        return page.evaluate( function (selector) {
            //console.log(document.getElementsByTagName('html')[0].innerHTML);

            // Always check
            if(document.querySelector(selector.sorry)) {

                var img = document.querySelector(selector.sorry),
                    src = img.getAttribute('src');

                return {
                    "state"  : "captcha",
                    "image"  : img,
                    "source" : src,
                    "method" : "findLocalisation"
                }
            }

            if(document.getElementById(selector.localise)) {
                var clk = document.createEvent('MouseEvent');
                var el  = document.getElementById(selector.localise);

                clk.initMouseEvent('click', true, true, el.ownerDocument.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(clk);

                return true;
            }

            return false

        },
        function(result){

            console.log("Nor here", result);

            if (result === true) {
                self.emit('foundLocalisation');
            }
            else if (result === false) {
                self.emit('foundNoLocalisation');
            }

            else if(result.state && result.state == "captcha"){
                self.emit('captcha', result);
            }

        }, selector);
    },

    /**
     * Clicks google location selector
     * @param page
     * @param selector
     * @returns {*}
     */
    findNextLocalisationElement: function(page, selector) {

        var self = this;

        return page.evaluate( function evalPage(selector) {

            // Always check
            if(document.querySelector(selector.sorry)) {

                var img = document.querySelector(selector.sorry),
                    src = img.getAttribute('src');

                return {
                    "state"  : "captcha",
                    "image"  : img,
                    "source" : src,
                    "method" : "findNextLocalisationElement"
                }
            }

            if(document.getElementsByClassName(selector.localiseNext)) {
                var clk = document.createEvent('MouseEvent');
                var els = document.getElementsByClassName(selector.localiseNext);

                // 2 class with same name, we want the latter
                var el = els[els.length-1];

                clk.initMouseEvent('click', true, true, el.ownerDocument.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                el.dispatchEvent(clk);

                return true;

            } else {
                return false;
            }

        },
        function(result) {

            console.log("localise", result);

            if(result === true) {
                self.emit('foundLocalisationNext');
            }
            else if(result == false) {
                self.emit('error', {"code": 500, "message": "Could not click " + selector.localiseNext});
            }
            else if(result.state && result.state ==  "captcha"){
                self.emit('captcha', result);
            }

        }, selector);
    },

    /**
     * Adds region to localisation
     * @param page
     * @param selector
     * @param region
     * @returns {*}
     */
    addNewLocalisationText: function(page, selector, region) {
        var self = this;

        return page.evaluate( function evalPage(region, selector) {

            console.log("Region", region);

            // Always check
            if(document.querySelector(selector.sorry)) {

                var img = document.querySelector(selector.sorry),
                    src = img.getAttribute('src');

                return {
                    "state"  : "captcha",
                    "image"  : img,
                    "source" : src,
                    "method" : "addNewLocalisationText"
                }
            }

            if(document.getElementById(selector.localisetext)) {
                document.getElementById(selector.localisetext).value = region;

                if(document.getElementsByClassName(selector.localiseSubmit)) {

                    /*
                     * This may be in a form but try and submit this and end up dead
                     * So click it instead
                     * Fires a google call
                     * WARNING: My guess is this is a point of failure due to the (..mit)[1]
                     */
                    var evt = document.createEvent('MouseEvents');
                    evt.initEvent('click', true, false);
                    document.getElementsByClassName(selector.localiseSubmit)[1].dispatchEvent(evt);

                    return true;
                }
            }

            return false;
        },
        function(result) {
            if(result === true) {
                self.emit('foundLocalisationText');
            }
            else if (result === false) {
                self.emit('foundNoLocalisation');
            }
            else if(result.state && result.state ==  "captcha"){
                self.emit('captcha', result);
            }
        },self.region, selector);
    },

    /**
     * Main link gathering evaluation
     *
     * @param page
     * @param selector
     */
    evaluate: function(page, selector) {
        var self = this;

        setTimeout(function() {

            return page.evaluate(function(selector) {
                // Always check
                if(document.querySelector(selector.sorry)) {

                    var img = document.querySelector(selector.sorry),
                        src = img.getAttribute('src');

                    return {
                        "state"  : "captcha",
                        "image"  : img,
                        "source" : src,
                        "method" : "evaluate"
                    }
                }

                // find the links
                if(document.querySelectorAll(selector.serps)) {

                    var links = document.querySelectorAll(selector.serps);
                    var urls=[], warnings=[], href;

                    // parse our links
                    [].map.call(links, function(e) {
                        href = e.getAttribute('href');

                        if(/http/.test(href)) {
                            urls.push(href);
                            // flags suspect links
                            if (!/^(f|ht)tps?:\/\//i.test(href) || /\.google/.test(href)) {
                                warnings.push(href);
                            }
                        }
                    });

                    if(urls.length > 0) {
                        return {
                            "success": true,
                            "links"  : urls,
                            "href"   : location.href,
                            "warning": warnings
                        }
                    }

                    return {
                        "success": false
                    }
                }

            },
            function evalHandler(result) {

                if(result.success == true) {
                    console.log("Location", result.href);
                    self.start++;
                    self.emit('linksFound', {"page": self.start, "links": result.links, "warnings": result.warning, "date": new Date().toString() });
                }

                else if (result.success == false) {
                    self.emit('error', {'code': 400, 'message': 'no links found'});
                }

                else if(result.state && result.state ==  "captcha"){
                    self.emit('captcha', result);
                }

            }, selector);

        }, 5000);
    },

    /**
     * Clicks Next
     *
     * @param page
     * @param selector
     * @returns {*}
     */
    clickNext: function(page, selector) {
        var self = this;

        return page.evaluate(function(selector)
        {
            if(document.getElementById(selector.nextLink)) {

                var ele = document.getElementById(selector.nextLink);
                var clk = document.createEvent('MouseEvent');

                clk.initMouseEvent('click', true, true, ele.ownerDocument.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                ele.dispatchEvent(clk);

                return true;
            }

            return false;
        },
        function(result) {
            if(result === true) {
                self.emit('pageNext', result);
            }
            else {
                self.emit('error', {"code": 800, "message": "no_" + selector.nextLink + "_element"});
            }

        }, selector);
    },

    /**
     * Fills in the captcha form
     *
     * @param page
     * @param captcha_text
     * @param selector
     * @returns {*}
     */
    findCaptchaFormAndSubmit: function(page, captcha_text, selector) {

        var self = this;

        return page.evaluate(function fillAndSubmit(captcha_text, selector) {

            if(document.getElementById(selector.captchaForm)) {

                document.getElementById(selector.captchaForm).value = captcha_text;

                console.log("Captcha form value", document.getElementById(selector.captchaForm).value);

                // find the form
                if(document.forms[0]) {
                    var forms   = document.forms[0];
                    var newForm = document.createElement('form');
                    console.log("Submit captcha form");
                    newForm.submit.apply(forms);

                    return true;
                }
            }

            return false;

        },
        function formHandler(result) {

            (result === true) ?
                self.emit('captchaSubmitted') :
                self.emit('error', {"error": 800, "message": result});

        },captcha_text, selector);
    },

    /**
     * Returns number current page number
     * @returns {number}
     */
    getPageNumber: function() {
        return this.start;
    }
};

module.exports = PhantomGatherer;