import { Request, Response } from 'express';
import FakeExpressResponse from '../response';

export default class FakeExpressFactory {
  static createRequest({ headers, body, ctx } = { headers: {}, body: {}, ctx: {} }): Request {
    return { headers, body, context: ctx } as unknown as Request;
  }

  static createResponse(): Response {
    return new FakeExpressResponse() as unknown as Response;
  }
}
