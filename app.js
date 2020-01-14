const express = require('express');
const timeout = require('connect-timeout');
const userRouter = require('./router/userRouter');
const cardRouter = require('./router/cardRouter');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// Definindo global middlewares
// Reading data from body into req.body
app.use(express.json());

// Definindo timeout das requisições
app.use(timeout('5s'));

// Middleware handle timeout

// Definindo rotas
app.use('/api/v1/users', userRouter);
app.use('/api/v1/card', cardRouter);

app.use(globalErrorHandler);

module.exports = app;
