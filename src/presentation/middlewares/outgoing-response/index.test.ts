import OutgoingResponseMiddleware from '.';

import FakeLogger from '../../../application/observability/logger/fake';
import FakeExpressFactory from '../../../__mocks__/express/factory';

describe('OutgoingResponseMiddleware', () => {
  it('should log request status on res.finish', () => {
    const next = jest.fn();
    const method = 'GET';
    const url = 'http://localhost:3000';
    const status = 200;
    const ctx = { method, url, status };
    const req = FakeExpressFactory.createRequest({ ctx, headers: {}, body: {} });
    const res = FakeExpressFactory.createResponse();
    const logger = new FakeLogger();

    const data = { ok: 1 };

    const spyOnLogInfo = jest.spyOn(logger, 'info').mockImplementation(jest.fn());

    new OutgoingResponseMiddleware({ logger }).hook(req, res, next);
    const receivedResponse = res.status(status).json(data);
    expect(receivedResponse.body).toEqual(data);
    expect(receivedResponse.status).toEqual(status);

    res.emit('finish');

    expect(spyOnLogInfo).toHaveBeenCalledTimes(1);
    expect(spyOnLogInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('GET '),
        durationMs: expect.any(Number),
        status,
        method,
        url,
      })
    );
  });
});
