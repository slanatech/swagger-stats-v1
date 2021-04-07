import ApiOp from '@/store/apiop';

const baseURL = '.';

const swaggerStatsAPI = {
  getStats({ fields = null, method = null, path = null, username = null, password = null }) {
    let params = {};
    if (fields) {
      params.fields = fields;
    }
    if (method) {
      params.method = method;
    }
    if (path) {
      params.path = path;
    }
    let opts = {
      method: 'get',
      url: `${baseURL}/stats`,
      params: params
    };
    if (username && password) {
      opts.auth = {
        username: username,
        password: password
      };
    }
    return new ApiOp(opts).execute();
  },

  async authenticate() {
    // Invoke /stats to determine if authentication is required or not
    let statsResult = await new ApiOp({
      method: 'get',
      url: `${baseURL}/stats`
    }).execute();
    return statsResult;
  },

  async logout() {
    // Invoke /stats to determine if authentication is required or not
    let logoutResult = await new ApiOp({
      method: 'get',
      url: `${baseURL}/logout`
    }).execute();

    return logoutResult;
  }

};

export default swaggerStatsAPI;
