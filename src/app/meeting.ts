import { WebSocketServer } from 'ws'
import Agent from './agent'
import Monitor from './monitor'
import Panel from './panel'
import { UAParser as parser, IResult } from 'ua-parser-js'
import { plat } from '../utils/tools'

export interface IMetadata {
  description: string
  title: string
  id: string
  devtoolsFrontendUrl: string
  type: string
  url: string
  webSocketDebuggerUrl: string
}

export interface IMeetingInfo {
  url: string
  title: string
  ua: string
  languages: string
}
export default class Meeting {
  mid: string
  wss: WebSocketServer
  state: 'init' | 'ready' | 'over' = 'init'
  agent: Agent = null
  monitors: Map<string, Monitor> = new Map<string, Monitor>()
  info: IMeetingInfo // 会议附加信息，由注册者接口传入

  constructor(mid: string, info: IMeetingInfo) {
    this.mid = mid
    this.info = info
    this.wss = new WebSocketServer({ noServer: true })
  }

  agentJoin(agent: Agent) {
    this.agent = agent
    this.state = 'ready'
    console.log('meeting: agent join')
    Meeting.update()
  }

  agentLeave() {
    this.state = 'over'
    Meeting.over(this.mid)
    console.log('meeting: agent leave')
    Meeting.update()
  }

  monitorJoin(monitor: Monitor) {
    const key = monitor.key
    this.monitors.set(key, monitor)
    console.log('meeting: monitor join')
  }

  monitorLeave(key: string) {
    this.monitors.delete(key)
    console.log('meeting: monitor leave')
  }

  broadcastToMonitor(msg: unknown) {
    for (const [_, monitor] of this.monitors) {
      monitor.send(msg)
    }
  }

  sendToAgent(msg: unknown) {
    this.agent.send(msg)
  }

  private static _hub = new Map<string, Meeting>()
  static create(mid: string, info: IMeetingInfo) {
    if (this._hub.has(mid)) {
      const meet = this._hub.get(mid)
      meet.info = info
      return meet
    }

    const meet = new Meeting(mid, info)
    this._hub.set(mid, meet)
    return meet
  }

  static get(mid: string) {
    console.log('_hub:', this._hub.keys())
    return this._hub.get(mid)
  }

  static over(mid: string) {
    if (this._hub.has(mid)) {
      return this._hub.delete(mid)
    }
  }

  static update() {
    console.log('meeting update:', this._hub.keys())
    const list = []
    for (const meeting of this._hub.values()) {
      if (meeting.state == 'ready') {
        const info = meeting.info
        const uri = new URL(info.url)
        const proto = uri.protocol == 'https:' ? 'wss' : 'ws'
        const debugWs = `${uri.host}/crd/monitor/join/${meeting.mid}`
        const meta = parser(info.ua)

        const data: IMetadata = {
          description: '',
          title: info.title,
          id: meeting.mid,
          devtoolsFrontendUrl: `/crd/devtools/inspector.html?${proto}=${debugWs}`,
          type: plat(meta.os.name),
          url: info.url,
          webSocketDebuggerUrl: `${proto}://${debugWs}`,
        }
        list.push(data)
      }
    }

    return Panel.instance().update(list)
  }
}
