import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function App(){
  const navigate = useNavigate()
  const [room,setRoom] = useState('')
  useEffect(()=>{ setRoom(nanoid(8)) },[])
  return (
    <div style={{height:'100%',display:'grid',placeItems:'center'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{fontSize:48, margin:0}}>InfiniteCollab</h1>
        <p style={{opacity:.8}}>Share the URL. Draw and write together in real-time.</p>
        <button className="button" onClick={()=> navigate(`/board/${room}`)}>Start a board</button>
      </div>
    </div>
  )
}
