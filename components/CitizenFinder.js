'use client';
import {useState} from 'react';

const presets=['Ananindeua, PA','Belém, PA','Marabá, PA'];

function Person({person,type}){
 return <a className="citizenPerson" href={person.url} target="_blank" rel="noreferrer">
   <div className="citizenAvatar">{person.photo?<img src={person.photo} alt={person.name}/>:<span>{person.name?.slice(0,1)}</span>}</div>
   <div className="citizenPersonCopy"><small>{type}</small><strong>{person.name}</strong><span>{person.party?person.party+' · ':''}{person.uf}</span></div>
   <b>↗</b>
 </a>
}

function ExecutiveCard({person}){
 if(!person)return null;
 return <a className="citizenExecutiveCard" href={person.url} target="_blank" rel="noreferrer">
   <div className="citizenExecutivePhoto">{person.photo?<img src={person.photo} alt={person.name}/>:<span>{person.name?.slice(0,1)}</span>}</div>
   <div className="citizenExecutiveCopy">
     <small>{person.office}</small>
     <strong>{person.name}</strong>
     <span>{person.party?person.party+' · ':''}{person.uf}</span>
     <em>{person.term}</em>
   </div>
   <div className="citizenExecutiveMeta"><span>{person.elected}</span><b>↗</b></div>
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
     const response=await fetch('/api/cidadao?q='+encodeURIComponent(q),{cache:'no-store'});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload.error||'Não foi possível consultar agora.');
     setData(payload);
   }catch(err){setData(null);setError(err.message||'Não foi possível consultar agora.');}
   finally{setLoading(false);}
 }
 function submit(e){e.preventDefault();search();}
 const deputies=data?.deputies||[];
 const visibleDeputies=showAll?deputies:deputies.slice(0,6);
 const executives=[data?.executives?.mayor,data?.executives?.governor].filter(Boolean);
 const unavailable=data?.unavailable||[];

 return <section className="citizen" id="comunidade">
   <div className="container citizenShell">
     <div className="citizenIntro">
       <div className="citizenIntroTop">
         <span className="citizenEyebrow"><i/> BRIO CIDADÃO</span>
         <span className="citizenOfficial"><i/> FONTES OFICIAIS</span>
       </div>
       <h2>Quem representa você?</h2>
       <p>Digite seu CEP ou sua cidade e veja quem governa sua cidade e seu estado, além de quem representa você em Brasília.</p>
       <form className="citizenSearch" onSubmit={submit}>
         <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="CEP ou Cidade, UF" aria-label="CEP ou cidade e UF"/>
         <button disabled={loading}>{loading?'BUSCANDO…':'DESCOBRIR'} <b>→</b></button>
       </form>
       <div className="citizenPresets"><span>EXEMPLOS</span>{presets.map(item=><button key={item} onClick={()=>search(item)}>{item}</button>)}</div>
       {error&&<div className="citizenError">{error}</div>}
       <small className="citizenPrivacy">Sua busca serve apenas para localizar município e estado. O BRIO não guarda seu CEP.</small>
     </div>

     {!data?<div className="citizenPreview">
       <div className="citizenPreviewGlow"/>
       <div className="citizenPreviewTop">
         <span><i/> MAPA DE REPRESENTAÇÃO</span>
         <b>BRIO</b>
       </div>
       <div className="citizenPreviewHero">
         <div>
           <small>DO MUNICÍPIO AO CONGRESSO</small>
           <h3>Veja quem ocupa cada cadeira.</h3>
           <p>Uma única busca organiza seus representantes por nível de poder e leva você direto às fontes oficiais.</p>
         </div>
         <div className="citizenPreviewPulse">
           <strong>4</strong>
           <span>níveis de<br/>representação</span>
         </div>
       </div>
       <div className="citizenRepresentationMap">
         <div className="citizenRepCard"><b>01</b><div><strong>Prefeitura</strong><span>Quem governa sua cidade</span></div><i>→</i></div>
         <div className="citizenRepCard"><b>02</b><div><strong>Governo do Estado</strong><span>Quem governa sua UF</span></div><i>→</i></div>
         <div className="citizenRepCard"><b>03</b><div><strong>Senado Federal</strong><span>Senadores em exercício</span></div><i>→</i></div>
         <div className="citizenRepCard"><b>04</b><div><strong>Câmara</strong><span>Deputados federais da sua UF</span></div><i>→</i></div>
       </div>
       <div className="citizenPreviewHint"><i/> Digite sua cidade ao lado para montar seu mapa <b>↗</b></div>
     </div>:<div className="citizenResult">
       <div className="citizenResultHead">
         <div><span>SUA LOCALIDADE</span><h3>{data.city} <i>·</i> {data.uf}</h3></div>
         <button onClick={()=>{setData(null);setQuery('');}}>ALTERAR</button>
       </div>

       {executives.length>0&&<div className="citizenGroup citizenExecutiveGroup">
         <div className="citizenGroupHead"><span>PODER EXECUTIVO</span><small>situação atual quando confirmada</small></div>
         <div className="citizenExecutives">{executives.map(person=><ExecutiveCard key={person.id} person={person}/>)}</div>
         <p className="citizenExecutiveNote">Quando há confirmação oficial de mudança no cargo, o BRIO prioriza o ocupante atual. Caso contrário, exibe o resultado eleitoral como referência.</p>
       </div>}

       <div className="citizenGroup">
         <div className="citizenGroupHead"><span>SENADO FEDERAL</span><small>{data.senators.length?data.senators.length+' em exercício pelo estado':'fonte temporariamente indisponível'}</small></div>
         <div className="citizenSenators">{data.senators.map(person=><Person key={'s'+person.id} person={person} type="SENADOR(A)"/>)}</div>
       </div>

       <div className="citizenGroup citizenDeputiesGroup">
         <div className="citizenGroupHead"><span>CÂMARA DOS DEPUTADOS</span><small>{data.deputiesFallback?'API ao vivo indisponível · exibindo bancada eleita em 2022':deputies.length?deputies.length+' deputados federais em exercício':'fonte temporariamente indisponível'}</small></div>
         <div className="citizenDeputies">{visibleDeputies.map(person=><Person key={'d'+person.id} person={person} type={person.fallback?'ELEITO(A) EM 2022':'DEPUTADO(A) FEDERAL'}/>)}</div>
         {deputies.length>6&&<button className="citizenMore" onClick={()=>setShowAll(v=>!v)}>{showAll?'MOSTRAR MENOS':'VER TODOS OS '+deputies.length+' DEPUTADOS'} <b>{showAll?'↑':'↓'}</b></button>}
       </div>

       {unavailable.length>0&&<p className="citizenExecutiveNote">Consulta parcial: {unavailable.join(', ')} {unavailable.length===1?'está':'estão'} temporariamente indisponível{unavailable.length===1?'':'is'}.</p>}
       <div className="citizenSource"><span>Dados públicos consultados em fontes oficiais</span><b>Governos locais · TSE · Câmara · Senado</b></div>
     </div>}
   </div>
 </section>;
}
