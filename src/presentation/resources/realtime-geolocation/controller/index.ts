import { Request, Response } from 'express';
import InMemoryDatabase from '../../../../data-access/in-memory';

export default class RealtimeGeolocationController {
  private _inMemoryDatabaseClient: InMemoryDatabase;

  constructor({ inMemoryDatabaseClient }: { inMemoryDatabaseClient: InMemoryDatabase }) {
    this._inMemoryDatabaseClient = inMemoryDatabaseClient;

    this.processGeolocationInfo = this.processGeolocationInfo.bind(this);
    this.getLatestGeolocationInfo = this.getLatestGeolocationInfo.bind(this);
  }

  async processGeolocationInfo(req: Request, res: Response): Promise<Response> {
    const itemId = req.params.itemId;
    if (itemId === 'undefined') return res.status(400).json({ msg: 'Invalid item id' });

    const { coordinates } = req.body;
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

    const [lat, lng] = coordinates;

    await this._inMemoryDatabaseClient.addToList(`${itemId}:latest_coordinates`, [lat, lng]);

    return res.status(201).json();
  }

  async getLatestGeolocationInfo(req: Request, res: Response): Promise<Response> {
    const itemId = req.params.itemId;
    if (itemId === 'undefined') return res.status(400).json({ msg: 'Invalid item id' });

    const latestCoords = await this._inMemoryDatabaseClient.getList(`${itemId}:latest_coordinates`);
    return res.json(latestCoords);
  }
}
