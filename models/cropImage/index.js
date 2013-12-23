"use strict";

/**
 * @Purpose: Crops a section from an image.
 * In this case we are cropping the sorry image on a google captcha page
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson@stickyeyes.com>
 * @type {*}
 */

var easyimg = require('easyimage');
var event   = require('events').EventEmitter;

var imageCropper = {
    __proto__: event.prototype,
    init: function() { return this; },
    crop: function(image, runData) {
        var self = this;

        console.log(image);

        easyimg.crop( {
            src       : "/tmp/sorry.jpg",
            dst       : "/tmp/sorry-cropped.jpg",
            gravity   : 'NorthWest',
            cropwidth : image.width,
            cropheight: image.height,
            x         : image.x,
            y         : image.y

        }, function renderCrop (err, stdout, stderr) { //  callback for easyimg.crop
            if (err) throw err;
            self.emit('imageCropped', runData);
        });
    }

};

module.exports = imageCropper;
