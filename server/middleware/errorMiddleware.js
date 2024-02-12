// Desc: Middleware for handling errors in the app (404 and 500 errors)
const notFoundError = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(400);
  next(error);
};

//middleware for handling errors in the app (404 and 500 errors)
const errorHandler = (err, req, res, next) => {
  //sometimes error code is 200 but there is an error message in the response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
  });
};

module.exports = { notFoundError, errorHandler };
