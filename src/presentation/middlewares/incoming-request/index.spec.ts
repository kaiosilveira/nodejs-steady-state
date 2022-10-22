import IncomingRequestMiddleware from '.';
import FakeLogger from '../../../application/observability/logger/fake';
import FakeExpressFactory from '../../../__mocks__/express/factory';

describe('IncomingRequestMiddleware', () => {
  it('should create a context for the request with an actionUUID', () => {
    const generatedUUID = 'abc';
    const generateUUID = jest.fn().mockReturnValue(generatedUUID);
    const next = jest.fn();

    const req = FakeExpressFactory.createRequest();
    const res = FakeExpressFactory.createResponse();

    new IncomingRequestMiddleware({ logger: new FakeLogger(), generateUUID }).hook(req, res, next);

    expect(req.context?.actionUUID).toEqual(generatedUUID);
    expect(generateUUID).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
