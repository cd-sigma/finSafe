const resStatusEnum = Object.freeze({
    SUCCESS: 200,
    ACCEPTED: 202,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    UNAUTHORIZED: 401
});

module.exports = resStatusEnum;
