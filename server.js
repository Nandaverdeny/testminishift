//  OpenShift sample Node application
var express = require('express'),
  fs = require('fs'),
  app = express(),
  eps = require('ejs'),
  morgan = require('morgan');


//rocksdb
var level = require('level');

var ldb = level('./dbLevelTest', {
  valueEncoding: 'json'
})
//

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'


var db = null, dbDetails = new Object();


app.get('/', function (req, res) {

  var counts = [];

  ldb.get('count', function (err, listobj) {
    console.log('listobj', listobj);

    if (listobj != undefined) {
      counts = listobj;
    } else {
      counts = [];
    }

    counts.push({ ip: req.ip, date: Date.now() });

    ldb.put('count', counts, function (err) {
      console.log('counts inside count', counts);

      dbDetails.databaseName = 'dbLevelTest';
      dbDetails.url = listobj;
      dbDetails.type = counts;
      res.render('index.html', { pageCountMessage: counts.length, dbInfo: dbDetails });

    })
  })

});

app.get('/pagecount', function (req, res) {

  ldb.get('count', function (err, obj) {
    console.log('obj on pagecount', obj);
    res.send('{ pageCount: ' + obj.length + '}');
  })

});

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
