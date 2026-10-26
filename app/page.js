import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { posts } from '../lib/posts';

export default function Home(){
 const lead=posts[0], side=posts.slice(1,3), cards=posts.slice(1);
 return <><Header/><main className="brioHome">
  <section className="manifesto"><div className="container manifestoGrid"><div><span className="signal">BRIO É ATITUDE</span><h1>O Brasil não precisa de mais plateia.<br/><strong>Precisa de gente presente.</strong></h1></div><div className="manifestoAside"><p>Informação, contexto e opinião para quem ainda se importa com o rumo do país.</p><div><span>#Brasil</span><span>#SemEnrolação</span><span>#FaçaParte</span></div></div></div></section>
  <section className="container spotlight"><Link className={'spotLead '+lead.tone} href={'/noticia/'+lead.slug}><div className="spotCopy"><span>{lead.category}</span><h2>{lead.title}</h2><p>{lead.excerpt}</p><b>ENTENDER AGORA →</b></div></Link><aside>{side.map((p,i)=><Link className="spotSide" href={'/noticia/'+p.slug} key={p.id}><div className={'spotThumb '+p.tone}><i>0{i+2}</i></div><div><span>{p.category}</span><h3>{p.title}</h3><small>{p.publishedAt}</small></div></Link>)}</aside></section>
  <section className="container pulse"><b><i/> BRIO AGORA</b><div><span>O que está movimentando a conversa</span><a>#Política</a><a>#Economia</a><a>#Segurança</a><a>#Mundo</a></div></section>
  <section className="container feed"><div className="sectionHead"><div><span>NO SEU RADAR</span><h2>Entenda o agora.</h2></div><p>Sem linguagem engessada.<br/>Sem notícia pela metade.</p></div><div className="feedGrid">{cards.slice(0,3).map((p,i)=><Link className="feedCard" href={'/noticia/'+p.slug} key={p.id}><div className={'feedVisual '+p.tone}><span>0{i+1}</span></div><div className="feedMeta">{p.category}</div><h3>{p.title}</h3><p>{p.excerpt}</p><b>LER →</b></Link>)}</div></section>
  <section className="community"><div className="container communityGrid"><div className="bigB">B<span>.</span></div><div><span className="signal lightSignal">ISSO É BRIO</span><h2>Não queremos só audiência.<br/><strong>Queremos pertencimento.</strong></h2><p>Gente que acompanha, questiona, participa e não aceita assistir o Brasil de braços cruzados.</p></div><Link className="join" href="/"><span>VOCÊ FAZ PARTE</span><b>Entrar no movimento ↗</b></Link></div></section>
  <section className="container formats"><div className="formatIntro"><span>CONTEÚDO COM PERSONALIDADE</span><h2>Menos bancada.<br/>Mais conversa.</h2><p>Formatos pensados para explicar, provocar e aproximar.</p></div><Link href="/" className="formatCard explain"><span>01 / BRIO EXPLICA</span><h3>O assunto do dia sem precisar de uma hora para entender.</h3><p>Contexto rápido, linguagem clara e o que realmente importa.</p><b>ENTENDER →</b></Link><Link href="/" className="formatCard real"><span>02 / NA REAL</span><h3>Tem coisa que precisa ser dita do jeito que a gente fala.</h3><p>Opinião identificada, argumento e espaço para discordar.</p><b>ENTRAR NA CONVERSA →</b></Link></section>
  <section className="container finalCall"><span>BRIO BRASIL</span><h2>Menos espectador.<br/><strong>Mais brasileiro presente.</strong></h2><p>Notícia é o começo. Pertencimento transforma informação em atitude.</p></section>
 </main><Footer/></>;
}
