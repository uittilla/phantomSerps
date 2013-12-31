"use strict";

/**
 * @Purpose: Provide mappable Google engines based upon a country code
 * Google states a param like "&cr=countryAT" will give you results from that country
 * This however does not tally up anywhere close to what is provided by a proxy server
 * Leave it out and they are very very close.
 *
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson>
 * @type {*}
 */

module.exports = {
   "at": {
        "country": "Austria",
        "search" : "http://www.google.at",
        "base"   : "http://www.google.at"
   },
   "au": {
        "country": "Australia",
        "search" : "http://www.google.com.au",
        "base"   : "http://www.google.com.au"   
   },
   "ca": {
        "country": "Canada",
        "search" : "http://www.google.ca",
        "base"   : "http://www.google.ca"
   },
   "be": {
        "country": "Belgium",
        "search" : "http://www.google.be",
        "base"   : "http://www.google.be"
   },
   "us": {
        "country": "Unites States of America",
        "search" : "http://www.google.com",
        "base"   : "http://www.google.com"
   },
   "cz": {
        "country": "Czech Republic",
        "search" : "http://www.google.cz",
        "base"   : "http://www.google.cz" 
   },
   "dk": {
        "country": "Denmark",
        "search" : "http://www.google.dk",
        "base"   : "http://www.google.dk" 
   },
   "fi": {
        "country": "Finland",
        "search" : "http://www.google.fi",
        "base"   : "http://www.google.fi"
   },   
   "de": { 
        "country": "Germany",
        "search" : "http://www.google.de",
        "base"   : "http://www.google.de"
   }, 
   "fr": {
        "country": "France",
        "search" : "http://www.google.fr",
        "base"   : "http://www.google.fr"
   },
   "gr": {
        "country": "Greece",
        "search" : "http://www.google.gr",
        "base"   : "http://www.google.gr"
   },
   "uk": {
        "country": "United Kingdom",
        "search" : "http://www.google.co.uk",
        "base"   : "http://www.google.co.uk"
   },
   "it": { 
        "country": "Italy",
        "search" : "http://www.google.it",
        "base"   : "http://www.google.it"
   },
   "ie": {
        "country": "Ireland",
        "search" : "http://www.google.ie",
        "base"   : "http://www.google.ie"
   },
   "nl": {
        "country": "Netherlands",
        "search" : "http://www.google.nl",
        "base"   : "http://www.google.nl"   
   },
   "es": {
        "country": "Spain",
        "search" : "http://www.google.es",
        "base"   : "http://www.google.es"
   },
   "pt": {
        "country": "Portugal",
        "search" : "http://www.google.pt",
        "base"   : "http://www.google.pt"
   },
   "ru": {
        "country": "Russia",
        "search" : "http://www.google.ru",
        "base"   : "http://www.google.ru"
   },
   "se": {
        "country": "Sweeden",
        "search" : "http://www.google.se",
        "base"   : "http://www.google.se"
   },
   "sk": {
       "country": "Slovakia",
       "search" : "http://www.google.sk",
       "base"   : "http://www.google.sk"
   } 
};
