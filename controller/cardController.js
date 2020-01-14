const Card = require('../model/cardModel');
const catchAsync = require('../utils/catchAsync');

exports.createCard = catchAsync(async (req, res, next) => {
  const newCard = await Card.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      newCard
    }
  });
});

exports.deleteAllCard = catchAsync(async (req, res, next) => {
  const cards = await Card.find({ userId: req.params.id });
  if (cards.length === 0)
    return res.status(200).json({
      status: 'success',
      message: 'no card to delete'
    });

  await Card.deleteMany({ userId: req.params.id });
  res.status(200).json({
    status: 'success',
    message: 'all cards deleted'
  });
});

exports.getCardById = catchAsync(async (req, res, next) => {
  // Search for cards related to that id in the database
  const cards = await Card.find({ userId: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      cards
    }
  });
});
