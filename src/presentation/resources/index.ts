import { Router } from 'express';
import Logger from '../../application/observability/logger';
import InMemoryDatabase from '../../data-access/in-memory';
import ApplicationState from '../application-state';
import HealthCheckController, { ApplicationEnv } from './health-check/controller';
import RealtimeGeolocationController from './realtime-geolocation/controller';

export default class PresentationResourcesManager {
  static configureRouter({
    logger,
    inMemoryDatabaseClient,
    appState,
    router,
  }: {
    inMemoryDatabaseClient: InMemoryDatabase;
    appState: ApplicationState;
    router: Router;
    logger: Logger;
  }) {
    const env: ApplicationEnv = {
      NODE_ENV: process.env.NODE_ENV || 'dev',
      COMMIT_SHA: process.env.COMMIT_SHA || 'unknown',
      NODE_VERSION: process.version,
    };

    const healthCheckCtrl = new HealthCheckController({ applicationState: appState, env });
    const realtimeGeolocationCtrl = new RealtimeGeolocationController({
      logger,
      inMemoryDatabaseClient,
    });

    router.get('/health', healthCheckCtrl.getHealthState);
    router.post('/geo/:itemId', realtimeGeolocationCtrl.processGeolocationInfo);
    router.get('/geo/:itemId/latest', realtimeGeolocationCtrl.getLatestGeolocationInfo);

    return router;
  }
}
