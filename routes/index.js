const express = require('express');
const router = express.Router();
const {
    index,
    getAllTimers,
    startTimer,
    endTimer,
    getTimer,
} = require('../controllers/indexController');

router.get('/', index);
router.get('/timers', getAllTimers);
router.get('/timer', getTimer);
router.post('/timer', startTimer);
router.delete('/timer', endTimer);

module.exports = router;
