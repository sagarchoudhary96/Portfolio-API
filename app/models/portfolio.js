const mongoose = require('mongoose')

// helper to format average buy
const formatAvgBuy = (value) => {
  return parseFloat(value) % 1 !== 0
    ? parseFloat(value).toFixed(2)
    : parseInt(value)
}

const PortfolioSchema = mongoose.Schema({
  stockId: {
    type: String,
    uppercase: true
  },
  avgBuy: mongoose.Schema.Types.Decimal128,
  buyQuantity: Number,
  leftQuantity: Number,
  count: Number
}, {
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      if (!ret.trades) {
        let resultDoc = {
          [ret.stockId]: ret.holdings
        }
        return resultDoc
      } else {
        return {
          [ret.stockId]: ret.trades
        }
      }
    }
  }
})

PortfolioSchema.virtual('trades', {
  ref: 'Trade',
  localField: 'stockId',
  foreignField: 'stockId'
})
// to format holding in format quantity@price
PortfolioSchema.virtual('holdings').get(function() {
  return this.leftQuantity + '@' + formatAvgBuy(this.avgBuy)
})

module.exports = mongoose.model('Portfolio', PortfolioSchema)
