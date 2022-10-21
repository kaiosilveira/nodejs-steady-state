import Express from 'express';
import Helmet from 'helmet';

import PresentationResourcesManager from '../resources';

export default class ExpressAppFactory {
  static createApp() {
    const instance = Express();

    instance.use(Helmet());
    instance.use(Express.json());
    instance.use(Express.urlencoded({ extended: true }));
    instance.use(PresentationResourcesManager.configureRouter(Express.Router()));

    return { instance };
  }
}
