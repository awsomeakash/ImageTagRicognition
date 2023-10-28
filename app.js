var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// middleware to handle uploaded files
var fileUpload = require('express-fileupload');
var dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Load environment variables

var indexRouter = require('./routes/index');
var visionRouter = require('./routes/vision');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Limit file upload to 5 MB
app.use(fileUpload({
  limits: { 
    fileSize: 5 * 1024 * 1024 
  },
  limitHandler: (req, res, next) => {
    res.status(413).json({
      'error': 'Max allowed filesize is 5 MB'
    })
  }
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/vision', visionRouter); // Check out the comments in this router for more details!

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
