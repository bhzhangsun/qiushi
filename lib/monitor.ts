export interface IMetadata {
  description: string
  title: string
  id: string
  devtoolsFrontendUrl: string
  type: string
  url: string
  webSocketDebuggerUrl: string
}

class Monitor {
  private _root: Element
  url: URL
  private _render: (data: IMetadata) => string
  constructor(domain: string = location.host) {
    const uri = `ws${location.protocol.slice(4)}//${domain}` + '/crd/agent/list'
    this.url = new URL(uri)
    this._render = (data: IMetadata): string => {
      const { title, id, devtoolsFrontendUrl, type, url } = data
      return `
        <div class="agent-card">
          <a class="agent-title" target="_blank" href="${devtoolsFrontendUrl}">
            <strong>${title}</strong>&nbsp;<em>(id: ${id})</em>
          </a>
          <a class="agent-link">
            <i class="i iconfont icon-copy"></i>
            <span class="agent-url">${url}</span>
          </a>
          <div class="agent-info">
            <i class="i iconfont icon-android i-${
              type == 'android' ? 'enable' : 'disable'
            }"></i>
            <i class="i iconfont icon-ios i-${
              type == 'ios' ? 'enable' : 'disable'
            }"></i>
            <i class="i iconfont icon-pc i-${
              type == 'pc' ? 'enable' : 'disable'
            }"></i>
            <i class="i iconfont icon-notfound i-${
              type == 'unknown' ? 'enable' : 'disable'
            }"></i>
          </div>
        </div>
      `
    }
  }

  init() {
    const ws = new WebSocket(this.url)
    ws.addEventListener('open', (ev: any) => console.log('ws onopen:', ev))
    ws.addEventListener('close', (ev) => console.log('ws onclose:', ev))
    ws.addEventListener('error', (ev) => console.log('ws onerror:', ev))
    ws.addEventListener('message', (ev) => {
      // console.log('ws message:', ev.data)
      const data: IMetadata[] = JSON.parse(ev.data)
      this.renderer(data)
    })
    return this
  }

  renderer(datas: IMetadata[]) {
    console.log('renderer:', datas)

    this._root.innerHTML = ''
    let html = ''
    datas.forEach((data) => {
      const tpl = this._render(data)
      html += tpl
    })
    this._root.innerHTML = html
  }

  template(render: (data: IMetadata) => string) {
    return (this._render = render)
  }

  mount(selector: string) {
    const el = document.querySelector(selector)
    if (el) {
      return (this._root = el)
    } else {
      return new Error('挂载元素有误')
    }
  }
}

export default Monitor
