import Express from 'express';
import Helmet from 'helmet';
import Mongoose from 'mongoose';
import Crypto from 'node:crypto';

import PresentationResourcesManager from '../resources';
import IncomingRequestMiddleware from '../middlewares/incoming-request';
import OutgoingResponseMiddleware from '../middlewares/outgoing-response';
import ApplicationState from '../application-state';
import Logger from '../../application/observability/logger';
import InMemoryDatabase from '../../data-access/in-memory';

export default class ExpressAppFactory {
  static createApp({
    logger,
    inMemoryDatabaseClient,
    appState,
  }: {
    logger: Logger;
    inMemoryDatabaseClient: InMemoryDatabase;
    diskDatabaseConnection: Mongoose.Connection;
    appState: ApplicationState;
  }) {
    const instance = Express();

    instance.use(Helmet());
    instance.use(Express.json());
    instance.use(Express.urlencoded({ extended: true }));
    instance.use(new IncomingRequestMiddleware({ logger, generateUUID: Crypto.randomUUID }).hook);
    instance.use(new OutgoingResponseMiddleware({ logger }).hook);
    instance.use(
      PresentationResourcesManager.configureRouter({
        appState,
        logger,
        inMemoryDatabaseClient,
        router: Express.Router(),
      })
    );

    return { instance };
  }
}
