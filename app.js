"use strict";

/**
 * @Purpose: Main entry point for SERP gathering
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson@stickyeyes.com>
 * @type {*}
 */

var scraper = require('./models/googleScraper');
var engines = require('./models/engines');
var queue   = require('./models/queue');
var save    = require('./models/csvWriter');

/**
 *
 * @type {
 *   {
 *      engine: null,
 *      keyword: null,
 *      region: null,
 *      spook: {},
 *      jobQueue: {},
 *      job: {},
 *      init:, setup:, addListeners: Function}}
 */
var App = {
    engine: null,
    keyword: null,
    region: null,
    spook: {},
    jobQueue: {},
    job: {},

    /**
     *
     * @returns {*}
     */
    init: function () {
        this.jobQueue = queue.init();
        return this;
    },

    /**
     * Listen for a new job
     */
    setup: function () {
        var self = this;

        // listen for it
        this.jobQueue.on('jobReady', function job(job) {
            self.job = job;

            var data = JSON.parse(job.data);

            console.log('reserved', data.keyword, self.job);

            self.engine  = engines[data.country].search;
            self.keyword = data.keyword
            self.region  = engines[data.country].country;
            self.spook   = scraper.init(self.engine, self.keyword, self.region);

            self.addListeners();

            self.spook.listen();
            self.spook.bootPhantom();
        });

        // before asking for it
        this.jobQueue.getJob();
    },

    /**
     * Sets up spook (phantomJs)
     */
    addListeners: function () {
        var self = this;

        // save it
        this.spook.once('success', function success(results) {
            save.init().parse(self.job.data.batch, self.engine, self.keyword, results);

            self.jobQueue.deleteJob(self.job.id);
        });

        // warnings found
        this.spook.on('warning', function warning(warning) {
            console.log(warning);
        });

        // errors found
        this.spook.on('error', function error(error) {
            console.log(error);
        });

        // job indicator (job deleted)
        this.jobQueue.on('jobDeleted', function () {
            self.jobQueue.disconnect();
            process.exit();
        });
    }
};

App.init().setup();
