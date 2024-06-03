const mongoose = require('mongoose');

const UserResponseSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainQuiz',
        required: true
    },
    subQuizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainQuiz.quizzes', // Referencing sub-quiz
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    selectedAnswer: {
        type: String,
        required: true
    }
}, { timestamps: true });

const UserResponse = mongoose.model('UserResponse', UserResponseSchema);
module.exports = UserResponse;
