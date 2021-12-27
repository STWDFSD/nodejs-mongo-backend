require('babel-polyfill');
const mongo = require('../config/database')
const dbConfig = require('../config/db.config')

const EventBroker = require('../EventBroker')
const router = require("express").Router()
const query = require('devextreme-query-mongodb');
const getOptions = require('devextreme-query-mongodb/options').getOptions;

const broker = new EventBroker()

function handleError(res, reason, message, code) {
  console.error('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

function getQueryOptions(req) {
  return getOptions(req.query, {
    classId: 'int',
    studentId: 'int',
    examScore: 'float',
    homeworkScore: 'float',
    quizScore: 'float'
  });
}

async function getData(coll, req, res) {
  try {
    const options = getQueryOptions(req);
    if (options.errors.length > 0) {
      console.error('Errors in query string: ', JSON.stringify(options.errors));
    }

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

const generateSendSseCallback = res => update => {
  res.write(`data: ${JSON.stringify(update)}\n\n`)
}

mongo.connect(dbConfig.url)
  .then((conn) => {
      const db = conn.db('test')
      broker.init(db, 'grades')

    router.get("/", async(req, res) => {
      getData(db.collection('grades'), req, res);
    });

    router.get('/stream', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',

        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      })

      try {
        const sendSse = generateSendSseCallback(res)
        broker.emitter.on('gradeChange', sendSse)

        req.on('close', () => {
          broker.emitter.removeListener('grade', sendSse)
        })
      } catch (err) {
        res.status(500)
        console.log(`[SERVER] an error occured on /stream: ${err}`)
      }
    })
  })
  .catch((err) => {
    console.error(`[SERVER] - Error connecting to db: ${err}`);
    process.exit(1);
  })

module.exports = router
