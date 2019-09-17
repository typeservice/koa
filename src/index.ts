import * as http from 'http';
import * as Koa from 'koa';
import { WorkerFactory, Logger, ProcessException, Messager } from '@typeservice/core';

export interface Context extends Koa.Context {
  messager: Messager;
  logger: Logger;
}

export default class KoaService<StateT = any, CustomT extends Context = Context> extends WorkerFactory {
  public readonly app: Koa<StateT, CustomT>;
  private server: http.Server;
  constructor(port: number = 8080, logger?: Logger) {
    super(logger);
    this.app = new Koa();
    Object.defineProperties(this.app.context, {
      messager: { value: this.messager },
      logger: { value: this.logger },
    });
    this.on('error', async (error: ProcessException, name: string) => this.logger.error(name, error));
    this.on('setup', () => new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (err?: Error) => {
        if (err) return reject(err);
        this.logger.info('server run at port:', port);
        resolve();
      })
    }));
    this.on('exit', async () => {
      if (this.server) this.server.close();
    });
  }

  use<NewStateT = {}, NewCustomT = {}>(middleware: Koa.Middleware<StateT & NewStateT, CustomT & NewCustomT>) {
    return this.app.use<NewStateT, NewCustomT>(middleware);
  }
}