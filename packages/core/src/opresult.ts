/*
 * Standard Operation Result
 * Used to return result and data for internal calls and API calls
 */
export class OpResult {
  public success: boolean;
  public message: string;
  public data: any | null;

  constructor(success = false, message = '', data: any | null = null) {
    this.success = false;
    // message, if any
    this.message = '';
    // Associated data
    this.data = null;
    // set supplied values
    this.set(success, message, data);
  }

  set(success = false, message = '', data: any | null = null) {
    this.success = success || false;
    this.message = message || '';
    this.data = data || null;
    return this;
  }

  error(message = '', data: any | null = null) {
    return this.set(false, message, data);
  }

  ok(data: any | null = null) {
    return this.set(true, '', data);
  }

  // Checks if this result is success, and copies result to dst if supplied
  isSuccess(dst: OpResult) {
    if (dst instanceof OpResult) {
      dst.success = this.success;
      dst.message = this.message;
      dst.data = this.data;
    }
    return this.success;
  }

  copy(src: any) {
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

export class OpError extends OpResult {
  constructor(message = '', data: any | null = null) {
    super(false, message, data);
  }
}

// TODO remove message ( check for compatibility first )
export class OpSuccess extends OpResult {
  constructor(message = '', data: any | null = null) {
    super(true, message, data);
  }
}

// Check if src is Success OpResult, and copy it to dst
export function isSuccess(src: OpResult, dst: OpResult) {
  dst.success = src.success;
  dst.message = src.message;
  dst.data = src.data;
  return src.success;
}
