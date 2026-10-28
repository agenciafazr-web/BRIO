'use client';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,Archive,CheckCircle2,Clock3,ExternalLink,FileText,FilePlus2,Inbox,LogOut,MessageCircle,PenLine,Search,ShieldAlert} from 'lucide-react';
import {createClient} from '../../../lib/supabase/client';
import '../admin.css';
import './participacoes.css';
import './participacoes-actions.css';

const LABELS={pauta:'Pauta',denuncia:'Denúncia',opiniao:'Opinião'};
const STATUSES={novo:'Novo',em_analise:'Em análise',em_apuracao:'Em apuração',aprovado:'Aprovado',arquivado:'Arquivado'};
const statusOptions=Object.keys(STATUSES);
const formatDate=v=>new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const slugify=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export default function Participacoes(){
 const router=useRouter(),[loading,setLoading]=useState(true),[items,setItems]=useState([]),[user,setUser]=useState(null),[selected,setSelected]=useState(null),[query,setQuery]=useState(''),[filter,setFilter]=useState('all'),[status,setStatus]=useState('all'),[saving,setSaving]=useState(false),[creating,setCreating]=useState(false);
 useEffect(()=>{boot()},[]);
 async function boot(){setLoading(true);const s=createClient(),{data:{user}}=await s.auth.getUser();if(!user){router.replace('/admin/login');return}setUser(user);const {data,error}=await s.from('participations').select('*').order('created_at',{ascending:false});if(error){setItems([])}else setItems(data||[]);setLoading(false)}
 async function logout(){await createClient().auth.signOut();router.replace('/admin/login')}
 async function updateStatus(value){if(!selected)return;setSaving(true);const {error}=await createClient().from('participations').update({status:value}).eq('id',selected.id);setSaving(false);if(error)return alert(error.message);const next={...selected,status:value};setSelected(next);setItems(list=>list.map(x=>x.id===next.id?next:x));}
 async function openAttachment(file){const {data,error}=await createClient().storage.from('brio-participacoes').createSignedUrl(file.path,120);if(error)return alert('Não foi possível abrir o anexo.');window.open(data.signedUrl,'_blank','noopener,noreferrer')}
 async function createDraft(){
   if(!selected)return;
   if(selected.generated_post_id){router.push('/admin/editor/'+selected.generated_post_id);return;}
   setCreating(true);
   const s=createClient();
   try{
     const {data:existing}=await s.from('posts').select('id').eq('participation_id',selected.id).maybeSingle();
     if(existing?.id){await s.from('participations').update({generated_post_id:existing.id}).eq('id',selected.id);router.push('/admin/editor/'+existing.id);return;}
     const categorySlug=selected.type==='opiniao'?'opiniao':'brasil';
     const {data:cat,error:catError}=await s.from('categories').select('id').eq('slug',categorySlug).single();
     if(catError||!cat?.id)throw new Error('Não encontrei a editoria para criar o rascunho.');
     const {data:{user}}=await s.auth.getUser();
     if(!user)throw new Error('Sua sessão expirou. Entre novamente no admin.');
     const plainMessage=(selected.message||'').replace(/\s+/g,' ').trim();
     const excerpt=`${selected.city?selected.city+' — ':''}${plainMessage}`.slice(0,240);
     const identity=selected.anonymous?'Fonte anônima':(selected.name||'Remetente não informado');
     const content=`${selected.message}\n\n---\nMATERIAL DE ORIGEM — PARTICIPAÇÃO BRIO\nTipo: ${LABELS[selected.type]}\nRemetente: ${identity}\nLocalidade: ${selected.city||'Não informada'}\nRecebido em: ${formatDate(selected.created_at)}\n\nEdite e apure as informações acima antes da publicação.`;
     const payload={title:selected.subject.trim(),slug:slugify(selected.subject)+'-'+Date.now().toString().slice(-5),excerpt,content,category_id:cat.id,author_id:user.id,status:'draft',featured:false,participation_id:selected.id};
     const {data:post,error}=await s.from('posts').insert(payload).select('id').single();
     if(error)throw error;
     const {error:linkError}=await s.from('participations').update({generated_post_id:post.id}).eq('id',selected.id);
     if(linkError)throw linkError;
     router.push('/admin/editor/'+post.id);
   }catch(error){
     alert(error?.message?.includes('participation_id')||error?.message?.includes('generated_post_id')?'A atualização do banco ainda precisa ser aplicada. Use a migration 004.':(error?.message||'Não foi possível criar o rascunho.'));
   }finally{setCreating(false);}
 }
 const shown=useMemo(()=>items.filter(x=>(filter==='all'||x.type===filter)&&(status==='all'||x.status===status)&&`${x.name||''} ${x.subject||''} ${x.city||''} ${x.message||''}`.toLowerCase().includes(query.toLowerCase())),[items,filter,status,query]);
 const counts={total:items.length,new:items.filter(x=>x.status==='novo').length,denuncia:items.filter(x=>x.type==='denuncia').length,active:items.filter(x=>['em_analise','em_apuracao'].includes(x.status)).length};
 if(loading)return <div className="adminLoading"><div className="adminLoadingLogo">BRIO<span>.</span></div><p>Carregando participações...</p></div>;
 return <div className="participationAdmin"><aside className="participationSide"><div className="adminBrand"><div>BRIO<span>.</span></div><small>CENTRAL DE CONTEÚDO</small></div><Link href="/admin" className="participationBack"><ArrowLeft/> Central editorial</Link><nav><span>PARTICIPAÇÕES</span><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}><Inbox/>Todas</button><button className={filter==='pauta'?'active':''} onClick={()=>setFilter('pauta')}><FileText/>Pautas</button><button className={filter==='denuncia'?'active':''} onClick={()=>setFilter('denuncia')}><ShieldAlert/>Denúncias</button><button className={filter==='opiniao'?'active':''} onClick={()=>setFilter('opiniao')}><MessageCircle/>Opiniões</button></nav><div className="adminSideBottom"><a href="/" target="_blank"><ExternalLink/> Abrir portal</a><button onClick={logout}><LogOut/> Sair</button></div></aside><main className="participationMain"><header className="participationTop"><div><span>BRIO · COMUNIDADE</span><h1>Participações</h1><p>Pautas, denúncias e opiniões enviadas pelo público.</p></div><div className="adminProfile"><div><b>{user?.email?.split('@')[0]}</b><span>Equipe BRIO</span></div><i>{(user?.email||'BR').slice(0,2).toUpperCase()}</i></div></header><section className="participationStats"><div><span>NOVAS</span><strong>{counts.new}</strong><small>aguardando leitura</small></div><div><span>EM TRATAMENTO</span><strong>{counts.active}</strong><small>análise ou apuração</small></div><div><span>DENÚNCIAS</span><strong>{counts.denuncia}</strong><small>recebidas</small></div><div><span>TOTAL</span><strong>{counts.total}</strong><small>participações</small></div></section><section className="participationPanel"><div className="participationTools"><div className="participationSearch"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por assunto, nome ou cidade"/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Todos os status</option>{statusOptions.map(x=><option value={x} key={x}>{STATUSES[x]}</option>)}</select></div><div className="participationList">{shown.length?shown.map(item=><button key={item.id} className={'participationRow '+(selected?.id===item.id?'selected':'')} onClick={()=>setSelected(item)}><div className={'participationType '+item.type}>{item.type==='denuncia'?<ShieldAlert/>:item.type==='opiniao'?<MessageCircle/>:<FileText/>}</div><div className="participationInfo"><div><span>{LABELS[item.type]}</span>{item.anonymous&&<small>ANÔNIMO</small>}{item.generated_post_id&&<small className="hasDraft">RASCUNHO</small>}</div><h3>{item.subject}</h3><p>{item.anonymous?'Remetente anônimo':item.name||'Sem nome'}{item.city?' · '+item.city:''}</p></div><div className="participationMeta"><span className={'participationStatus '+item.status}>{STATUSES[item.status]||item.status}</span><small>{formatDate(item.created_at)}</small></div></button>):<div className="participationEmpty"><Inbox/><h3>Nenhuma participação encontrada</h3><p>Os envios do público aparecerão aqui.</p></div>}</div></section></main>{selected&&<aside className="participationDrawer"><button className="participationDrawerClose" onClick={()=>setSelected(null)}>×</button><div className="participationDrawerHead"><span>{LABELS[selected.type]}</span><h2>{selected.subject}</h2><p>{formatDate(selected.created_at)}</p></div><div className="participationIdentity"><div><small>REMETENTE</small><strong>{selected.anonymous?'Anônimo':selected.name||'Não informado'}</strong>{!selected.anonymous&&selected.contact&&<a href={selected.contact.includes('@')?'mailto:'+selected.contact:'https://wa.me/'+selected.contact.replace(/\D/g,'')} target="_blank">{selected.contact}</a>}</div><div><small>LOCALIDADE</small><strong>{selected.city||'Não informada'}</strong></div></div><div className="participationMessage"><small>MENSAGEM</small><p>{selected.message}</p></div>{selected.attachments?.length>0&&<div className="participationAttachments"><small>ANEXOS</small>{selected.attachments.map((file,i)=><button key={file.path||i} onClick={()=>openAttachment(file)}><FileText/><span>{file.name}</span><ExternalLink/></button>)}</div>}<div className="participationWorkflow"><small>STATUS EDITORIAL</small><select value={selected.status} disabled={saving} onChange={e=>updateStatus(e.target.value)}>{statusOptions.map(x=><option value={x} key={x}>{STATUSES[x]}</option>)}</select><div className="participationStatusHelp">{selected.status==='novo'?<><Clock3/>Ainda não analisado</>:selected.status==='aprovado'?<><CheckCircle2/>Aprovado pela redação</>:selected.status==='arquivado'?<><Archive/>Encerrado</>:<><Clock3/>Em tratamento pela equipe</>}</div></div>{selected.generated_post_id?<button className="participationDraftAction created" onClick={()=>router.push('/admin/editor/'+selected.generated_post_id)}><PenLine/><span><b>Abrir rascunho</b><small>Esta participação já virou matéria.</small></span><strong>→</strong></button>:selected.status==='aprovado'?<button className="participationDraftAction" disabled={creating} onClick={createDraft}><FilePlus2/><span><b>{creating?'Criando rascunho...':'Transformar em matéria'}</b><small>Cria um rascunho no editor com o relato original.</small></span><strong>→</strong></button>:<div className="participationDraftHint"><FilePlus2/><span>A opção de transformar em matéria aparece quando a participação for <b>Aprovada</b>.</span></div>}</aside>}</div>;
}
