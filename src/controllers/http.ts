import * as Koa from 'koa'
import { guid } from '../utils/tools'
import { success } from '../utils/response'
import Meeting from '../app/meeting'

export function heatbeat(ctx: Koa.Context, _next: Koa.Next) {
  success(ctx, '成功')
}

export function register(ctx: Koa.Context, _next: Koa.Next) {
  const json = ctx.request.body
  const id = guid()
  Meeting.create(id, json)
  success(ctx, {
    mid: id,
  })
}
