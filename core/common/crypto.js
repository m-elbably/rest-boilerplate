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

        resolve(token);
      });
    });
  }

  static async createJwtTokenWithExpiration(signObj, timeoutMs = 0) {
    return new Promise((resolve, reject) => {
      const currentTime = parseInt(new Date(Date.now()).getTime() / 1000);
      const expireAfter = parseInt(timeoutMs / 1000);
      signObj.exp = currentTime + expireAfter;

      jwt.sign(signObj, authentication.key, (err, token) => {
        if (err) {
          return reject(err);
        }

        resolve(token);
      });
    });
  }

  static async verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, authentication.key, (err, decoded) => {
        if (!err) {
          return resolve(decoded);
        }

        if (err.name === 'TokenExpiredError') {
          err.code = 101;
          err.message = 'Token has been expired';
        } else if (err.name === 'JsonWebTokenError') {
          err.message = 'Invalid token';
        }

        const error = new UnauthorizedError(err.message);
        error.code = err.code;

        return reject(error);
      });
    });
  }
}

module.exports = Crypto;
