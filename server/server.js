const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('dotenv').config();
const { PORT } = require('./constants');

const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const mongoSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const httpResponder = require('./middleware/httpResponder');
const errorHandler = require('./middleware/errorHandler');


// connect to database
mongoose.connect(
  process.env.DB_CONNECT_ATLAS,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('Connected to database'))
  .catch(() => console.log("Failed to connect to database."));



// express settings
app.set("env", process.env.NODE_ENV);

// middlewares
app.use(helmet()) // security headers
app.use(cors());
app.use(httpResponder);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10kb' }));
app.use(mongoSanitize()); // sanitization against NoSQL Injection Attacks
app.use(xss()); // sanitize data
// rateLimiter
app.use('/api/', rateLimit({
  windowMs: 25 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests!, please try again after 25mins" }
}));
app.use(morgan('dev'));


// routes
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/user', require('./routes/imagesRoute'));
app.use('/api/bugs', require('./routes/bugsRoute'));
app.use('/api/bugs', require('./routes/commentsRoute'));


// finally handle errors
app.use(errorHandler);
app.use("*", function (req, res) {
  res.notImplemented({ error: 'Not Implemented.' });
});


app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));