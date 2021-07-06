import ApiOp from '@/store/apiop';

const baseURL = '';

const api = {
  getData({ type = 'test' }) {
    let opts = {
      method: 'get',
      params: {
        format: 'json',
      },
    };
    switch (type) {
      case 'test': {
        opts.url = `${baseURL}/api/test`;
        break;
      }
    }
    return new ApiOp(opts).execute();
  },
};

export default api;
