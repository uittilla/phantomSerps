"use strict";

/*
 * Author M Ibbotson (Ibbo) <mark.ibbotson>
 * Ad hoc container for slectors
 */
module.exports = {

    "serps"          : "li.g:not(#newsbox):not(#imagebox_bigimages) h3.r a:not(.sla):not(.l), div[id=topstuff] div[class=med] ul li",
    "subSerps"       : "li.g:not(#newsbox):not(#imagebox_bigimages) h3.r a.l, div[id=topstuff] div[class=med] ul li",
    "sorry"          : "img[src*=sorry]",
    "ads"            : "a[href^='/aclk']",
    "images"         : "img[src^='data\:image']",
    "queryForm"      : "input[name=q]",
    "captchaForm"    : "captcha",
    "nextLink"       : "pnnext",
    "localise"       : "hdtb_tls",
    "localiseNext"   : "hdtb-mn-hd",
    "localisetext"   : "lc-input",
    "localiseSubmit" : "ksb mini"
    //"test": "asdasd:not(li[id])"
};
