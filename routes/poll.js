
const express = require('express')
const decodeJWT = require('../middlewares/decodeJWT')
const { createPoll, getPoll, getPollById, editPoll, deletePoll, getPollByUserId } = require('../controllers/poll')
const router = express.Router()

router.post('/create', decodeJWT, createPoll)
router.get('/get', decodeJWT, getPoll)
router.get('/getByUserId/:userId', decodeJWT, getPollByUserId)
router.get('/get/:pollId', getPollById)
router.put('/update/:pollId', decodeJWT, editPoll)
router.delete('/delete/:pollId', decodeJWT, deletePoll)


module.exports = router