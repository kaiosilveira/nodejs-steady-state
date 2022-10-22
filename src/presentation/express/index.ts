import Express from 'express';
import Helmet from 'helmet';
import Mongoose from 'mongoose';
import InMemoryDatabase from '../../data-access/in-memory';

import PresentationResourcesManager from '../resources';

export default class ExpressAppFactory {
  static createApp() {
    const instance = Express();
    let inMemoryDatabaseClient: InMemoryDatabase;
    let diskDatabaseConnection: Mongoose.Connection;

    instance.use(Helmet());
    instance.use(Express.json());
    instance.use(Express.urlencoded({ extended: true }));
    instance.use(PresentationResourcesManager.configureRouter(Express.Router()));

    return {
      instance,
      attachInMemoryDbClient: (client: InMemoryDatabase) => {
        inMemoryDatabaseClient = client;
      },
      attachDiskDatabaseConnection: (conn: Mongoose.Connection) => {
        diskDatabaseConnection = conn;
      },
    };
  }
}
