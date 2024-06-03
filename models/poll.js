const mongoose = require('mongoose');

// Sub-schema for individual polls
const SubPollSchema = new mongoose.Schema({
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
    impressions: {
        type: Number,
        default: 0
    }
});

// Main schema that can hold up to 5 sub-polls
const MainPollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    polls: {
        type: [SubPollSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5']
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

// Validator to enforce a maximum of 5 polls
function arrayLimit(val) {
    return val.length <= 5;
}

// Middleware to update total impressions before saving
MainPollSchema.pre('save', function (next) {
    this.impressions = this.polls.reduce((total, poll) => total + poll.impressions, 0);
    next();
});

const MainPoll = mongoose.model('MainPoll', MainPollSchema);
module.exports = MainPoll;
