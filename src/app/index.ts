import Koa from 'koa'
import cors from 'koa-cors'
import mount from 'koa-mount'
import serve from 'koa-static'
import bodyparser from 'koa-bodyparser'
import path from 'path'

import { createServer, Server } from 'http'
import { router, wsrouter } from '../routes'
import { wssMux } from '../controllers/ws'

class App {
  private static _instance: App = new App()
  port: number
  server: Server

  private constructor() {
    this.port = 3000
    this.initHttp()
    this.initWebsocket()
  }

  static instance() {
    return this._instance
  }

  private initHttp() {
    const koa = new Koa()
    koa
      .use(cors())
      .use(bodyparser())
      .use(router.routes())
      .use(router.allowedMethods())
      .use(mount('/crd', serve(path.resolve(__dirname, '../../public'))))
      .use(
        mount(
          '/crd/devtools',
          serve(
            path.resolve(
              __dirname,
              '../../node_modules/chrome-devtools-frontend/front_end'
            )
          )
        )
      )

    this.server = createServer(koa.callback())
  }

  private initWebsocket() {
    wsrouter.setSocketMux(wssMux)
    this.server.on('upgrade', wsrouter.routes())
  }

  run() {
    this.server.listen(this.port)
  }
}

export default App
