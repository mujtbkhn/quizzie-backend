const MainQuiz = require("../models/quiz");
const UserResponse = require("../models/quizResponse");

const createQuiz = async (req, res, next) => {
    try {
        const { title, quizzes } = req.body;
        const creator = req.user.userId;
        const timerArray = ['off', '5 sec', '10 sec'];

        if (!title || !quizzes || !Array.isArray(quizzes)) {
            return res.status(400).json({ 
                message: "Please fill all the required fields"
            });
        }

        if (quizzes.length > 4) {
            return res.status(400).json({
                message: "You can only include up to 4 sub-quizzes"
            });
        }

        const subQuizzes = quizzes.map(quiz => {
            const { question, option, input, correct_answer, timer } = quiz;
            if (!question || !option || !input || !correct_answer || !timer || input.length < 2 || input.length > 4) {
                throw new Error("Each sub-quiz must have all fields filled and input length between 2 and 4");
            }
            if (!timerArray.includes(timer)) {
                throw new Error("Please select timer from OFF, 5 sec or 10 sec")
            }
            return {
                question,
                option,
                input,
                correct_answer,
                timer,
                creator
            };
        });

        // const quizCount = await MainQuiz.countDocuments({ creator });
        // if (quizCount >= 5) {
        //     return res.status(400).json({ message: "You have reached the limit of 5 main quizzes" });
        // }

        const mainQuiz = await MainQuiz.create({
            title,
            quizzes: subQuizzes,
            creator
        });
        res.json({
            message: "Main Quiz created successfully",
            mainQuiz
        });
    } catch (error) {
        if (error.message === "Each sub-quiz must have all fields filled and input length between 2 and 4") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

const getQuizByUserId = async (req, res, next) => {
    const userId = req.params.userId
    try {
        const quiz = await MainQuiz.find({ creator: userId })
        res.json({
            quiz
        })
    } catch (error) {
        next(error)
    }
}

const getQuiz = async (req, res, next) => {
    try {
        const quizzes = await MainQuiz.find({});
        res.json({
            quizzes
        });
    } catch (error) {
        next(error);
    }
};

const getQuizById = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const mainQuiz = await MainQuiz.findById(quizId);
        if (!mainQuiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        // Increment the main quiz and sub-quizzes impressions count
        mainQuiz.quizzes.forEach(quiz => {
            quiz.impressions += 1;
        });
        await mainQuiz.save();

        const userResponses = await UserResponse.find({ quizId });

        // Calculate analytics
        const analytics = mainQuiz.quizzes.map(subQuiz => {
            const responses = userResponses.filter(response => response.subQuizId.equals(subQuiz._id));
            const totalAttempts = responses.length;
            const correctAnswers = responses.filter(response => response.selectedAnswer === subQuiz.correct_answer).length;
            const incorrectAnswers = totalAttempts - correctAnswers;

            return {
                question: subQuiz.question,
                totalAttempts,
                correctAnswers,
                incorrectAnswers
            };
        });
        res.json({
            message: "Quiz retrieved successfully",
            mainQuiz,
            analytics
        });
    } catch (error) {
        next(error);
    }
};

const editQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const { title, quizzes } = req.body;

        const mainQuiz = await MainQuiz.findById(quizId);
        if (!mainQuiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (title !== undefined) {
            mainQuiz.title = title;
        }
        if (quizzes !== undefined) {
            if (!Array.isArray(quizzes) || quizzes.length > 4) {
                return res.status(400).json({
                    message: "Quizzes array length must be up to 4"
                });
            }
            quizzes.forEach(quiz => {
                const { question, option, input, correct_answer, timer } = quiz;
                if (!question || !option || !input || !correct_answer || !timer || input.length < 2 || input.length > 4) {
                    return res.status(400).json({
                        message: "Each sub-quiz must have all fields filled and input length between 2 and 4"
                    });
                }
            });
            mainQuiz.quizzes = quizzes;
        }

        await mainQuiz.save();

        return res.json({
            message: "Updated successfully",
            mainQuiz
        });
    } catch (error) {
        next(error);
    }
};

const deleteQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.quizId;
        const userId = req.user.userId;

        const mainQuiz = await MainQuiz.findById(quizId);
        if (!mainQuiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (!mainQuiz.creator.equals(userId)) {
            return res.status(403).json({
                message: "You do not have permission to delete this quiz"
            });
        }

        await MainQuiz.findByIdAndDelete(quizId);
        res.json({
            message: "Quiz deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { createQuiz, getQuiz, getQuizByUserId, getQuizById, editQuiz, deleteQuiz }