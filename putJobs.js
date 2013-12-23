
var jobs = [
    {"keyword": "bingo", "country": "uk"},
    {"keyword": "bingo", "country": "au"},
    {"keyword": "bingo", "country": "fr"},
    {"keyword": "bingo", "country": "pt"},
    {"keyword": "apple", "country": "uk"},
    {"keyword": "apple", "country": "au"},
    {"keyword": "apple", "country": "fr"},
    {"keyword": "apple", "country": "pt"},
    {"keyword": "casino", "country": "uk"},
    {"keyword": "casino", "country": "de"}
];

var client = require('beanstalk_client').Client;

client.connect('127.0.0.1:11300', function(err, conn) {
    var job_data={};

    for(var i in jobs) {
        job_data = jobs[i];
        job_data['batch'] = "1";
        conn.put(0, 0, 1, JSON.stringify(job_data), function(err, job_id) {
            console.log('put job: ' + job_id);
        });
    }
});
