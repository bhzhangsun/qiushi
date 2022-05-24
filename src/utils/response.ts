import * as Koa from 'koa'
export const success = (ctx: Koa.Context, data: unknown) => {
  ctx.status = 200
  ctx.body = {
    errNo: 0,
    errstr: '',
    data: data,
  }
}
