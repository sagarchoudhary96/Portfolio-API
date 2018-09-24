const Stock = require('../models/stock')
const Trade = require('../models/trade')
const Portfolio = require('../models/portfolio')
const mongoose = require('mongoose')

// constants
const BUY = 'buy'
const SELL = 'sell'

// check trade type (buy or sell)
const checkTradeType = (type) => {
  type = type.toLowerCase()
  return type === BUY ? BUY : type === SELL ? SELL : false
}

// add Stock to stock collection and portfolio colelction if not exist
const addStock = (data) => {
  return new Promise((resolve, reject) => {
    // if stock already exist or not
    Stock.find({stockId: data.stockId}).then((result) => {

      // if stock not exist
      if (!result || result.length === 0) {
        // create new entry for stock
        const stock = new Stock({
          stockId: data.stockId
        })

        //create new entry for portfolio based on trade type
        let buyQuantity = 0
        let leftQuantity = 0
        let avgBuy = 0
        if (checkTradeType(data.type) === BUY) {
          buyQuantity += data.quantity
          leftQuantity += data.quantity
          avgBuy = data.price
        }
        else if (checkTradeType(data.type) === SELL) {
          leftQuantity -= data.quantity
        }
        else {
            reject('invalid trade type')
        }

        const portfolio = new Portfolio({
          stockId: data.stockId,
          avgBuy: avgBuy,
          leftQuantity: leftQuantity,
          buyQuantity: buyQuantity,
          count: 1
        })
        return Promise.all([stock.save(), portfolio.save()])
      }

      // stock exist alread in stock collection => do nothing
      return true
    }).then((result) => {
      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

// remove Stock
const removeStock = (stockId) => {
    return new Promise((resolve, reject) => {
      Stock.findOneAndDelete({stockId: stockId}).then((result) => {
        if (!result || result.length === 0) {
          reject('Error deleting Stock: ' + stockId)
        }
        resolve(result)
      }).catch((err) => {
        reject(err)
      })
    })
}

// remove Portfolio
const removePortfolio = (stockId) => {
  return new Promise((resolve, reject) => {
    Portfolio.findOneAndDelete({stockId: stockId}).then((result) => {
      if (!result || result.length === 0) {
        reject('Error deleting portfolio item: ' + stockId)
      }
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

// helper to format cumulative returns
const formatReturns = (value) => {
  return parseFloat(value) % 1 !== 0 ? parseFloat(value).toFixed(2): parseInt(value)
}

// updatePortfolio on adding new trade
const updatePortfolio = (data) => {
  // convert trade quantity and price to integer
  const quantity = parseInt(data.quantity, 10)
  const price = parseInt(data.price, 10)

  return new Promise((resolve, reject) => {
      // retreive the stock detail from portfolio
      Portfolio.findOne({stockId: data.stockId}).then((result) => {
        // update portfolio based on trade type
        const newPortfolio = {}
        newPortfolio.count = result.count + 1
        // buy trade
        if( checkTradeType(data.type) === BUY) {
          newPortfolio.avgBuy = ((result.buyQuantity*result.avgBuy) + (quantity * price)) /(result.buyQuantity + quantity)
          newPortfolio.leftQuantity = result.leftQuantity + quantity
          newPortfolio.buyQuantity = result.buyQuantity + quantity
        } // sell trade
        else if(checkTradeType(data.type) === SELL) {
          newPortfolio.leftQuantity =  result.leftQuantity - quantity
        }
        else {
          reject(err)
        }

        return Portfolio.findOneAndUpdate({stockId: data.stockId}, newPortfolio, {new: true})
      }).then((result) => {
        resolve()
      }).catch((err) => {
        reject (err)
      })
  })
}

// update trade in database
const updateTradeDB = (newTradeValues, id) => {
  return new Promise((resolve, reject) => {
      Trade.findOneAndUpdate({_id: id}, newTradeValues, {new: true})
      .then((result) => {

        if (!result || result.length === 0) {
          reject('trade not found with id: ' + id)
        }
        resolve(result)
      }).catch((err) => {
        reject(err)
      })
  })
}

// remove trade from database
const removeTradeDB = (id) => {
  return new Promise((resolve, reject) => {
    Trade.findOneAndDelete({_id: id}).then((result) => {
      if (!result || result.length === 0) {
        reject('Error deleting trade with id: ' + id)
      }
      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

// update Portfolio on modifying trade
const updatePortfolioOnModifyTrade = (prevTrade, tradePortfolio, newTrade) => {
  // convert trade quantity and price to integer
  const quantity = newTrade.quantity ? parseInt(newTrade.quantity, 10) : prevTrade.quantity
  const price = newTrade.price ? parseInt(newTrade.price, 10) : prevTrade.price
  const type = newTrade.type ? newTrade.type : prevTrade.type

  // update portfolio based on trade type
  const newPortfolio = {}

  // if trade type not modified
  if (checkTradeType(prevTrade.type) === checkTradeType(type)) {
      //if trade type is BUY
      if(checkTradeType(type) === BUY) {
        newPortfolio.avgBuy = ((tradePortfolio.buyQuantity * tradePortfolio.avgBuy) - (prevTrade.price * prevTrade.quantity) + (price*quantity))/(tradePortfolio.buyQuantity - prevTrade.quantity + quantity)
        newPortfolio.buyQuantity = tradePortfolio.buyQuantity - prevTrade.quantity + quantity
        newPortfolio.leftQuantity = tradePortfolio.leftQuantity - prevTrade.quantity + quantity
      }
      // if Trade type is SELL
      else {
        newPortfolio.leftQuantity = tradePortfolio.leftQuantity - prevTrade.quantity + quantity
      }
  }
  // if trade type is modified
  else {
    // changing trade type from BUY to SELL
    if (checkTradeType(type) === SELL) {
      newPortfolio.buyQuantity = tradePortfolio.buyQuantity - prevTrade.quantity
      if (newPortfolio.buyQuantity === 0) {
        newPortfolio.avgBuy = 0
      }
      else {
        newPortfolio.avgBuy = ((tradePortfolio.buyQuantity * tradePortfolio.avgBuy) - (prevTrade.price * prevTrade.quantity))/(tradePortfolio.buyQuantity - prevTrade.quantity)
      }
      newPortfolio.leftQuantity = tradePortfolio.leftQuantity - prevTrade.quantity - quantity
    }
    else {
      newPortfolio.avgBuy = ((tradePortfolio.buyQuantity * tradePortfolio.avgBuy) + (price * quantity))/(tradePortfolio.buyQuantity + quantity)
      newPortfolio.buyQuantity = tradePortfolio.buyQuantity + quantity
      newPortfolio.leftQuantity = tradePortfolio.leftQuantity + prevTrade.quantity + quantity
    }
  }
  return new Promise ((resolve, reject) => {
    Portfolio.findOneAndUpdate({stockId: tradePortfolio.stockId}, newPortfolio, {new: true}).then((result) => {
      resolve()
    }).catch((err) => {
      console.log(err)
      reject(err)
    })
  })
}

// update Portfolio on deleting the trade
const updatePortfolioOnDeleteTrade = (trade, tradePortfolio) => {
  const newPortfolio = {}
  newPortfolio.count = tradePortfolio.count - 1
  // if trade is of BUY type
  if (checkTradeType(trade.type) === BUY) {
      newPortfolio.buyQuantity = tradePortfolio.buyQuantity - trade.quantity
      if (newPortfolio.buyQuantity === 0) {
        newPortfolio.avgBuy = 0
      }
      // if all buy stocks have been removed
      else {
        newPortfolio.avgBuy = ((tradePortfolio.avgBuy * tradePortfolio.buyQuantity) - (trade.price * trade.quantity))/(tradePortfolio.buyQuantity - trade.quantity)
      }
      newPortfolio.leftQuantity = tradePortfolio.leftQuantity - trade.quantity
  }
  // if Trade is of SELL type
  else {
    newPortfolio.leftQuantity = tradePortfolio.leftQuantity + trade.quantity
  }
  return new Promise ((resolve, reject) => {
    Portfolio.findOneAndUpdate({stockId: tradePortfolio.stockId}, newPortfolio, {new: true}).then((result) => {
      resolve()
    }).catch((err) => {
      console.log(err)
      reject(err)
    })
  })
}

//get whole portfolio
exports.getPortfolio = (req, res) => {
  Portfolio.find({}).populate('trades').then((result) => {
    if (!result || result.length === 0) {
      return res.status(404).send({
        success: false,
        error: 'no Trades made yet'
      })
    }

    return res.status(201).send({
      success: true,
      data: result
    })
  }).catch(err=> {
    console.log(err)
    return res.status(500).send({
      success: false,
      error: 'unable to get Portfolio'
    })
  })
}

// get Holdings
exports.getHoldings = (req, res) => {
  Portfolio.find({}).then((result) => {
    if (!result || result.length === 0) {
      return res.status(404).send({
        success: false,
        error: 'no Trades made yet'
      })
    }

    return res.status(201).send({
      success: true,
      data: result
    })
  }).catch((err) => {
    console.log(err)
    return res.status(500).send({
      success: false,
      error: 'unable to get holdings'
    })
  })
}

// get Cumulative Returns
exports.getReturns = (req, res) => {
  Portfolio.aggregate([
    { $group: { _id: null, cumulativeReturn: { $sum: {$subtract: [100,'$avgBuy']} }}}
  ]).then ((result) => {
    return res.status(201).send({
      success: true,
      data: {'cumulativeReturns': formatReturns(result[0].cumulativeReturn)}
    })
  }).catch((err) => {
    console.log(err)
    return res.status(500).send({
      success: false,
      error: 'Error calculating cumulative returns'
    })
  })
}

// add Trades
exports.addTrade = (req, res) => {
  //data from request
  const data = req.body

  // new Trade
  const trade = new Trade({
    stockId: data.stockId,
    date: formatDate(data.date),
    price: data.price,
    quantity: data.quantity,
    type: data.type
  })

  //add stock to stock collection
  addStock(data).then((result) =>{

    // stock exist
    if (result === true) {
      // protfolio update and then save the trade
      return Promise.all([updatePortfolio(data), trade.save()])
    }

    // stock not exist: add the trade
    return trade.save()
  }).then((result) => {
    return res.status(201).send({
      success: true,
      data: Array.isArray(result) ? result[1] : result
    })
  }).catch(err => {
    console.log(err)
    return res.status(500).send({
      success:false,
      error: 'Unable to make new trade'
    })
  })
}

// update the trade
exports.updateTrade = (req, res) => {
  // data from request
  const data = req.body

  // values to be updated
  const newTradeValues = {}
  const tradeKeys = ['price', 'quantity', 'type']
  if (data.date) {
    newTradeValues.date = formatDate(data.date)
  }

  tradeKeys.forEach((key) => {
    if (data[key]) {
      newTradeValues[key] = data[key]
    }
  })

  // if only trade date is changed
  if (Object.keys(newTradeValues).length === 1 && newTradeValues.date) {
    // just update the trade
    updateTradeDB(newTradeValues, req.params.id).then((result) => {
      return res.status(201).send({
        success: true,
        data: result
      })
    }).catch((err) => {
      console.log(err)
      return res.status(500).send({
        success: false,
        error: 'Cannot update Trade with id: ' + req.params.id
      })
    })
  } // no valid field specified in the request
  else if (Object.keys(newTradeValues).length === 0) {
    return res.status(500).send({
      success: false,
      error: 'Cannot modify StockId'
    })
  }
  else {
    //find trade detail and portfolio
    Trade.aggregate([
      {$match: {_id : mongoose.Types.ObjectId(req.params.id)}},
      {$lookup: {
        from: 'portfolios',
        localField: 'stockId',
        foreignField: 'stockId',
        as: 'portfolio'
      }}
    ]).then((results) => {
      if (!results || results.length === 0) {
        return res.status(404).send({
          success: false,
          error: 'Cannot find trade with id: ' + req.params.id
        })
      }

      const prevTrade = results[0]
      const tradePortfolio = prevTrade.portfolio[0]

      // update trade and portfolio both
      return Promise.all([updatePortfolioOnModifyTrade(prevTrade, tradePortfolio, newTradeValues), updateTradeDB(newTradeValues, req.params.id)])
  }).then((results) => {
    return res.status(201).send({
      success: true,
      data: results[1]
    })
  }).catch((err) => {
      console.log(err)
      return res.status(500).send({
        success: false,
        error: 'Cannot update Trade with id: ' + req.params.id
      })
    })
  }
}

// remove the trade
exports.removeTrade = (req, res) => {

  //find trade detail and portfolio
  Trade.aggregate([
    {$match: {_id : mongoose.Types.ObjectId(req.params.id)}},
    {$lookup: {
      from: 'portfolios',
      localField: 'stockId',
      foreignField: 'stockId',
      as: 'portfolio'
    }},
  ]).then((results) => {
    if (!results || results.length === 0) {
      return res.status(404).send({
        success: false,
        error: 'Cannot Delete trade with id: ' + req.params.id
      })
    }

    const trade = results[0]
    const stockId = results[0].stockId
    const tradePortfolio = trade.portfolio[0]

    // check if last trade of the stock
    if (tradePortfolio.count === 1) {
      // remove stock from all there collection
      return Promise.all([removeStock(stockId), removePortfolio(stockId), removeTradeDB(req.params.id)])
    }
    // update protfolio and remove trade
    else {
      return Promise.all([updatePortfolioOnDeleteTrade(trade, tradePortfolio), removeTradeDB(req.params.id)])
    }

  }).then((results) => {
    return res.status(201).send({
      success: true,
      data: results[results.length - 1]
    })
  }).catch((err) => {
    console.log(err)
    return res.status(500).send({
      success: false,
      error: 'Cannot Delete Trade with id: ' + req.params.id
    })
  })
}
