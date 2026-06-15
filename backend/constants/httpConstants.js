// constants/httpConstants.js
// Named HTTP status codes used across controllers.
// Avoids magic numbers and makes intent explicit at call sites.

const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

module.exports = { HTTP };
