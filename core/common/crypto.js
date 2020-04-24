const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authentication } = require('../../config');
const { UnauthorizedError } = require('./errors');

const SALT_ROUNDS = 10;

class Crypto {
  static async createHash(text) {
    return bcrypt.hashSync(text, bcrypt.genSaltSync(SALT_ROUNDS));
  }

  static async compareHash(text, hash) {
    return bcrypt.compare(text, hash);
  }

  static async isValidPassword(password, hashedPassword) {
    return this.compareHash(password, hashedPassword);
  }

  static async createJwtToken(data) {
    return new Promise((resolve, reject) => {
      jwt.sign(data, authentication.key, (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      });
    });
  }

  static async createJwtTokenWithExpiration(signObj, timeoutMs = 0) {
    return new Promise((resolve, reject) => {
      const cSignObject = { ...signObj };
      const currentTime = new Date(Date.now()).getTime() / 1000;
      const expireAfter = timeoutMs / 1000;
      cSignObject.exp = currentTime + expireAfter;

      jwt.sign(cSignObject, authentication.key, (err, token) => {
        if (err) {
          return reject(err);
        }

        return resolve(token);
      });
    });
  }

  static async verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, authentication.key, (err, decoded) => {
        if (!err) {
          return resolve(decoded);
        }
        let errorCode;
        let errorMsg;
        if (err.name === 'TokenExpiredError') {
          errorCode = 101;
          errorMsg = 'Token has been expired';
        } else if (err.name === 'JsonWebTokenError') {
          errorMsg = 'Invalid token';
        }

        const error = new UnauthorizedError(errorMsg || err.message);
        error.code = errorCode || err.code;

        return reject(error);
      });
    });
  }
}

module.exports = Crypto;
