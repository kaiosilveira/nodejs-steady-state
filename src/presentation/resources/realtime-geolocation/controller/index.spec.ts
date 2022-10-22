import RealtimeGeolocationController from '.';
import FakeInMemoryDatabase from '../../../../data-access/in-memory/fake';
import FakeExpressFactory from '../../../../__mocks__/express/factory';

describe('RealtimeGeolocationController', () => {
  const itemId = 'item-id-1';
  const lat = -26.13213;
  const lng = -46.31423;
  const fakeAddToListFn = jest.fn();
  const fakeGetListFn = jest.fn();
  const inMemoryDatabaseClient = new FakeInMemoryDatabase();

  beforeEach(() => {
    jest.spyOn(inMemoryDatabaseClient, 'addToList').mockImplementation(fakeAddToListFn);
    jest.spyOn(inMemoryDatabaseClient, 'getList').mockImplementation(fakeGetListFn);
  });

  afterEach(() => {
    jest.clearAllMocks();
    fakeAddToListFn.mockReset();
    fakeGetListFn.mockReset();
  });

  describe('processGeolocationInfo', () => {
    beforeEach(() => {
      jest.spyOn(inMemoryDatabaseClient, 'addToList').mockImplementation(fakeAddToListFn);
    });

    afterEach(() => {
      jest.clearAllMocks();
      fakeAddToListFn.mockReset();
    });

    it('should return bad request if itemId is "undefined"', async () => {
      const itemId = 'undefined';

      const req = FakeExpressFactory.createRequest({
        params: { itemId },
        body: { coordinates: [lat, lng] },
      });

      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({ msg: 'Invalid item id' });
    });

    it('should return bad request if request body does not contain a "coordinates" field', async () => {
      const req = FakeExpressFactory.createRequest({ params: { itemId }, body: {} });
      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({
        msg: 'Invalid request body. Expected an object with the following signature: { coordinates: [number, number] }',
      });
    });

    it('should return bad request if request.body.coordinates is not an array', async () => {
      const req = FakeExpressFactory.createRequest({
        params: { itemId },
        body: { coordinates: -46.3423 },
      });

      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({
        msg: 'Invalid request body. Expected an object with the following signature: { coordinates: [number, number] }',
      });
    });

    it('should return bad request if request.body.coordinates does not contain two items', async () => {
      const req = FakeExpressFactory.createRequest({
        params: { itemId },
        body: { coordinates: [-46.3423] },
      });

      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({
        msg: 'Invalid request body. Expected an object with the following signature: { coordinates: [number, number] }',
      });
    });

    it('should return bad request if request.body.coordinates does not contain two numbers', async () => {
      const req = FakeExpressFactory.createRequest({
        params: { itemId },
        body: { coordinates: ['-46.3423', 'kaio'] },
      });

      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({
        msg: 'Invalid request body. Expected an object with the following signature: { coordinates: [number, number] }',
      });
    });

    it('should add the received coordinates into the cache', async () => {
      jest.spyOn(inMemoryDatabaseClient, 'addToList').mockImplementation(fakeAddToListFn);

      const req = FakeExpressFactory.createRequest({
        params: { itemId },
        body: { coordinates: [lat, lng] },
      });

      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.processGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(201);
      expect(fakeAddToListFn).toHaveBeenCalledWith(`${itemId}:latest_coordinates`, [lat, lng]);
    });
  });

  describe('getLatestGeolocationInfo', () => {
    const cachedLocations = [
      [-26.23424, -46.34243],
      [-26.43243, -46.432423],
    ];

    it('should return bad request if itemId is "undefined"', async () => {
      const itemId = 'undefined';

      const req = FakeExpressFactory.createRequest({ params: { itemId } });
      const res = FakeExpressFactory.createResponse();
      const spyOnStatus = jest.spyOn(res, 'status');
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.getLatestGeolocationInfo(req, res);

      expect(spyOnStatus).toHaveBeenCalledWith(400);
      expect(spyOnJSON).toHaveBeenCalledWith({ msg: 'Invalid item id' });
    });

    it('should return the list of cached locations for a given item id', async () => {
      fakeGetListFn.mockResolvedValue(cachedLocations);

      const req = FakeExpressFactory.createRequest({ params: { itemId } });
      const res = FakeExpressFactory.createResponse();
      const spyOnJSON = jest.spyOn(res, 'json');

      const ctrl = new RealtimeGeolocationController({ inMemoryDatabaseClient });
      await ctrl.getLatestGeolocationInfo(req, res);

      expect(spyOnJSON).toHaveBeenCalledWith(cachedLocations);
    });
  });
});
