import { IncomingMessage } from 'http'
import { WebSocket } from 'ws'
import { IMetadata } from './meeting'
import Peer from './peer'

class Panel {
  peers: Peer[] = []
  private _data: IMetadata[] = []
  constructor() {}

  private static _instance = new Panel()
  static instance() {
    return this._instance
  }

  join(sock: WebSocket, req: IncomingMessage) {
    const peer = new Peer(sock, req, {
      onclose: () => {
        const idx = this.peers.indexOf(peer)
        this.peers.splice(idx, 1)
        console.log('panel colsed')
      },
    })

    this.peers.push(peer)
    peer.send(JSON.stringify(this._data))
    console.log('new panel join')
  }

  update(data: IMetadata[]) {
    this._data = data
    for (const peer of this.peers) {
      peer.send(JSON.stringify(data))
    }
  }
}

export default Panel
