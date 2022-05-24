import Meeting from '../app/meeting'
import { ConnContext, WsContext } from '../utils/ws-router'
import Agent from '../app/agent'
import Monitor from '../app/monitor'
import Panel from '../app/panel'

export function wssMux(ctx: WsContext) {
  const { req, pathArgs } = ctx
  if (req.url.startsWith('/crd/agent/join/') && pathArgs.mid) {
    const meeting = Meeting.get(pathArgs.mid as string)
    return meeting.wss
  }
  return null
}

export function connAgent(ctx: ConnContext) {
  const { mid } = ctx.wsContex.pathArgs
  console.log(`/crd/agent/join/${mid}`)

  const meeting = Meeting.get(mid as string)

  const { client, request } = ctx
  const agent = new Agent(client, mid as string, request)
  meeting.agentJoin(agent)
}

export function connMonitor(ctx: ConnContext) {
  const { mid } = ctx.wsContex.pathArgs
  console.log('/crd/monitor/join/:mid', mid)

  const meeting = Meeting.get(mid as string)

  if (!meeting) {
    return console.error('connMonitor not get meeting')
  }
  const { client, request } = ctx
  const monitor = new Monitor(client, mid as string, request)
  meeting.monitorJoin(monitor)
}

export function connPanel(ctx: ConnContext) {
  const { client, request } = ctx
  Panel.instance().join(client, request)
  console.log('/crd/agent/list:', 'panel open')
}
