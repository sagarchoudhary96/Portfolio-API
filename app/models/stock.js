const mongoose = require('mongoose')

const StockSchema = mongoose.Schema({
  stockId: {
    type: String,
    unique: true,
    uppercase: true
  }
})

module.exports = mongoose.model('Stock', StockSchema)
