const response = {
  success(data, message = "Success") {
    return {
      ok: true,
      status: 200,
      message,
      data,
    };
  },

  fail(status, message) {
    return {
      ok: false,
      status,
      message,
      data: null,
    };
  },

  unauthorized(message = "Unauthorized") {
    return this.fail(401, message);
  },

  serverError(message = "Internal server error") {
    return this.fail(500, message);
  },

  notFound(message = "Resource not found") {
    return this.fail(404, message);
  },

//   badRequest(message = "Bad request") {
//     return this.fail(400, message);
//   },
};

export default response;
