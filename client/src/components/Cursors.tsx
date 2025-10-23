import { useEffect, useState } from 'react'
import Konva from 'konva'

interface Presence { id:number; name:string; color:string; x:number; y:number }
export default function Cursors({stage, awareness}:{stage:Konva.Stage|null, awareness:any}){
  const [peers,setPeers] = useState<Presence[]>([])

  useEffect(()=>{
    if(!awareness) return
    const handler = ()=>{
      const states = Array.from(awareness.getStates().entries())
      const me = awareness.clientID
      const arr:Presence[] = states
        .filter(([id])=> id!==me)
        .map(([id, s]: any)=> ({ id, name: s.user?.name||`User-${id}`, color: s.user?.color||'#4cc9f0', x: s.cursor?.x||0, y: s.cursor?.y||0 }))
      setPeers(arr)
    }
    awareness.on('change', handler); handler()
    return ()=> awareness.off('change', handler)
  },[awareness])

  useEffect(()=>{
    if(!stage || !awareness) return
    const onMove = ()=>{
      const p = stage.getPointerPosition(); if(!p) return
      awareness.setLocalStateField('cursor', { x: p.x, y: p.y })
    }
    stage.on('mousemove touchmove', onMove)
    return ()=> { stage.off('mousemove touchmove', onMove) }
  },[stage, awareness])

  return (
    <>
      {peers.map(p=> (
        <div key={p.id} style={{position:'absolute', left:p.x+8, top:p.y+8, pointerEvents:'none'}}>
          <div style={{width:10,height:10,borderRadius:999,background:p.color,boxShadow:'0 0 10px rgba(0,0,0,.6)'}}></div>
          <div style={{fontSize:12, opacity:.8}}>{p.name}</div>
        </div>
      ))}
    </>
  )
}
