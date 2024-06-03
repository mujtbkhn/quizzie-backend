const MainPoll = require('../models/poll');

const createPoll = async (req, res, next) => {
    try {
        const { title, polls } = req.body;
        const creator = req.user.userId; // Assuming you have user authentication and req.user contains the authenticated user

        if (!title || !polls || !Array.isArray(polls)) {
            return res.status(400).json({
                message: "Please fill all the required fields"
            });
        }

        if (polls.length > 5) {
            return res.status(400).json({
                message: "You can only include up to 5 sub-polls"
            });
        }

        const subPolls = polls.map(poll => {
            const { question, option, input } = poll;
            if (!question || !option || !input || input.length !== 4) {
                throw new Error("Each sub-poll must have all fields filled and input length must be 4");
            }
            return {
                question,
                option,
                input
            };
        });

        const pollCount = await MainPoll.countDocuments({ creator });
        if (pollCount >= 5) {
            return res.status(400).json({ message: "You have reached the limit of 5 polls" });
        }

        const mainPoll = await MainPoll.create({
            title,
            polls: subPolls,
            creator
        });

        res.json({
            message: "Main Poll created successfully",
            mainPoll
        });
    } catch (error) {
        if (error.message === "Each sub-poll must have all fields filled and input length must be 4") {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};
const getPoll = async (req, res, next) => {
    try {
        const polls = await MainPoll.find({});
        res.json({
            polls
        });
    } catch (error) {
        next(error);
    }
};
const getPollByUserId = async (req, res, next) => {
    const userId = req.params.userId
    try {
        const poll = await MainPoll.find({ creator: userId })
        res.json({
            poll
        })
    } catch (error) {
        next(error)
    }
}
const getPollById = async (req, res, next) => {
    try {
        const pollId = req.params.pollId;
        const mainPoll = await MainPoll.findById(pollId);
        if (!mainPoll) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        // Increment the main poll and sub-polls impressions count
        mainPoll.polls.forEach(poll => {
            poll.impressions += 1;
        });
        await mainPoll.save();

        res.json({
            message: "Poll retrieved successfully",
            mainPoll
        });
    } catch (error) {
        next(error);
    }
};

const editPoll = async (req, res, next) => {
    try {
        const pollId = req.params.pollId;
        const { title, polls } = req.body;

        const mainPoll = await MainPoll.findById(pollId);
        if (!mainPoll) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        if (title !== undefined) {
            mainPoll.title = title;
        }
        if (polls !== undefined) {
            if (!Array.isArray(polls) || polls.length > 5) {
                return res.status(400).json({
                    message: "Polls array length must be up to 5"
                });
            }
            polls.forEach(poll => {
                const { question, option, input } = poll;
                if (!question || !option || !input || input.length !== 4) {
                    return res.status(400).json({
                        message: "Each sub-poll must have all fields filled and input length must be 4"
                    });
                }
            });
            mainPoll.polls = polls;
        }

        await mainPoll.save();

        return res.json({
            message: "Updated successfully",
            mainPoll
        });
    } catch (error) {
        next(error);
    }
};


const deletePoll = async (req, res, next) => {
    try {
        const pollId = req.params.pollId;
        const userId = req.user.userId;

        const mainPoll = await MainPoll.findById(pollId);
        if (!mainPoll) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        if (!mainPoll.creator.equals(userId)) {
            return res.status(403).json({
                message: "You do not have permission to delete this poll"
            });
        }

        await MainPoll.findByIdAndDelete(pollId);
        res.json({
            message: "Poll deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createPoll, getPoll, getPollByUserId, getPollById, editPoll, deletePoll }