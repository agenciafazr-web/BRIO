import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { posts } from '../lib/posts';

function EditorialImage({post,className=''}){
 return <div className={'editorialImage '+className}><img src={post.image} alt={post.imageAlt||post.title}/><span className="imageShade"/></div>;
}

export default function Home(){
 const lead=posts[0], side=posts.slice(1,3), cards=posts.slice(1,4);
 return <><Header/><main className="brioHome">
  <section className="manifesto"><div className="container manifestoGrid"><div className="manifestoMain"><span className="signal">BRIO BRASIL · INFORMAÇÃO COM ATITUDE</span><h1>O Brasil não precisa de mais plateia.<br/><strong>Precisa recuperar seu BRIO.</strong></h1><p className="manifestoDeck">Para quem quer entender o país sem viver preso ao barulho da timeline.</p><a className="manifestoCta" href="#agora">ENTENDER O AGORA <b>↓</b></a></div><div className="manifestoAside"><b className="edition">EDIÇÃO 001 · 26 OUT 2026</b><p>Informação, contexto e opinião para quem não quer apenas assistir ao país de longe.</p><div><span>#BrasilReal</span><span>#SemEnrolação</span><span>#GentePresente</span></div></div></div></section>

  <section className="container spotlight" id="agora"><Link className="spotLead" href={'/noticia/'+lead.slug}><EditorialImage post={lead}/><div className="spotCopy"><span>AGORA NO BRIO · {lead.category}</span><h2>{lead.title}</h2><p>{lead.excerpt}</p><b>ENTENDER O QUE ESTÁ ACONTECENDO →</b></div><div className="spotNumber">01</div></Link><aside>{side.map((p,i)=><Link className="spotSide" href={'/noticia/'+p.slug} key={p.id}><EditorialImage post={p} className="spotThumb"/><div><span>{p.category}</span><h3>{p.title}</h3><small>{p.publishedAt} · BRIO Brasil</small></div><i className="cardArrow">↗</i></Link>)}</aside></section>

  <section className="container pulse"><b><i/> BRIO AGORA</b><div><span>O que está movimentando a conversa</span><a>#Política</a><a>#Economia</a><a>#Segurança</a><a>#Brasil</a><a>#Mundo</a></div></section>

  <section className="container feed"><div className="sectionHead"><div><span>NO SEU RADAR</span><h2>O que importa. Sem ruído.</h2></div><p>Notícia para entender.<br/>Contexto para formar opinião.</p></div><div className="feedGrid">{cards.map((p,i)=><Link className="feedCard" href={'/noticia/'+p.slug} key={p.id}><EditorialImage post={p} className="feedVisual"/><div className="feedIndex">0{i+1}</div><div className="feedMeta">{p.category}</div><h3>{p.title}</h3><p>{p.excerpt}</p><b>ENTENDER <span>↗</span></b></Link>)}</div></section>

  <section className="community"><div className="container communityGrid"><div className="bigB">B<span>.</span></div><div><span className="signal lightSignal">ISSO É BRIO</span><h2>Você não é só audiência.<br/><strong>Você faz parte do Brasil.</strong></h2><p>O BRIO nasce para reunir quem lê, questiona, conversa, compartilha e ainda acredita que participar importa.</p><div className="communityTags"><span>LER</span><i>→</i><span>ENTENDER</span><i>→</i><span>QUESTIONAR</span><i>→</i><span>PARTICIPAR</span></div></div><a className="join" href="#formatos"><span>O MOVIMENTO COMEÇA AQUI</span><b>Descubra o jeito BRIO ↘</b></a></div></section>

  <section className="container formats" id="formatos"><div className="formatIntro"><span>UM JEITO DIFERENTE DE FALAR DO BRASIL</span><h2>Menos bancada.<br/>Mais conversa.</h2><p>Conteúdo com personalidade, clareza e posição identificada.</p></div><Link href={'/noticia/'+lead.slug} className="formatCard explain"><span>01 / BRIO EXPLICA</span><h3>O assunto que todo mundo comenta, explicado sem complicação.</h3><p>O fato, o contexto e por que aquilo realmente importa para você.</p><b>QUERO ENTENDER →</b></Link><Link href="/?editoria=Opinião" className="formatCard real"><span>02 / NA REAL</span><h3>Opinião não precisa parecer discurso de gabinete.</h3><p>Argumento, posição clara e espaço para quem pensa diferente.</p><b>ENTRAR NA CONVERSA →</b></Link></section>

  <section className="container finalCall"><span>BRIO BRASIL · INFORMAÇÃO + CONTEXTO + ATITUDE</span><h2>Menos espectador.<br/><strong>Mais brasileiro presente.</strong></h2><p>Porque notícia é só o começo. O Brasil precisa recuperar seu BRIO.</p><a href="#agora">VOLTAR AO QUE IMPORTA ↑</a></section>
 </main><Footer/></>;
}
