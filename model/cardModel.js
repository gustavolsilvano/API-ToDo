const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  date: {
    type: String,
    require: true
  },
  dateFull: {
    type: Date,
    require: true
  },
  id: {
    type: String,
    require: true
  },
  itens: {
    type: Array,
    require: true
  }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
