import EventEmitter from 'events';

export default class FakeExpressResponse extends EventEmitter {
  statusCode: number;
  body: object;
  callbacks: Object;

  constructor({ statusCode, body = {} }: { statusCode: number; body?: any } = { statusCode: 200 }) {
    super();
    this.statusCode = statusCode;
    this.body = body;
    this.callbacks = {};
  }

  status(status: number) {
    this.statusCode = status;
    return this;
  }

  json(obj: any): any {
    return { body: obj, status: this.statusCode };
  }

  end() {}
}
