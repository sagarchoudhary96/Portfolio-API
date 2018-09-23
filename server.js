// dependencies required
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// db config
const dbConfig = require('./config/db')
mongoose.Promise = global.Promise

const app = express()

// Port to run the server
var port = process.env.PORT || 8000

// parser to parse url-encoded forms
app.use(bodyParser.urlencoded({ extended: true }))


// help docs
app.get('/', (req, res) => {
  const help = `
  <pre>
    Welcome to the Portfolio API!

    The following endpoints are available:

    * GET /portfolio
        USAGE:
          Get all of the Portfolio

    * GET /portfolio/holdings
        USAGE:
          Get holdings of all stocks in an aggregate view

    * GET /pportfolio/returns
        USAGE:
          Get cumulative returns

    * POST /portfolio/addTrade
        USAGE:
          Add a new Trade
        PARAMS:
          stockId - Unique stock id
          date - date on which trade is made in format (DD/MM/YYYY)
          price - price of trade
          quantity - quantity of stocks
          type - either buy/sell

    * POST /portfolio/updateTrade/:id
        USAGE:
          Update the specific Trade
        PARAMS:
          the values to be updated from (stockId, date, price, quantity, type)

    * POST /portfolio/removeTrade/:id
      USAGE:
        Remove the specific Trade
 </pre>
  `
  res.send(help)
})

// Required routes
require('./app/routes')(app)

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");

    // Run the server
    app.listen(port, () => {
      console.log("Listening on Port: " + port)
    })
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});
