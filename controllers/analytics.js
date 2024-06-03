const MainQuiz = require('../models/quiz');
const MainPoll = require('../models/poll');
const UserResponse = require('../models/quizResponse');
const { v4: uuidv4 } = require('uuid');


const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Total quizzes and polls created by the user
        const totalQuizzes = await MainQuiz.countDocuments({ creator: userId });
        const totalPolls = await MainPoll.countDocuments({ creator: userId });

        // Total questions created by the user
        const quizzes = await MainQuiz.find({ creator: userId });
        const polls = await MainPoll.find({ creator: userId });

        const trendingQuizzes = await MainQuiz.find({ creator: userId, impressions: { $gt: 10 } });
        const trendingPolls = await MainPoll.find({ creator: userId, impressions: { $gt: 10 } });

        const totalQuizQuestions = quizzes.reduce((acc, quiz) => acc + quiz.quizzes.length, 0);
        const totalPollQuestions = polls.reduce((acc, poll) => acc + poll.polls.length, 0);

        const totalQuestions = totalQuizQuestions + totalPollQuestions;

        // Total impressions on quizzes and polls created by the user
        const totalImpressions = quizzes.reduce((acc, quiz) => acc + quiz.impressions, 0) + polls.reduce((acc, poll) => acc + poll.impressions, 0);

        res.json({
            totalQuizzes: totalQuizzes + totalPolls,
            totalQuestions,
            totalImpressions,
            trendingQuizzes,
            trendingPolls
        });
    } catch (error) {
        next(error);
    }
};

const recordQuizResponse = async (req, res, next) => {
    try {
        const { quizId, subQuizId, selectedAnswer } = req.body;
        let { sessionId } = req.body;

        if (!quizId || !subQuizId || !selectedAnswer) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Generate a session ID if not provided
        if (!sessionId) {
            sessionId = uuidv4();
        }

        const userResponse = new UserResponse({
            quizId,
            subQuizId,
            sessionId,
            selectedAnswer
        });

        await userResponse.save();

        res.json({ message: "Response recorded successfully", sessionId });
    } catch (error) {
        next(error);
    }
}

module.exports = { getAnalytics, recordQuizResponse };
