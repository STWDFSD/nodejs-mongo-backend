require('babel-polyfill');
const dbConfig = require("../config/db.config.js");
const router = require("express").Router()
const mongodb = require('mongodb');
const query = require('devextreme-query-mongodb');
const getOptions = require('devextreme-query-mongodb/options').getOptions;

function handleError(res, reason, message, code) {
  console.error('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

function getQueryOptions(req) {
  return getOptions(req.query, {
    areaKM2: 'int',
    population: 'int'
  });
}

async function getData(coll, req, res) {
  try {
    const options = getQueryOptions(req);
    if (options.errors.length > 0) console.error('Errors in query string: ', JSON.stringify(options.errors));

    const results = await query(
      coll,
      options.loadOptions,
      options.processingOptions
    );
    res.status(200).jsonp(results);
  } catch (err) {
    handleError(res, err, 'Failed to retrieve data');
  }
}

mongodb.MongoClient.connect(dbConfig.url, function (err, client) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var db = client.db('test');
  console.log('MongoDB driver - Database connection ready.');

  router.get("/", async(req, res) => {
    getData(db.collection('grades'), req, res);
  });
});

module.exports = router
