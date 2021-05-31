/*
 * Standard Operation Result
 * Used to return result and data for internal calls and API calls
 */
class OpResult {
  constructor(success, message, data) {
    this.success = false;
    // message, if any
    this.message = '';
    // Associated data
    this.data = null;
    // set supplied values
    this.set(success, message, data);
  }

  set(success, message, data) {
    this.success = success || false;
    this.message = message || '';
    this.data = data || null;
    return this;
  }

  error(message, data) {
    return this.set(false, message, data);
  }

  ok(data) {
    return this.set(true, '', data);
  }

  // Checks if this result is success, and copies result to dst if supplied
  isSuccess(dst) {
    if (dst instanceof OpResult) {
      dst.success = this.success;
      dst.message = this.message;
      dst.data = this.data;
    }
    return this.success;
  }

  copy(src) {
    if (typeof src !== 'undefined' && src) {
      this.success = 'success' in src ? src.success : false;
      this.message = 'message' in src ? src.message : '';
      this.data = 'data' in src ? src.data : null;
    } else {
      this.success = false;
      this.message = '';
      this.data = null;
    }
  }
}

class OpError extends OpResult {
  constructor(message, data) {
    super(false, message, data);
  }
}

// TODO remove message ( check for compatibility first )
class OpSuccess extends OpResult {
  constructor(message,data) {
    super(true, message, data);
  }
}

// Check if src is Success OpResult, and copy it to dst
function isSuccess(src, dst) {
  if (!(src instanceof OpResult)) {
    return false;
  }
  if (dst instanceof OpResult) {
    dst.success = src.success;
    dst.message = src.message;
    dst.data = src.data;
  }
  return src.success;
}

module.exports = {
  OpResult: OpResult,
  OpSuccess: OpSuccess,
  OpError: OpError,
  isSuccess: isSuccess
};
