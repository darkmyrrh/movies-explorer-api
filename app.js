require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { PORT = 4000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
const mongoose = require('mongoose');
const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const limiter = require('./middlewares/limiter');
const corsHandler = require('./middlewares/corsHandler');

const app = express();

app.use(limiter);
app.use(helmet());

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(corsHandler);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('connected to bd'))
  .catch((err) => console.log(err));

app.use(requestLogger);
app.use(routes);
app.use(errorLogger);
app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
