const response = {
  success(res, data = {}, message = 'Success', status = 200) {
    return res.status(status).json({
      ok: true,
      status,
      message,
      data,
    });
  },

  fail(res, status = 400, message = 'Something went wrong', errors = null) {
    return res.status(status).json({
      ok: false,
      status,
      message,
      errors, // additional error details
      data: null,
    });
  },
};

export default response;
