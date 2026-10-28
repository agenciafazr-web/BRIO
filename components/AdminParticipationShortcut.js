'use client';
import {usePathname} from 'next/navigation';

export default function AdminParticipationShortcut(){
 const path=usePathname();
 if(!path?.startsWith('/admin')||path==='/admin/login'||path.startsWith('/admin/participacoes'))return null;
 return <a href="/admin/participacoes" style={{position:'fixed',left:18,bottom:118,zIndex:60,width:194,display:'flex',alignItems:'center',gap:10,background:'#102238',color:'#fff',border:'1px solid #ffffff0e',borderRadius:9,padding:'11px 12px',fontSize:12,fontWeight:750,boxShadow:'0 10px 24px #0002'}}><span style={{width:8,height:8,borderRadius:'50%',background:'#8ce8b7',flex:'0 0 auto'}}/>Participações</a>;
}
