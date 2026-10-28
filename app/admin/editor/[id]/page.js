'use client';
import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import {ArrowLeft,Clock,Eye,Image as ImageIcon,Star,UploadCloud} from 'lucide-react';
import {createClient} from '../../../../lib/supabase/client';
import '../../admin.css';

const categories=['Brasil','Política','Economia','Segurança','Mundo','Sociedade','Opinião'];
const slugify=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export default function ParticipationEditor(){
 const {id}=useParams(),router=useRouter();
 const [loading,setLoading]=useState(true),[post,setPost]=useState(null),[form,setForm]=useState({title:'',excerpt:'',content:'',category:'Brasil',featured:false,cover_url:'',cover_alt:''}),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false),[msg,setMsg]=useState('');
 useEffect(()=>{boot()},[id]);
 async function boot(){
   setLoading(true);
   const s=createClient(),{data:{user}}=await s.auth.getUser();
   if(!user){router.replace('/admin/login');return;}
   const {data,error}=await s.from('posts').select('id,title,excerpt,content,cover_url,cover_alt,status,published_at,featured,participation_id,categories(name)').eq('id',id).single();
   if(error||!data){setMsg('Rascunho não encontrado.');setLoading(false);return;}
   setPost(data);
   setForm({title:data.title||'',excerpt:data.excerpt||'',content:data.content||'',category:data.categories?.name||'Brasil',featured:!!data.featured,cover_url:data.cover_url||'',cover_alt:data.cover_alt||''});
   setLoading(false);
 }
 async function uploadCover(file){if(!file)return;setUploading(true);const s=createClient(),ext=file.name.split('.').pop(),path='capas/'+Date.now()+'.'+ext,{error}=await s.storage.from('brio-media').upload(path,file);if(error){setMsg(error.message);setUploading(false);return}const {data}=s.storage.from('brio-media').getPublicUrl(path);setForm(f=>({...f,cover_url:data.publicUrl}));setUploading(false)}
 async function save(status){
   if(!form.title.trim())return setMsg('Digite o título.');
   setSaving(true);setMsg('');
   const s=createClient(),{data:cat,error:catError}=await s.from('categories').select('id').eq('slug',slugify(form.category)).single();
   if(catError||!cat?.id){setMsg('Não foi possível localizar a editoria.');setSaving(false);return;}
   const payload={title:form.title.trim(),excerpt:form.excerpt,content:form.content,category_id:cat.id,status,featured:form.featured,cover_url:form.cover_url||null,cover_alt:form.cover_alt||form.title,published_at:status==='published'?(post?.published_at||new Date().toISOString()):null};
   const {error}=await s.from('posts').update(payload).eq('id',post.id);
   if(error){setMsg(error.message);setSaving(false);return;}
   router.push('/admin');
 }
 if(loading)return <div className="adminLoading"><div className="adminLoadingLogo">BRIO<span>.</span></div><p>Abrindo rascunho...</p></div>;
 if(!post)return <div className="adminLoading"><div className="adminLoadingLogo">BRIO<span>.</span></div><p>{msg||'Rascunho não encontrado.'}</p><button onClick={()=>router.push('/admin/participacoes')}>Voltar</button></div>;
 const words=form.content.trim()?form.content.trim().split(/\s+/).length:0;
 return <div className="adminShell" style={{display:'block',minHeight:'100vh'}}><main className="adminMain" style={{margin:0,padding:'28px'}}><div className="editorWorkspace"><div className="editorTopbar"><button onClick={()=>router.push('/admin/participacoes')}><ArrowLeft/> Participações</button><div><span>RASCUNHO A PARTIR DA COMUNIDADE</span><small>{words} palavras · ~{Math.max(1,Math.ceil(words/220))} min</small></div></div>{post.participation_id&&<div style={{margin:'0 0 14px',padding:'12px 15px',borderRadius:12,background:'#e7f5ed',border:'1px solid #cfe8da',color:'#087b55',fontSize:10,fontWeight:800}}>Origem vinculada: participação enviada pela comunidade. Revise e apure o relato antes de publicar.</div>}<div className="editorGrid"><section className="editorCanvas"><div className="editorField"><label>EDITORIA</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div className="titleField"><textarea rows="2" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Escreva um título forte e direto"/></div><div className="deckField"><textarea rows="3" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Subtítulo"/></div><div className="bodyEditor"><div className="bodyToolbar"><b>CONTEÚDO</b></div><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows="20" placeholder="Comece a escrever aqui..."/></div>{msg&&<div className="editorMessage">{msg}</div>}</section><aside className="publishPanel"><div className="publishPanelHead"><span>PUBLICAÇÃO</span><h3>Pronto para ir ao ar?</h3></div><div className="coverBlock"><label>ARTE / CAPA</label><div className={'coverPreview '+(form.cover_url?'hasImage':'')}>{form.cover_url?<img src={form.cover_url} alt="Prévia"/>:<><ImageIcon/><b>Arte vertical</b><span>1080 × 1440 px</span></>}<label className="coverUpload"><UploadCloud/>{uploading?'Enviando...':'Enviar arte'}<input type="file" accept="image/*" onChange={e=>uploadCover(e.target.files?.[0])}/></label></div></div><div className="altField"><label>DESCRIÇÃO</label><input value={form.cover_alt} onChange={e=>setForm({...form,cover_alt:e.target.value})}/></div><label className="featuredToggle"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/><span><Star/><b>Destacar na capa</b></span></label><div className="publishActions"><button className="saveDraft" disabled={saving} onClick={()=>save('draft')}><Clock/>{saving?'Salvando...':'Salvar rascunho'}</button><button className="goLive" disabled={saving} onClick={()=>save('published')}><Eye/>Publicar agora</button></div></aside></div></div></main></div>;
}
