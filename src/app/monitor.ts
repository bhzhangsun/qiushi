import { IncomingMessage } from 'http'
import { WebSocket } from 'ws'
import Meeting from './meeting'
import Peer from './peer'

class Monitor extends Peer {
  mid: string
  key: string
  constructor(sock: WebSocket, mid: string, req: IncomingMessage) {
    super(sock, req)
    this.mid = mid
    this.key = Math.random().toString().slice(2, 12)
  }

  message(msg: unknown): void {
    Meeting.get(this.mid)?.sendToAgent(msg)
  }

  close() {
    Meeting.get(this.mid)?.monitorLeave(this.key)
  }

  jsonfy() {
    return {}
  }
}

export default Monitor
