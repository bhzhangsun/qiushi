import { IncomingMessage } from 'http'
import { WebSocket } from 'ws'
import Meeting from './meeting'
import Peer from './peer'

class Agent extends Peer {
  mid: string
  url: string
  constructor(sock: WebSocket, mid: string, req: IncomingMessage) {
    super(sock, req)
    this.url = req.headers.origin + req.url
    this.mid = mid
  }

  message(msg: unknown) {
    Meeting.get(this.mid)?.broadcastToMonitor(msg)
  }

  close(): void {
    Meeting.get(this.mid)?.agentLeave()
  }
}

export default Agent
