'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {createClient} from '../lib/supabase/client';

export default function AdminParticipationShortcut(){
 const path=usePathname(),[count,setCount]=useState(0);
 useEffect(()=>{
   if(!path?.startsWith('/admin')||path==='/admin/login'||path.startsWith('/admin/participacoes'))return;
   let alive=true;
   createClient().from('participations').select('id',{count:'exact',head:true}).eq('status','novo').then(({count})=>{if(alive)setCount(count||0)}).catch(()=>{});
   return()=>{alive=false};
 },[path]);
 if(!path?.startsWith('/admin')||path==='/admin/login'||path.startsWith('/admin/participacoes'))return null;
 return <a href="/admin/participacoes" style={{position:'fixed',left:18,bottom:118,zIndex:60,width:194,display:'flex',alignItems:'center',gap:10,background:'#102238',color:'#fff',border:'1px solid #ffffff0e',borderRadius:9,padding:'11px 12px',fontSize:12,fontWeight:750,boxShadow:'0 10px 24px #0002'}}><span style={{width:8,height:8,borderRadius:'50%',background:'#8ce8b7',flex:'0 0 auto'}}/>Participações{count>0&&<b style={{marginLeft:'auto',minWidth:22,height:22,padding:'0 6px',borderRadius:999,display:'grid',placeItems:'center',background:'#8ce8b7',color:'#07111f',fontSize:10}}>{count>99?'99+':count}</b>}</a>;
}
