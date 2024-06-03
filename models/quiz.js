const mongoose = require('mongoose');

// Sub-schema for individual quizzes
const SubQuizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    option: {
        type: String,
        required: true
    },
    input: [
        {
            type: String,
            required: true
        }
    ],
    timer: {
        type: String,
        required: true
    },
    correct_answer: {
        type: String,
        required: true
    },
    impressions: {
        type: Number,
        default: 0
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Main quiz schema that can hold up to 4 sub-quizzes
const MainQuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    quizzes: {
        type: [SubQuizSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 4']
    },
    impressions: {
        type: Number,
        default: 0
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Validator to enforce a maximum of 4 quizzes
function arrayLimit(val) {
    return val.length <= 4;
}

// Middleware to update total impressions before saving
MainQuizSchema.pre('save', function (next) {
    this.impressions = this.quizzes.reduce((total, quiz) => total + quiz.impressions, 0);
    next();
});

const MainQuiz = mongoose.model('MainQuiz', MainQuizSchema);
module.exports = MainQuiz;
