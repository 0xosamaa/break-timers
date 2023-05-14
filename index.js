const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');

dotenv.config();

const PORT = process.env.PORT || 8080;
const DATABASE = process.env.MONGODB_URI;

const app = express();


mongoose
    .connect(DATABASE)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch((err) => console.log(err));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);
