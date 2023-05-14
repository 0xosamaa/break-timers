const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema({
    total_seconds: {
        type: Number,
        required: true,
    },
    current_seconds: {
        type: Number,
        default: function () {
            return this.total_seconds;
        },
    },
    started_at: {
        type: Date,
        default: Date.now,
    },
    ended_at: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const Timer = mongoose.model('Timer', TimerSchema);
module.exports = Timer;
