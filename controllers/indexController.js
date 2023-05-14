const Timer = require('../models/Timer');

const index = (req, res) => {
    res.render('index');
};
const getAllTimers = async (req, res) => {
    let seconds_used = 0;
    const timers = await Timer.find({
        started_at: {
            $gte: new Date().setHours(00, 00, 00),
            $lt: new Date().setHours(23, 59, 59),
        },
    });
    timers.forEach((timer) => {
        seconds_used += timer.total_seconds - timer.current_seconds;
    });
    return res.json({ timers, seconds_used });
};

const startTimer = async (req, res) => {
    let seconds_used = 0;
    const TOTAL_SECONDS_FOR_TODAY = 60 * 60;
    const activeAlready = await Timer.findOne({ isActive: true });
    if (activeAlready) {
        return res.status(400).json({ error: 'Timer already running.' });
    }
    const timers = await Timer.find({
        started_at: {
            $gte: new Date().setHours(00, 00, 00),
            $lt: new Date().setHours(23, 59, 59),
        },
    });

    timers.forEach((timer) => {
        seconds_used += timer.total_seconds - timer.current_seconds;
    });

    if (seconds_used >= TOTAL_SECONDS_FOR_TODAY) {
        return res
            .status(400)
            .json({ error: "You already used up today's break time. Please come back tomorrow." });
    }

    let timer = null;
    const { total_seconds } = req.body;
    if (total_seconds == 0) {
        timer = await new Timer({
            total_seconds: TOTAL_SECONDS_FOR_TODAY - seconds_used,
        }).save();
    } else {
        timer = await new Timer({
            total_seconds,
        }).save();
    }

    if (seconds_used + timer.total_seconds > TOTAL_SECONDS_FOR_TODAY) {
        await Timer.deleteOne({ _id: timer._id });
        return res
            .status(400)
            .json({ error: 'Break is bigger than available break time.' });
    }

    const timerInterval = setInterval(async () => {
        timer = await Timer.findOne({ _id: timer._id });
        timer.current_seconds--;

        if (timer.current_seconds <= 0) {
            timer.isActive = false;
            (timer.ended_at = new Date()), clearInterval(timerInterval);
        }
        if (!timer.isActive) {
            clearInterval(timerInterval);
        }
        timer.save();
    }, 1 * 1000);

    return res.json(timer);
};

const endTimer = async (req, res) => {
    const timer = await Timer.findOneAndUpdate(
        { isActive: true },
        {
            $set: {
                isActive: false,
                ended_at: new Date(),
            },
        }
    );
    return res.json(timer);
};

const getTimer = async (req, res) => {
    const timer = await Timer.findOne({ isActive: true });
    if (!timer) {
        return res.status(400).json({ error: 'No active timer.' });
    }
    return res.json(timer);
};

module.exports = { index, getAllTimers, startTimer, endTimer, getTimer };
