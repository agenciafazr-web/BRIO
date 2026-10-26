import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { posts, categories } from '../../../lib/posts';

const slugify=(value)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export function generateStaticParams(){return categories.map(category=>({slug:slugify(category)}));}

export default async function EditoriaPage({params}){
  const {slug}=await params;
  const category=categories.find(item=>slugify(item)===slug);
  if(!category)return notFound();
  const own=posts.filter(post=>post.category===category);
  const fallback=posts.filter(post=>post.category!==category);
  const lead=own[0]||fallback[0];
  const list=[...own.slice(1),...fallback].filter((post,index,array)=>array.findIndex(x=>x.id===post.id)===index).slice(0,6);
  return <><Header/><main className="categoryPage">
    <section className="categoryHero"><div className="container"><span className="signal">EDITORIA</span><h1>{category}</h1><p>O que está acontecendo, o contexto por trás e por que isso importa para quem vive o Brasil real.</p></div></section>
    <section className="container categoryLead"><Link href={'/noticia/'+lead.slug} className="categoryLeadVisual" style={{backgroundImage:`linear-gradient(180deg,rgba(7,17,31,.05),rgba(7,17,31,.86)),url(${lead.image})`}}><span>{lead.category}</span><div><h2>{lead.title}</h2><p>{lead.excerpt}</p><b>ENTENDER AGORA →</b></div></Link><aside><span className="categoryKicker">NO SEU RADAR</span><h3>Mais do que manchetes.</h3><p>A BRIO organiza o assunto para você entender o fato, o impacto e o que acompanhar daqui para frente.</p><div className="categoryTags"><span>#Contexto</span><span>#BrasilReal</span><span>#SemEnrolação</span></div></aside></section>
    <section className="container categoryFeed"><div className="sectionHead"><div><span>ÚLTIMAS</span><h2>Continue no assunto.</h2></div><p>Informação direta, contexto e leitura rápida.</p></div><div className="categoryGrid">{list.map(post=><Link href={'/noticia/'+post.slug} className="categoryCard" key={post.id}><div className="categoryCardImage" style={{backgroundImage:`url(${post.image})`}}/><div><span>{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><b>LER →</b></div></Link>)}</div></section>
    <section className="container categoryExplain"><div><span>BRIO EXPLICA</span><h2>Não basta saber que aconteceu.</h2><p>A gente conecta os pontos para mostrar o que muda na sua vida e o que merece atenção.</p></div><Link href={'/noticia/'+lead.slug}>ENTENDER O DESTAQUE ↗</Link></section>
  </main><Footer/></>;
}
