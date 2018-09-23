const mongoose = require('mongoose')

const TradeSchema = mongoose.Schema({
  stockId: String,
  date: Date,
  price: Number,
  quantity: Number,
  type: {type: String, uppercase: true}
})

module.exports = mongoose.model('Trade', TradeSchema)
