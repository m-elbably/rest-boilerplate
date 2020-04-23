class BaseError extends Error {
  constructor(
    code = 0,
    name = 'UnexpectedError',
    status = 500,
    message = 'Internal server error',
  ) {
    super(message);

    this.code = code;
    this.name = name;
    this.status = status;
    this.message = message;
  }

  toJson() {
    return {
      error: this.name,
      message: this.message,
    };
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Error 404') {
    super(0, 'NotFoundError', 404, message);
  }
}

class UnauthenticatedError extends BaseError {
  constructor(message = 'Authentication failed') {
    super(0, 'UnauthenticatedError', 403, message);
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized Access') {
    super(0, 'UnauthorizedError', 401, message);
  }
}

class ValidationError extends BaseError {
  constructor(message = 'Bad Request', errors) {
    super(0, 'ValidationError', 400, message);
    this.errors = errors;
  }
}

class MethodNotImplementedError extends BaseError {
  constructor(message = 'Method Not Implemented') {
    super(0, 'MethodNotImplementedError', 500, message);
  }
}

class UnexpectedError extends BaseError {
  constructor(message = 'Unexpected Error') {
    super(0, 'UnexpectedError', 500, message);
  }
}

module.exports = {
  BaseError,
  UnauthenticatedError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  MethodNotImplementedError,
  UnexpectedError
};
