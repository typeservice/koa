import axios from 'axios';
import Koa from '../src';

describe('TypeService koa frameworker unit tests', () => {
  test('test normalize', done => {
    const app = new Koa(9000);
    app.use(async (ctx, next) => {
      ctx.body = 'hello world';
      await next();
    });
    app.httpBootstrap();
    app.listen()
      .then(() => axios.get('http://127.0.0.1:9000'))
      .then(res => expect(res.data).toBe('hello world'))
      .finally(() => {
        app.close();
        done()
      });
  });

  test('no bootstrap', done => {
    const app = new Koa(9000);
    app.use(async (ctx, next) => {
      ctx.body = 'hello world';
      await next();
    });
    app.on('error', async e => expect(e.message).toBe('please use .bootstrap(fn) before using .listen'))
    app.listen()
    .finally(() => {
      app.close();
      done()
    });
  })

  test('http start with custom function', done => {
    const app = new Koa(9000);
    let a = 0;
    app.use(async (ctx, next) => {
      ctx.body = 'hello world';
      await next();
    });
    app.httpBootstrap(server => {
      a = 1;
    });
    app.listen()
      .then(() => axios.get('http://127.0.0.1:9000'))
      .then(res => expect(res.data).toBe('hello world'))
      .then(() => expect(a).toEqual(1))
      .finally(() => {
        app.close();
        done()
      });
  })
})