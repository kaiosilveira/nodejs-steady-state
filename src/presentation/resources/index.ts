import { Router } from 'express';
import ApplicationState from '../application-state';
import HealthCheckController, { ApplicationEnv } from './health-check/controller';

export default class PresentationResourcesManager {
  static configureRouter({ appState, router }: { appState: ApplicationState; router: Router }) {
    const env: ApplicationEnv = {
      NODE_ENV: process.env.NODE_ENV || 'dev',
      COMMIT_SHA: process.env.COMMIT_SHA || 'unknown',
      NODE_VERSION: process.version,
    };

    const healthCheckCtrl = new HealthCheckController({ applicationState: appState, env });

    router.get('/health', healthCheckCtrl.getHealthState);
    return router;
  }
}
