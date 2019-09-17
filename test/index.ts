import Koa from '../src';

const app = new Koa(9000);
app.use(async (ctx, next) => {
  ctx.body = 'hello world';
  await next();
});
app.listen();