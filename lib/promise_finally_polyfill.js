"use strict";

Promise.prototype.finally = function (onFinally) {
  return this.then(
  /* onFulfilled */
  function (res) {
    return Promise.resolve(onFinally()).then(function () {
      return res;
    });
  },
  /* onRejected */
  function (err) {
    return Promise.resolve(onFinally()).then(function () {
      throw err;
    });
  });
};

module.exports = Promise.prototype.finally;