"use strict";

/**
 * @Purpose: Wrap Beanstalk in emmiters
 * @Author: Mark Ibbotson (Ibbo) <mark.ibbotson@stickyeyes.com>
 * @type {*}
 */

var beanstalk = require('nodestalker'),
    client    = beanstalk.Client(),
    event     = require('events').EventEmitter;

/**
 *
 * @type {
 *  {
 *    __proto__: *,
 *    tube: null,
 *    init:, getJob:, watchTube:, reserveJob:, deleteJob:, disconnect: Function
 *    }
 *  }
 */
var Queue = {
    __proto__: event.prototype,
    tube:null,

    /**
     * Setup the queue
     * @param tube
     * @returns {*}
     */
    init: function(tube) {
        this.tube = tube;

        return this;
    },

    /**
     * Entry point
     */
    getJob: function() {
        this.watchTube();
    },

    /**
     * Call watch
     */
    watchTube: function() {
        var self = this;

        client.watch(this.tube).onSuccess(function(data) {
            self.reserveJob();
        });
    },

    /**
     * Call reserve
     */
    reserveJob: function() {
        var self = this;

        client.reserve().onSuccess(function(job) {
            self.emit('jobReady', job);
        });
    },

    /**
     * Delete job
     * @param id
     */
    deleteJob: function(id) {
        var self = this;

        client.deleteJob(id).onSuccess(function(del_msg) {
            console.log('deleted', id);
            console.log('message', del_msg);
            self.emit('jobDeleted', del_msg);
        });
    },

    /**
     * Kill the connection
     */
    disconnect: function() {
        client.disconnect();
    }
};

module.exports = Queue;
