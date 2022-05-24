import { WebSocket, ErrorEvent } from 'ws'
import parser from 'ua-parser-js'
import { IncomingMessage } from 'http'

interface PeerOption {
  onclose?: () => unknown
  onerror?: (err: ErrorEvent) => unknown
  onmessage?: (ev: unknown) => unknown
  [key: string]: unknown
}

class Peer {
  req: IncomingMessage
  ua: parser.IResult
  socket: WebSocket

  constructor(sock: WebSocket, req: IncomingMessage, options?: PeerOption) {
    this.socket = sock
    this.ua = parser(req.headers['user-agent'])
    if (options) {
      const {
        onclose = () => {},
        onerror = () => {},
        onmessage = () => {},
      } = options
      sock.addEventListener('close', () => onclose())
      sock.addEventListener('error', (ev) => onerror(ev))
      sock.addEventListener('message', (ev) => onmessage(ev.data))
    }

    sock.addEventListener('error', (err) => this.error(err))
    sock.addEventListener('message', (ev) => this.message(ev.data))
    sock.addEventListener('close', () => {
      this.close()
      this.socket.close()
    })
  }

  send(message: unknown) {
    this.socket.send(message)
  }

  error(err: ErrorEvent) {
    this.socket.close()
    console.log('socket peer error:', err)
  }

  close(): void {}

  message(msg: unknown): void {}
}

export default Peer
