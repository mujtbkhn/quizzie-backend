
const express = require('express')
const { createQuiz, getQuiz, getQuizById, editQuiz, deleteQuiz, getQuizByUserId } = require('../controllers/quiz')
const decodeJWT = require('../middlewares/decodeJWT')
const router = express.Router()

router.post('/create', decodeJWT, createQuiz)
router.get('/get', decodeJWT, getQuiz)
router.get('/getByUserId/:userId', decodeJWT, getQuizByUserId)
router.get('/get/:quizId', getQuizById)
router.put('/update/:quizId', editQuiz)
router.delete('/delete/:quizId', decodeJWT, deleteQuiz)


module.exports = router