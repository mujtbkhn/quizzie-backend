const express = require('express')
const { getAnalytics, recordQuizResponse } = require('../controllers/analytics')
const decodeJWT = require('../middlewares/decodeJWT')
const router = express.Router()

router.get('/get', decodeJWT, getAnalytics)
router.post('/recordResponse', recordQuizResponse)

module.exports = router