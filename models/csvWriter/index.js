"use strict";

var csv = require('json2csv');
var fs  = require('fs');

var json2Csv = {
    batch: null,

    init: function() {return this;},

    parse: function(batch, engine, keyword, json){
        var sets = [];
        var entry={};
        var item={};
        var position = 1;

        for(var s in json) {
            entry = json[s];
            item.page = entry.page;
            item.date = entry.date;

            for(var l in entry.links) {
                sets.push({"page": entry.page, "date": entry.date, "position": position, "url": entry.links[l], "engine": engine, "keyword": keyword});
                position++;
            }
        }

        this.write(batch, sets);
    },

    write: function(batch, sets) {
        var headers  = this.getHeaders(sets[0]);
        var filename = "batch" + batch + ".csv";

        csv({data: sets, fields: headers}, function(err, csv) {
            if (err) console.log(err);

            console.log(csv);

            fs.writeFile(filename, csv, function (err) {
                if (err) return console.log(err);
            });
        });
    },

    getHeaders: function(json) {
        return Object.keys(json);
    }

};

module.exports = json2Csv;