declare namespace Express {
  export type RequestContext = {
    url: string;
    method: string;
    reqStartedAt: number;
    actionUUID: string;
  };

  export interface Request {
    context?: RequestContext;
  }

  export interface Response {
    body?: Object;
  }
}
