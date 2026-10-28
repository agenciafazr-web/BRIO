'use client';
import {useState} from 'react';

const presets=['Ananindeua, PA','Belém, PA','Marabá, PA'];

function Person({person,type}){
 return <a className="citizenPerson" href={person.url} target="_blank" rel="noreferrer">
   <div className="citizenAvatar">{person.photo?<img src={person.photo} alt={person.name}/>:<span>{person.name?.slice(0,1)}</span>}</div>
   <div className="citizenPersonCopy"><small>{type}</small><strong>{person.name}</strong><span>{person.party} · {person.uf}</span></div>
   <b>↗</b>
 </a>
}

export default function CitizenFinder(){
 const [query,setQuery]=useState('');
 const [data,setData]=useState(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [showAll,setShowAll]=useState(false);

 async function search(value){
   const q=(value??query).trim();
   if(!q)return;
   setQuery(q);setLoading(true);setError('');setShowAll(false);
   try{
     const response=await fetch('/api/cidadao?q='+encodeURIComponent(q));
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error||'Não foi possível consultar agora.');
     setData(payload);
   }catch(err){setData(null);setError(err.message||'Não foi possível consultar agora.');}
   finally{setLoading(false);}
 }
 function submit(e){e.preventDefault();search();}
 const deputies=data?.deputies||[];
 const visibleDeputies=showAll?deputies:deputies.slice(0,6);

 return <section className="citizen" id="comunidade">
   <div className="container citizenShell">
     <div className="citizenIntro">
       <span className="citizenEyebrow"><i/> BRIO CIDADÃO</span>
       <h2>Quem representa você?</h2>
       <p>Digite seu CEP ou sua cidade e descubra quem ocupa os cargos que representam o seu estado em Brasília.</p>
       <form className="citizenSearch" onSubmit={submit}>
         <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="CEP ou Cidade, UF" aria-label="CEP ou cidade e UF"/>
         <button disabled={loading}>{loading?'BUSCANDO…':'DESCOBRIR'} <b>→</b></button>
       </form>
       <div className="citizenPresets">{presets.map(item=><button key={item} onClick={()=>search(item)}>{item}</button>)}</div>
       {error&&<div className="citizenError">{error}</div>}
       <small className="citizenPrivacy">Sua busca serve apenas para localizar município e estado. O BRIO não guarda seu CEP.</small>
     </div>

     {!data?<div className="citizenPreview">
       <div className="citizenPreviewTop"><span>UMA FERRAMENTA BRIO</span><b>BR</b></div>
       <h3>Da sua cidade até Brasília.</h3>
       <p>Veja quem está exercendo mandato pelo seu estado, com acesso direto aos perfis oficiais.</p>
       <div className="citizenPreviewSteps">
         <div><b>01</b><span>Informe sua localização</span></div>
         <div><b>02</b><span>Veja seus representantes</span></div>
         <div><b>03</b><span>Acesse a fonte oficial</span></div>
       </div>
     </div>:<div className="citizenResult">
       <div className="citizenResultHead">
         <div><span>SUA LOCALIDADE</span><h3>{data.city} <i>·</i> {data.uf}</h3></div>
         <button onClick={()=>{setData(null);setQuery('');}}>ALTERAR</button>
       </div>

       <div className="citizenGroup">
         <div className="citizenGroupHead"><span>SENADO FEDERAL</span><small>{data.senators.length} em exercício pelo estado</small></div>
         <div className="citizenSenators">{data.senators.map(person=><Person key={'s'+person.id} person={person} type="SENADOR(A)"/>)}</div>
       </div>

       <div className="citizenGroup citizenDeputiesGroup">
         <div className="citizenGroupHead"><span>CÂMARA DOS DEPUTADOS</span><small>{deputies.length} deputados federais</small></div>
         <div className="citizenDeputies">{visibleDeputies.map(person=><Person key={'d'+person.id} person={person} type="DEPUTADO(A) FEDERAL"/>)}</div>
         {deputies.length>6&&<button className="citizenMore" onClick={()=>setShowAll(v=>!v)}>{showAll?'MOSTRAR MENOS':'VER TODOS OS '+deputies.length+' DEPUTADOS'} <b>{showAll?'↑':'↓'}</b></button>}
       </div>

       <div className="citizenSource"><span>Dados públicos atualizados pelas fontes oficiais</span><b>Câmara dos Deputados · Senado Federal</b></div>
     </div>}
   </div>
 </section>;
}
