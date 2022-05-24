import Router from 'koa-router'
import WsRouter from './utils/ws-router'
import { success } from './utils/response'
import { heatbeat, register } from './controllers/http'
import { connAgent, connMonitor, connPanel } from './controllers/ws'

// Koa Router
export const router = new Router()

router.get('/health', heatbeat)
router.get('/ready', heatbeat)
router.post('/crd/agent/register', register)

// Websocket Router
export const wsrouter = new WsRouter()

wsrouter.match('/crd/agent/join/:mid', connAgent)
wsrouter.match('/crd/monitor/join/:mid', connMonitor)
wsrouter.match('/crd/agent/list', connPanel)
