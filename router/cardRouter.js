const express = require('express');
const {
  createCard,
  getCardById,
  deleteAllCard
} = require('../controller/cardController');

const router = express.Router();

router.route('/').post(createCard);
router
  .route('/:id')
  .get(getCardById)
  .delete(deleteAllCard);

module.exports = router;
