require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const publicApi = require('./routes/publicApi');
const privateApi = require('./routes/privateApi');
const errorHandlers = require('./handlers/errorHandlers');

const app = express();

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use('/api/public', publicApi);

app.use('/api/private', privateApi);

app.use(errorHandlers.notFound);

if (app.get('env') === 'development') {
    app.use(errorHandlers.errors);
}

module.exports = app;
