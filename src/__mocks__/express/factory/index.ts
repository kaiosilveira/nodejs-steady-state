import { Request, Response } from 'express';
import FakeExpressResponse from '../response';

export default class FakeExpressFactory {
  static createRequest(
    {
      headers,
      body,
      params,
      ctx,
    }: { headers?: object; body?: object; params?: object; ctx?: object } = {
      headers: {},
      body: {},
      params: {},
      ctx: {},
    }
  ): Request {
    return { headers, body, params, context: ctx } as unknown as Request;
  }

  static createResponse(): Response {
    return new FakeExpressResponse() as unknown as Response;
  }
}
