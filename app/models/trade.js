const mongoose = require('mongoose')

//helper to format Date
function getFormattedDate(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear();
  return day + "/" + month + "/" + year;
}

const TradeSchema = mongoose.Schema({
  stockId: {
    type: String,
    uppercase: true
  },
  date: Date,
  price: Number,
  quantity: Number,
  type: {
    type: String,
    uppercase: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      return {'_id': ret._id, 'trade': ret.stockPrice}
    }
  }
})

TradeSchema.virtual('stockPrice').get(function() {
  return this.type + ' ' + this.quantity + '@' + this.price + ' ' + getFormattedDate(this.date)
})

module.exports = mongoose.model('Trade', TradeSchema)
