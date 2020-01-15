const cors = require('cors');
const path = require('path');
const express = require('express');
const timeout = require('connect-timeout');
const userRouter = require('./router/userRouter');
const cardRouter = require('./router/cardRouter');
const globalErrorHandler = require('./controller/errorController');

const app = express();
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Definindo global middlewares
// Reading data from body into req.body
app.use(express.json());

// Definindo timeout das requisições
app.use(timeout('10s'));

// GLOBAL MIDDLEWARES

// Handleling CORS
app.use(cors());
app.options('*', cors());

// Definindo rotas
app.use('/api/v1/users', userRouter);
app.use('/api/v1/card', cardRouter);

app.use(globalErrorHandler);

module.exports = app;
