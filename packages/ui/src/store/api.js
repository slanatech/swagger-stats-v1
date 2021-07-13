import ApiOp from '@/store/apiop';

const baseURL = '';

const api = {
  getData({ type = 'stats' }) {
    let opts = {
      method: 'get',
      params: {
        format: 'json',
      },
    };
    switch (type) {
      case 'stats': {
        opts.url = `${baseURL}/stats`;
        break;
      }
    }
    return new ApiOp(opts).execute();
  },
};

export default api;
