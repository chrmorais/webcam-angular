var express    = require('express'),
    app        = module.exports.app = exports.app = express(),
    port       = process.env.PORT || 3030,
    router     = express.Router(),
    path       = require('path'),
    bodyParser = require('body-parser'),
    sqlite3    = require('sqlite3').verbose(),
    fileDB     = 'photo.db',
    db         = new sqlite3.Database(fileDB),
    config     = {};

config.timeTakePhoto = '0'; //45 minutos
config.timeBase = '60'; //minutos
config.env = process.argv[2] || process.env.NODE_ENV || 'development';
config.dirname = config.env == 'development' ? '/app':'/dist';

app.use(require('connect-livereload')());
app.use(express.static(__dirname + config.dirname));
app.use(bodyParser.json({limit: '50mb'}));

db.run('CREATE TABLE if not exists "takePhoto" ("timestamp" INT,"tagID" TEXT,"take" BOOL NOT NULL  DEFAULT (0) )');

router.post('/upload', function (req, res) {
  var base64Data = req.body.image.replace(/^data:image\/png;base64,/, '');

  ensureExists(__dirname + '/webcam', 0744, function(err) {
    if (err) throw err;
  });

  require('fs').writeFile(path.join(__dirname, 'webcam') + '/'+req.body.tagID+'-'+(Math.floor(new Date().getTime() / 1000))+'.png', base64Data, 'base64', function(err) {
    console.log(err);
  });

  var save = db.prepare('UPDATE takePhoto SET take = \'true\' WHERE tagID = ?');
      save.run(req.body.tagID);
      save.finalize();

  res.json({'done':'yes'});
});

router.get('/', function (req, res) {
  res.sendFile('index.html');
});

router.get('/takePhoto/:tagID', function (req, res) {
  db.get(
    'SELECT \
      tagID \
    FROM takePhoto \
    WHERE tagID = ? \
      AND (((strftime(\'%s\', \'now\') - timestamp) / '+config.timeBase+')) < '+config.timeTakePhoto +' \
    ORDER BY timestamp DESC \
    LIMIT 1',
    req.params.tagID,
    function(err, row) {

      if (err) {
        throw err;
      }

      if (typeof row == 'undefined') {
        var take = db.prepare('INSERT INTO takePhoto VALUES (?, ?, \'false\')');

        take.run(Math.round(Date.now() / 1000), req.params.tagID);
        take.finalize();

        res.json({'save': 'yes'});
      } else {
        res.json({'save': 'no'});
      }
    });
});

router.get('/checkPhoto', function (req, res) {
  var check = db.get(
    'SELECT \
      tagID \
    FROM takePhoto \
    WHERE take = \'false\' \
    ORDER BY timestamp DESC \
    LIMIT 1',
    function(err, row) {

      if (err) {
        throw err;
      }

      if (typeof row !== 'undefined') {
        res.json({
          'photo':true,
          'tagID': row.tagID
        });
      } else {
        res.json({'photo':false});
      }

    });
});

function ensureExists(path, mask, cb) {
  if (typeof mask == 'function') { // allow the `mask` parameter to be optional
    cb = mask;
    mask = 0777;
  }
  require('fs').mkdir(path, mask, function(err) {
    if (err) {
        if (err.code == 'EEXIST') cb(null);
        else cb(err);
    } else cb(null);
  });
}

app.use('/', router);

var server = app.listen(port, function () {
  var host = server.address().address,
      port = server.address().port;

  console.log('Server iniciado en %s:%s %s %s', host, port, config.env, new Date());

});
