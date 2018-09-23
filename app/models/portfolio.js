const mongoose = require('mongoose')

const PortfolioSchema = mongoose.Schema({
  stockId: String,
}, {
  toJSON: { virtuals: true,
    transform(doc, ret) {
      delete ret.id;
    }},
  toObject: { virtuals: true }
})

PortfolioSchema.virtual('trades', {
  ref: 'Trade',
  localField: 'stockId',
  foreignField: 'stockId'
})

module.exports = mongoose.model('Portfolio', PortfolioSchema)
