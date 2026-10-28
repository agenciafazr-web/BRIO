import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSlot from '../components/AdSlot';
import CitizenFinder from '../components/CitizenFinder';
import VoiceBrio from '../components/VoiceBrio';
import {posts as mockPosts} from '../lib/posts';
import {getPublishedPosts,getActiveAds} from '../lib/supabase/public';

function EditorialImage({post,className=''}){return <div className={'editorialImage '+className}>{post.image?<img src={post.image} alt={post.imageAlt||post.title}/>:<div className="imageFallback">BRIO<span>.</span></div>}<span className="imageShade"/></div>}
function HeroVisual({post}){return <div className="newsHeroVisual">{post.image?<img className="newsHeroPoster" src={post.image} alt={post.imageAlt||post.title}/>:<div className="imageFallback">BRIO<span>.</span></div>}<span className="newsHeroVisualShade"/><span className="newsHeroVisualTag">01 · DESTAQUE</span></div>}
export const revalidate=60;
export default async function Home(){
 const [live,ads]=await Promise.all([getPublishedPosts(),getActiveAds()]);const posts=live.length?live:mockPosts;const lead=posts.find(p=>p.featured)||posts[0],rest=posts.filter(p=>p.id!==lead.id),highlights=rest.slice(0,3),cards=rest.length>=6?rest.slice(3,6):rest.slice(0,3);const ad=placement=>ads.find(x=>x.placement===placement);
 return <><Header/><main className="brioHome">
 <section className="newsHero" id="agora"><div className="container newsHeroInner"><div className="newsHeroTop"><div><i/> BRIO AGORA</div><span>O QUE ESTÁ EM PAUTA</span></div><Link className="newsHeroFeature" href={'/noticia/'+lead.slug}><div className="newsHeroCopy"><div className="newsHeroKicker"><span>{lead.category}</span><small>{lead.publishedAt||'Agora'}</small></div><h1>{lead.title}</h1><p>{lead.excerpt}</p><div className="newsHeroAction"><span>LER REPORTAGEM</span><b>↗</b></div></div><HeroVisual post={lead}/></Link><div className="newsHeroStrip"><div className="newsHeroStripHead"><span>EM DESTAQUE</span><small>Mais assuntos do BRIO agora</small></div>{highlights.map((p,i)=><Link className="newsHeroStripItem" href={'/noticia/'+p.slug} key={p.id}><span className="newsHeroIndex">0{i+2}</span><div><small>{p.category}</small><h3>{p.title}</h3></div><b>↗</b></Link>)}</div></div></section>
 <AdSlot ad={ad('home_feature')} className="adFeature container"/>
 <section className="container feed"><div className="sectionHead"><div><span>NO SEU RADAR</span><h2>O que importa. Sem ruído.</h2></div><p>Notícia para entender.<br/>Contexto para formar opinião.</p></div><div className="feedGrid">{cards.map((p,i)=><Link className="feedCard" href={'/noticia/'+p.slug} key={p.id}><EditorialImage post={p} className="feedVisual"/><div className="feedIndex">0{i+1}</div><div className="feedMeta">{p.category}</div><h3>{p.title}</h3><p>{p.excerpt}</p><b>ENTENDER <span>↗</span></b></Link>)}</div></section>
 <AdSlot ad={ad('home_feed')} className="adFeed container"/>
 <CitizenFinder/>
 <AdSlot ad={ad('top')} className="adTop container"/>
 <VoiceBrio/>
 <section className="container finalCall"><span>BRIO BRASIL · INFORMAÇÃO + CONTEXTO + ATITUDE</span><h2>Menos espectador.<br/><strong>Mais brasileiro presente.</strong></h2><p>Porque notícia é só o começo. O Brasil precisa recuperar seu BRIO.</p><a href="#agora">VOLTAR AO QUE IMPORTA ↑</a></section></main><Footer/></>;
}
