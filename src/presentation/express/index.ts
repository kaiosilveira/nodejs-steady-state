import Express from 'express';
import Helmet from 'helmet';
import Mongoose from 'mongoose';
import InMemoryDatabase from '../../data-access/in-memory';
import ApplicationState from '../application-state';
import PresentationResourcesManager from '../resources';

export default class ExpressAppFactory {
  static createApp({ appState }: { appState: ApplicationState }) {
    const instance = Express();
    let inMemoryDatabaseClient: InMemoryDatabase;
    let diskDatabaseConnection: Mongoose.Connection;

    instance.use(Helmet());
    instance.use(Express.json());
    instance.use(Express.urlencoded({ extended: true }));
    instance.use(
      PresentationResourcesManager.configureRouter({ appState, router: Express.Router() })
    );

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
