const errorHandler = require('./errorHandler');
const responseHandler = require('./responseHandler');
const notFoundHandler = require('./notFoundHandler');

const authentication = require('./authentication');
const normalizer = require('./normalizer');
const logger = require('./logger');
const multipartParser = require('./multipartParser');
const fileUploader = require('./fileUploader');

module.exports = {
  errorHandler,
  responseHandler,
  notFoundHandler,
  authentication,
  normalizer,
  logger,
  multipartParser,
  fileUploader,
};
