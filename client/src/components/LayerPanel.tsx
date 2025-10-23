import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { Layer } from '../board/types'

export default function LayerPanel({
  layersY, open, onToggle
}:{ layersY:Y.Array<any>, open:boolean, onToggle:()=>void }){
  const [layers,setLayers] = useState<Layer[]>([])

  useEffect(()=>{
    const update = ()=> setLayers(layersY.toArray())
    layersY.observeDeep(update); update()
    return ()=> layersY.unobserveDeep(update)
  },[layersY])

  const toggleVisible = (id:string)=>{
    const idx = layers.findIndex(l=>l.id===id); if(idx<0) return
    const next = {...layers[idx], visible: !layers[idx].visible}
    layersY.delete(idx,1); layersY.insert(idx,[next])
  }
  const rename = (id:string)=>{
    const name = prompt('Layer name?'); if(!name) return
    const idx = layers.findIndex(l=>l.id===id)
    layersY.delete(idx,1); layersY.insert(idx,[{...layers[idx], name}])
  }
  const add = ()=>{
    const order = layers.length
    const id = (typeof crypto!=='undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2)
    layersY.push([{ id, name:`Layer ${order+1}`, visible:true, order }])
  }
  const move = (id:string, dir:-1|1)=>{
    const idx = layers.findIndex(l=>l.id===id); if(idx<0) return
    const swap = idx+dir; if(swap<0||swap>=layers.length) return
    const a = layers[idx], b = layers[swap]
    layersY.delete(idx,1); layersY.insert(idx,[{...b, order: idx}])
    layersY.delete(swap,1); layersY.insert(swap,[{...a, order: swap}])
  }
  const remove = (id:string)=>{
    const idx = layers.findIndex(l=>l.id===id); if(idx<0) return
    layersY.delete(idx,1)
  }

  return (
    <div
      style={{
        position:'fixed',
        top:12,
        right:12,
        zIndex: 20,
        pointerEvents:'auto'
      }}
    >
      {/* Toggle button (visible when collapsed too) */}
      <button
        className="button"
        onClick={onToggle}
        style={{marginBottom:8}}
        title="Toggle Layers"
      >
        {open ? 'Hide Layers' : 'Layers'}
      </button>

      {/* Panel */}
      <div
        style={{
          maxHeight: open ? 360 : 0,
          width: 260,
          overflow:'hidden',
          transition:'max-height .25s ease',
          background:'var(--panel, rgba(20,20,20,.95))',
          borderRadius:12,
          padding: open ? 10 : 0,
          boxShadow:'0 6px 18px rgba(0,0,0,.28)'
        }}
      >
        {open && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <strong>Layers</strong>
              <button className="button" onClick={add}>+ Add</button>
            </div>
            <div style={{display:'grid', gap:8}}>
              {layers.sort((a,b)=>a.order-b.order).map(l=>(
                <div key={l.id} style={{display:'flex',gap:8,alignItems:'center'}}>
                  <button className="button" onClick={()=>toggleVisible(l.id)}>{l.visible?'👁':'🚫'}</button>
                  <div style={{flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.name}</div>
                  <button className="button" onClick={()=>rename(l.id)}>Rename</button>
                  <button className="button" onClick={()=>move(l.id,-1)}>↑</button>
                  <button className="button" onClick={()=>move(l.id,1)}>↓</button>
                  <button className="button" onClick={()=>remove(l.id)}>🗑️</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
