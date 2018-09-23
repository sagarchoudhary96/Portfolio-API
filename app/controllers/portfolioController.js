const Stock = require('../models/stock')
const Trade = require('../models/trade')
const Portfolio = require('../models/portfolio')

const addStock = (stockId) => {
  return new Promise((resolve, reject) => {
    // if stock already exist or not
    Stock.find({stockId: stockId}).then((result) => {

      // if stock not exist
      if (!result || result.length === 0) {
        // create new entry for stock
        console.log('added new stock')
        const stock = new Stock({
          stockId: stockId
        })

        const portfolio = new Portfolio({
          stockId: stockId
        })
        return Promise.all([stock.save(), portfolio.save()])
      }
      // stock exist do nothing
      console.log('already exist')
      return result
    }).then((result) => {
      console.log('send Result')
      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

// helper to format date
const formatDate = (date) => {
  const tradeDate = date.split('/')
  return new Date(tradeDate[2], tradeDate[1]-1, tradeDate[0])
}

//get whole portfolio
exports.getPortfolio = (req, res) => {
  Portfolio.find({}).select({'__v': 0}).populate('trades').exec().then((result) => {
    if (!result || result.length === 0) {
      res.status(404).send({
        success: false,
        error: 'no Trades made yet'
      })
    }

    res.status(201).send({
      success: true,
      data: result
    })
  }).catch(err=> {
    console.log(err)
    res.status(500).send({
      success: false,
      error: 'unable to get Portfolio'
    })
  })
}

exports.getHoldings = (req, res) => {

}

exports.getReturns = (req, res) => {

}

// add Trades
exports.addTrade = (req, res) => {
  //data from request
  const data = req.body

  const trade = new Trade({
    stockId: data.stockId,
    date: formatDate(data.date),
    price: data.price,
    quantity: data.quantity,
    type: data.type
  })

  //add stock to stock collection
  addStock(data.stockId).then(() =>{
    // add the trade
    return trade.save()
  }).then(result => {
    console.log('Added trade sucessfully')
    return res.status(201).send({
      success: true,
      data: result
    })
  }).catch(err => {
    console.log(err)
    return res.status(500).send({
      success:false,
      error: 'Unable to make new trade'
    })
  })
}

// modify the trade
exports.updateTrade = (req, res) => {
  // data from request
  const data = req.body

  // values to be updated
  const newTradeValues = {}
  const tradeKeys = ['stockId', 'price', 'quantity', 'type']
  if (data.date) {
    newTradeValues.date = formatDate(data.date)
  }

  tradeKeys.forEach(key => {
    if (data[key]) {
      newTradeValues[key] = data[key]
    }
  })

  Trade.findByIdAndUpdate(req.params.id, newTradeValues, {new: true})
  .then((result) => {
    if (!result || result.length === 0) {
      return res.status(404).send({
        success: false,
        error: 'trade not found with id: ' + req.params.id
      })
    }
    return res.status(201).send({
      success: true,
      data: result
    })
  }).catch(err => {
    if (err.kind === 'ObjectId') {
      return res.status(404).send({
        success: false,
        error: 'trade not found with id: ' + req.params.id
      })
    }

    return res.status(500).send({
      success: false,
      error: 'Error updating trade with id: ' + req.params.id
    })
  })
}

// remove the trade
exports.removeTrade = (req, res) => {
  Trade.findOneAndDelete({_id: req.params.id}).then((result) => {
    if (!result || result.length === 0) {
      return res.status(404).send({
        success: false,
        error: 'Cannot find trade with id: ' + req.params.id
      })
    }

    return res.status(201).send({
      success: true,
      data: 'Deleted Successfully'
    })
  }).catch(err => {
    // if error is because of invalid id then it give err.kind = ObjectId
    if (err.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).send({
        success: false,
        error: 'Cannot find trade with id: ' + req.params.id
      })
    }
    console.log(err)
    return res.status(500).send({
      success: false,
      error: 'Error deleting trade with id: ' + req.params.id
    })
  })
}
