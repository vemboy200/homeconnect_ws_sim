import { type UpdateMessage, type WsMessage } from '@/types'
import { useStore } from '@/store'

const RECONNECT_DELAY_MS = 2000

class Ws {
  websocket: WebSocket | undefined
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined

  async ws_init() {
    const url = new URL('/api/ws', window.location.origin)
    url.protocol = 'ws:'
    console.log('Starting connection to WebSocket')
    this.websocket = new WebSocket(url)
    this.websocket.onmessage = this.ws_onmessage
    this.websocket.onopen = () => {
      console.log('Connected to WebSocket')
    }
    this.websocket.onclose = () => {
      // The server (and its container) can restart independently of this
      // page - without this, a closed socket just sits dead and every
      // future send() silently no-ops until the page is manually reloaded.
      console.log('WebSocket closed, reconnecting in', RECONNECT_DELAY_MS, 'ms')
      this.scheduleReconnect()
    }
    this.websocket.onerror = () => {
      console.log('WebSocket Error')
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer != null) {
      return
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined
      this.ws_init()
    }, RECONNECT_DELAY_MS)
  }

  async ws_onmessage(event: MessageEvent) {
    const message: WsMessage = JSON.parse(event.data)
    if (message.action == 'init') {
      useStore().init_entities(message)
    }
    if (message.action == 'update') {
      useStore().update_entity(message)
    }
  }
  async send(data: object) {
    this.websocket?.send(JSON.stringify(data))
  }
}

const ws = new Ws()

export default ws
