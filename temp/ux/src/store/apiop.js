/* API Operation */

import axios from 'axios';

// TODO Logging

class ApiOp {
  constructor(options = {}) {
    this.options = options;
    this.success = false;
    this.code = 0;
    this.message = '';
    this.payload = null;
    this.headers = null;
  }

  execute() {
    let apiop = this;
    return new Promise(function(resolve) {
      axios(apiop.options)
        .then(function(response) {
          apiop.success = true;
          apiop.code = response.status;
          apiop.payload = response.data;
          apiop.message = response.statusText;
          apiop.headers = response.headers;
          resolve(apiop);
        })
        .catch(function(error) {
          apiop.success = false;
          apiop.code = error.response.status;
          apiop.message = error.response.statusText;
          apiop.payload = error.response.data;
          apiop.headers = error.response.headers;
          resolve(apiop);
        });
    });
  }
}

export default ApiOp;
