
var phantom   = require('phantom');
var event     = require('events').EventEmitter;

var selector  = require('./models/selectors');
var easyImage = require('./models/cropImage');
var decaptcha = require('./models/deCaptcha');

var cropper = easyImage.init();
var captcha = decaptcha.init();

var PhantomGatherer = {
  __proto__: event.prototype,

  engine  : null,
  keyword : null,
  region  : null,

  init: function(engine, keyword, region) {
      this.engine  = engine;
      this.keyword = keyword;
      this.region  = region;

      return this;
  },

  initPhantom: function() {
     var self = this;

     return phantom.create(function(ph){
         self.create(ph);
     });
  },

  setUp: function(page) {

      page.set('Referer', this.engine);
      page.set('settings.userAgent', 'Mozilla/5.0 (Windows NT 6.2) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.12 Safari/535.11');
      page.set('settings.javascriptEnabled', true);
      page.set('settings.loadImages', true);
      page.set('cookies', '/tmp/cookies.txt');

      page.set('onConsoleMessage', function (msg) {
          console.log(msg);
      });

      page.set('onError', function (msg, trace)  {
          console.log(msg, trace);
      });


      page.set('onResourceRequested', function (request) {
         // console.log('Request ' + JSON.stringify(request, undefined, 4));
      });

      return;
  },

  create: function(ph) {
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

  findQueryFormAndSubmit: function(page, selector) {
        var self = this;

            return page.evaluate(function(selector, keyword) {

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

            if(document.querySelector('input[name=q]')) {

                document.querySelector('input[name=q]').value = keyword;

                console.log("Form set to", document.querySelector('input[name=q]').value);

                if(document.forms[0]) {
                    var forms   = document.forms[0];
                    var newForm = document.createElement('form');
                    newForm.submit.apply(forms);
                    return true;
                }
            }

            return false;

        }, function(result) {
                console.log(result);

                if(result == true) {
                    self.emit('formSubmitted');
                }
                else if (result == false ) {
                    self.emit('error', {'code': 300, 'message': 'Cannot submit the form'});
                }
                else if(result.state && result.state == "captcha" ) {
                    self.emit('captcha', result);
                }

        }, selector, this.keyword);

        
        return;
  },

  findLocalisation: function(page, selector) {

        var self = this;

        return page.evaluate( function (selector) {
            //console.log(document.getElementsByTagName('html')[0].innerHTML);

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
   /*
    * Action: clicks google location selector
    */
    findNextLocalisationElement: function(page, selector) {

        var self = this;

        return page.evaluate( function evalPage(selector) {

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
                var el = els[els.length-1]

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

    addNewLocalisationText: function(page, selector, region) {
        var self = this;

        page.evaluate( function evalPage(region, selector) {

                console.log("Region", region)

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
                else {
                    return false;
                }
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

    evaluate: function(page, selector) {
        var self = this;

        console.log(selector.serps);

        setTimeout(function() {
          return page.evaluate(function(selector) {

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
                        "href"   : location.href
                    }
                 }

                 return {
                     "success": false
                 }
             }

         }, function evalHandler(result) {

              if(result.success == true) {
                  console.log("Location", result.href);
                  self.emit('linksFound', result.links);
              }

              else if (result.success == false) {
                 self.emit('error', {'code': 400, 'message': 'no links found'});
              }

              else if(result.state && result.state ==  "captcha"){
                  self.emit('captcha', result);
              }

              return;

         }, selector);
      }, 5000); 
  },

  clickNext: function(page, selector) {
        var self = this;

        page.evaluate(function(selector)
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

    findCaptchaFormAndSubmit: function(page, captcha_text, runData) {

        var self = this;

        return page.evaluate(function fillAndSubmit(captcha_text) {

            if(document.getElementById('captcha')) {

                document.getElementById('captcha').value = captcha_text;

                console.log("Captcha form value", document.getElementById('captcha').value);

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

        }, function formHandler(result) {

            (result === true) ?
                    self.emit('captchaSubmitted', runData) :
                    self.emit('error', {"error": 800, "message": result});

            return;

        },captcha_text);
    },

    cropImage: function(page, image, runData) {

        var self = this;

        page.render('./sorry.jpg', function takeScreenShot() {

            var captcha = {
                "x"     : image.image.x,
                "y"     : image.image.y,
                "width" : image.image.width,
                "height": image.image.height
            };

            cropper.crop(captcha, runData);
        });
    }
};

var engine   = process.argv[2] || "https://www.google.co.uk/firefox";
var keyword  = process.argv[3] || 'Apple';
var region   = process.argv[4] || 'United Kingdom';

var spook = PhantomGatherer.init(engine, keyword, region);
var ph    = null;
var page  = null;
var serps = [];

var captchaInfo = {};

spook.once('hookup', function(params) {
   ph   = params.ph;
   page = params.page;

   spook.open(page);
});

spook.on('pageOpened', function() {
   console.log("Page is open");
   //console.log("Captcha?", spook.hasCaptcha(page, selector));
   setTimeout(function() {
      spook.findQueryFormAndSubmit(page, selector, keyword);
   }, 2000);
});

// form submitted signal
spook.on('formSubmitted', function() {
   setTimeout(function() {
      console.log("Looking for localisation");
      spook.findLocalisation(page, selector);
   },2000);
});

spook.on('foundLocalisation', function() {
    spook.findNextLocalisationElement(page, selector);
});

spook.on('foundLocalisationNext', function() {
    spook.addNewLocalisationText(page, selector, 'Leeds');
});

spook.on('foundLocalisationText', function() {
    spook.evaluate(page, selector);
});

spook.on('foundNoLocalisation', function(){
    console.log('foundNoLocalisation');
    spook.evaluate(page, selector);
});

spook.on('linksFound', function(links){
    console.log("Found", links);

    for(var l in links){
        if(links.hasOwnProperty(l)){
            serps.push(links[l]);
        }
    }

    if(serps.length > 100) {
       console.log("Serps", serps);
       ph.exit();
    } else {
       spook.clickNext(page, selector);
    }
});

spook.on('pageNext', function(){
    spook.evaluate(page, selector);
});

spook.on('captcha', function(captcha){

   spook.cropImage(page, captcha, null);

   console.log("|Captcha is", captcha);
});

cropper.on('imageCropped', function(data) {
    console.log("Cropped true");
    captcha.send(data);
});

captcha.on('deCaptcha', function gotCaptchaText(result) {
    console.log("deCaptcha", result);

    captchaInfo = result;
    spook.findCaptchaFormAndSubmit (page, result.text, {});
});

spook.on('captchaSubmitted', function() {
    spook.evaluate(page, selector);

});

spook.on('error', function(error) {
   console.log(error);
});

spook.initPhantom();


