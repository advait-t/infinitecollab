import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export function initY(room:string){
  const doc = new Y.Doc()
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:1234'
  const provider = new WebsocketProvider(wsUrl, room, doc, { connect: true })
  const idb = new IndexeddbPersistence(`ic-${room}`, doc)
  return { doc, provider, awareness: provider.awareness, idb }
}
