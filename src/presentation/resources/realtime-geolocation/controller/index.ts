import { Request, Response } from 'express';
import Logger from '../../../../application/observability/logger';
import InMemoryDatabase from '../../../../data-access/in-memory';

export default class RealtimeGeolocationController {
  private readonly _inMemoryDatabaseClient: InMemoryDatabase;
  private readonly _logger: Logger;

  constructor({
    logger,
    inMemoryDatabaseClient,
  }: {
    logger: Logger;
    inMemoryDatabaseClient: InMemoryDatabase;
  }) {
    this._inMemoryDatabaseClient = inMemoryDatabaseClient;
    this._logger = logger;

    this.processGeolocationInfo = this.processGeolocationInfo.bind(this);
    this.getLatestGeolocationInfo = this.getLatestGeolocationInfo.bind(this);
  }

  async processGeolocationInfo(req: Request, res: Response): Promise<Response> {
    const itemId = req.params.itemId;
    console.log({ itemId });
    if (itemId === 'undefined') return res.status(400).json({ msg: 'Invalid item id' });

    const { coordinates } = req.body;
    console.log(req.body);
    if (
      !(
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every(i => !Number.isNaN(Number(i)))
      )
    ) {
      return res.status(400).json({
        msg: 'Invalid request body. Expected an object with the following signature: { coordinates: [number, number] }',
      });
    }

    this._logger.info({ message: 'starting transaction to push a new coordinates pair to cache' });

    const key = `${itemId}:latest_coordinates`;
    await this._inMemoryDatabaseClient.execTransaction({
      key,
      transactionBlock: async ({ multi, transactionClient }) => {
        const length = await transactionClient.lLen(key);
        if (length === 100) {
          this._logger.info({ message: `${key} contains 100 items. Right-popping the first one` });
          multi.rPop(key);
        }

        this._logger.info({ message: `pushing new coords to ${key}` });
        multi.lPush(key, JSON.stringify(coordinates));
      },
    });

    return res.status(201).json();
  }

  async getLatestGeolocationInfo(req: Request, res: Response): Promise<Response> {
    const itemId = req.params.itemId;
    if (itemId === 'undefined') return res.status(400).json({ msg: 'Invalid item id' });

    const latestCoords = await this._inMemoryDatabaseClient.getList(`${itemId}:latest_coordinates`);
    return res.json(latestCoords);
  }
}
