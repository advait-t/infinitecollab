import { HexColorPicker } from 'react-colorful'
export default function ColorPicker({color,onChange}:{color:string;onChange:(c:string)=>void}){
  return (
    <div style={{padding:8, background:'var(--panel)', borderRadius:12}}>
      <HexColorPicker color={color} onChange={onChange} />
      <div style={{marginTop:8,fontSize:12,opacity:.8}}>{color}</div>
    </div>
  )
}
