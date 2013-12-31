"use strict";

/**
 * @Purpose: Interface to the main PERL libs that come with decaptcha
 * These can easily be swapped out for the php flavour
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson>
 * @type {*}
 */

var exec   = require('child_process').exec;  // fork()
var event  = require('events').EventEmitter;

var BAD  = "/usr/bin/perl " + __dirname + "/perl/bad.pl";
var MAIN = "/usr/bin/perl " + __dirname + "/perl/main.pl";

// We use a perl API provided by the captcha service
// its dependant upon screen rendered images (heandless browsers can do this)
var doDecaptcha = {
    __proto__: event.prototype,

    badPictureCommand: BAD,
    captchaCommand:    MAIN,

    /**
     *
     * @returns {*}
     */
    init: function() {
        return this;
    },

    /**
     * Send decaptcha request
     * @param runData
     */
    send: function (runData) {
        var self = this;

        exec(this.captchaCommand, function execPerl (err, stdout, stderr) {
            if(err) {throw new Error(err)}
            var res  = JSON.parse(stdout);

            self.emit('deCaptcha', {
                "text": res.text,            // return captcha text
                "majorId": res.major_id,     // keep this if captcha text fails
                "minorId": res.minor_id,     // and this (see badPicture2)
                "runData":runData
            });
        });
    },

    /**
     * Send badPicture 2 request
     * @param majorId
     * @param minorId
     */
    badPicture2: function sendBadPicture(majorId, minorId) {
        var command = this.badPictureCommand + " " + majorId + " " + minorId;
        var self    = this;

        exec(command, function(err, stdout, stderr) {
            if(!err) {
                if(DEBUG) {
                    console.log("badpicture", res.text);
                }
                self.emit('badpicture', {
                    "stdout": stdout,
                    "stderr": stderr
                });
            }
        });
    }
};

module.exports = doDecaptcha;
