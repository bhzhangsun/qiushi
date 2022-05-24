import { IncomingMessage } from 'http'
import * as internal from 'stream'
import 'url'
import { split } from './tools'
import { WebSocket, WebSocketServer } from 'ws'

// 当前Middleware 不可扩展, 只作为函数句柄使用
export type IMiddleware = (ctx: ConnContext, next?: () => void) => unknown
export type WsListener = (
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) => void
export type KV = { [key: string]: unknown }

export class WsContext {
  req: IncomingMessage
  socket: internal.Duplex
  head: Buffer
  pathArgs: KV = {}
  queryArgs: KV = {}
  wss: WebSocketServer

  constructor(req: IncomingMessage, socket: internal.Duplex, head: Buffer) {
    this.req = req
    this.socket = socket
    this.head = head
  }
}

export interface ConnContext {
  client: WebSocket
  request: IncomingMessage
  wsContex: WsContext
}

class WsRouter {
  path: string // pattern
  query: string
  children: WsRouter[] = [] // 子路由内mux当前不可用
  handler: IMiddleware
  mux: (ctx: WsContext) => WebSocketServer = () => null

  constructor(path: string = '/', handler: IMiddleware = () => {}) {
    const parts = path.split('?')
    console.log('router ctor:', parts[0])

    if (parts[0]) this.path = parts[0]
    if (parts[1]) this.query = parts[1]

    this.handler = handler
  }

  private dispatch(pathname: string, ctx: WsContext): IMiddleware {
    const patterns = split(this.path)
    const paths = split(pathname)
    // console.log('match:', patterns, paths)

    let i = 0
    while (i < patterns.length && i < paths.length) {
      const [_, key] = /:(.*)/.exec(patterns[i]) || []

      if (key) {
        ctx.pathArgs[key] = paths[i]
      } else if (patterns[i] != paths[i]) {
        return null // 匹配失败
      }
      i++
    }
    if (patterns.length > paths.length) {
      return null // 匹配失败
    } else if (patterns.length < paths.length) {
      for (const route of this.children) {
        // 匹配子路由
        const uri = paths.slice(i).join('/')
        const h = route.dispatch(uri, ctx)
        if (h) {
          return h
        }
      }
    }
    // 当前路由匹配成功
    // !TODO query参数校验
    return this.handler
  }

  match(path: string = '/', handler?: IMiddleware) {
    this.children.push(new WsRouter(path, handler))
  }

  setSocketMux(socketMux: (ctx: WsContext) => WebSocketServer) {
    this.mux = socketMux
  }

  routes(): WsListener {
    return (req, socket, head) => {
      console.log('websocket upgrade:', req.url)

      const ctx = new WsContext(req, socket, head)
      const handler = this.dispatch(req.url, ctx)
      let wss = this.mux(ctx)
      if (!wss) {
        // 未获取到websocket 新建socketserver
        wss = new WebSocketServer({ noServer: true })
      }
      ctx.wss = wss

      wss.handleUpgrade(req, socket, head, (client, request) => {
        const newCtx: ConnContext = {
          client,
          request,
          wsContex: ctx,
        }

        // 使用ws 协议ping来为链接保活，使之能在网关层不中断 10s是在ship环境的经验值
        const interval = setInterval(() => client.ping(), 10000)
        // client.on('pong', () => console.log('pong'))
        client.addEventListener('error', () => clearInterval(interval))
        client.addEventListener('close', () => clearInterval(interval))

        if (handler) handler(newCtx)
      })
    }
  }
}

export default WsRouter
