# @typeservice/koa

It is a KOA-based service architecture that is fully compatible with all KOA ecosystems, while providing dynamic Agent assistance processes and IPC communication mechanisms.s

## Installing

For the latest stable version:

```bash
$ npm install @typeservice/koa
```

## Usage

```ts
import Koa, { Context } from '@typeservice/koa';
interface CustomContext extends Context {
  abc: number
}
const app = new Koa(9000);
app.use(async (ctx, next) => {
  ctx.abc = 789;
  await next();
});
app.use(async (ctx, next) => {
  ctx.body = 'hello world, ' + ctx.abc;
  await next();
});
app.listen();
```

You also can user `messager`

```ts
const app = new Koa(9000);
app.use(async (ctx, next) => {
  ctx.abc = await ctx.messager.invoke('xxxx', 'xxxx', 'xxxx');
  await next();
});
app.listen();
```

# License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, yunjie (Evio) shen
