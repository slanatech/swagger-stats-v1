import { SwsServer } from '../src/swsserver';

const swsServer = new SwsServer();

const delay = function (t: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), t);
  });
};

describe('SwsServer Test', function () {
  it('Should instantiate server', async () => {
    swsServer.start();
  });

  it('Should wait', async () => {
    await delay(100000);
  }, 150000);

  /*
  it('Should register Prometheus data source', async () => {
    const ds = new DataSource({
      id: '1',
      type: 'prometheus',
      settings: {
        url: prometheusURL,
      },
    });

    const testResult = await prometheus.testDataSource(ds);
    expect(testResult.success).toBeTruthy();

    const registerResult = await prometheus.registerDataSource(ds);
    expect(registerResult.success).toBeTruthy();
  });
  */
});
