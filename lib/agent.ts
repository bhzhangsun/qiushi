import * as chobitsu from '@mnichangxin/chobitsu'

class Agent {
  host: string
  prefix: string = ''
  ws: WebSocket
  id: string

  constructor(domain: string = location.host, prefix: string = '') {
    this.host = domain
    this.prefix = prefix
  }

  private _connWs(mid: string) {
    const pathname = this.prefix + `/crd/agent/join/${mid}`
    const url = `ws${location.protocol.slice(4)}//` + this.host + pathname

    const ws = new WebSocket(url)
    ws.addEventListener('open', (ev: any) => {
      console.log('ws onopen:', ev)
      chobitsu.setOnMessage((msg: string) => ws.send(msg))
    })
    ws.addEventListener('close', (ev) => console.log('ws onclose:', ev))
    ws.addEventListener('error', (ev) => console.log('ws onerror:', ev))
    ws.addEventListener('message', (ev) => chobitsu.sendRawMessage(ev.data))
    this.ws = ws
  }

  async register() {
    const pathname = this.prefix + '/crd/agent/register'
    const url = location.protocol + '//' + this.host + pathname
    try {
      const res = await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          url: location.href,
          title: document.title,
          ua: navigator.userAgent,
          language: navigator.language,
        }),
      }).then((resp) => resp.json())
      const { errNo, data } = res || {}
      if (!errNo && data?.mid) {
        this.id = data?.mid
        this._connWs(data.mid)
        console.log('qiushi Agent start success!!')
      }
    } catch (error) {
      console.log('qiushi Agent start error:', error)
    }
  }
}

export default Agent
