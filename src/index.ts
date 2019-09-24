import * as http from 'http';
import * as http2 from 'http2';
import * as Koa from 'koa';
import { WorkerFactory, Logger, ProcessException, Messager } from '@typeservice/core';

type IncomingMessage = http.IncomingMessage | http2.Http2ServerRequest;
type ServerResponse = http.ServerResponse | http2.Http2ServerResponse;

type InspectorBootstrapCallback = 
  (callback: (req: IncomingMessage, res: ServerResponse) => void) 
    => http.Server | http2.Http2Server;

export interface Context extends Koa.Context {
  messager: Messager;
  logger: Logger;
}

export default class KoaService<StateT = any, CustomT = {}> extends WorkerFactory {
  public readonly app: Koa<StateT, CustomT>;
  private server: http.Server | http2.Http2Server;
  private callback: InspectorBootstrapCallback;
  private closed: boolean = true;
  constructor(port: number = 8080, logger?: Logger) {
    super(logger);
    this.app = new Koa();
    Object.defineProperties(this.app.context, {
      messager: { value: this.messager },
      logger: { value: this.logger },
    });
    this.on('error', async (error: ProcessException, name: string) => this.logger.error(name, error));
    this.on('setup', () => new Promise((resolve, reject) => {
      if (!this.callback) {
        this.sync(
          'error', 
          new ProcessException('please use .bootstrap(fn) before using .listen', 'EBOOTSTRAP'), 
          'EBOOTSTRAP'
        );
        return resolve();
      }
      const callback = this.app.callback();
      this.server = this.callback(callback);
      this.server.listen(port, (err?: Error) => {
        /* istanbul ignore if */
        if (err) return reject(err);
        this.logger.info('server run at port:', port);
        this.closed = false;
        resolve();
      })
    }));
    /* istanbul ignore next */
    this.on('exit', async () => this.close());
  }

  use<NewStateT = {}, NewCustomT = {}>(middleware: Koa.Middleware<StateT & NewStateT, CustomT & NewCustomT>) {
    return this.app.use<NewStateT, NewCustomT>(middleware);
  }

  close() {
    if (this.server) {
      if (!this.closed) {
        this.server.close();
        this.closed = true;
      }
    }
  }

  bootstrap(fn: InspectorBootstrapCallback) {
    this.callback = fn;
  }

  httpBootstrap(fn?: (server: http.Server) => void) {
    this.bootstrap(callback => {
      const server = http.createServer(callback);
      fn && fn(server);
      return server;
    });
  }

  /* istanbul ignore next */
  http2Bootstrap(fn?: (server: http2.Http2Server) => void) {
    this.bootstrap(callback => {
      const server = http2.createServer(callback);
      fn && fn(server);
      return server;
    });
  }
}