const express = require('express');
const router = express.Router();
const {signup ,login , requestPasswordReset,resetPassword} = require('../controllers/authController');

router.get('/test-api', (req, res) => {
    console.log('Test API endpoint hit');
  res.status(200).json({ message: 'API is working!' });
});
router.post('/signup', signup);
router.post('/login', login);
router.post('/password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
