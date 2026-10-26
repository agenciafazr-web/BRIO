import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { posts } from '../lib/posts';

export default function Home(){
  const lead=posts[0];
  const secondary=posts.slice(1,3);
  const latest=posts.slice(3);
  return <>
    <Header/>
    <main className="home">
      <section className="homehero container">
        <Link className={'homelead '+lead.tone} href={'/noticia/'+lead.slug}>
          <div className="homeleadcopy">
            <span className="pill">{lead.category}</span>
            <h1>{lead.title}</h1>
            <p>{lead.excerpt}</p>
            <small>{lead.author} · {lead.publishedAt}</small>
          </div>
        </Link>
        <div className="herorail">
          {secondary.map((p,i)=><Link href={'/noticia/'+p.slug} className="railstory" key={p.id}>
            <div className={'railimage '+p.tone}><span>0{i+2}</span></div>
            <div><span className="eyebrow">{p.category}</span><h2>{p.title}</h2><small>{p.publishedAt}</small></div>
          </Link>)}
        </div>
      </section>

      <section className="quick container">
        <div className="quicklabel"><i/> AGORA</div>
        <div className="quickitems"><span>Política sem enrolação</span><span>Economia no seu bolso</span><span>Segurança além da manchete</span><span>O mundo e o impacto no Brasil</span></div>
      </section>

      <section className="fresh container">
        <div className="cleanhead"><div><span>ÚLTIMAS</span><h2>O que você precisa saber</h2></div><Link href="/">Ver tudo</Link></div>
        <div className="freshgrid">
          {latest.map((p,i)=><Link className="freshcard" href={'/noticia/'+p.slug} key={p.id}>
            <div className={'freshimage '+p.tone}><b>0{i+1}</b></div>
            <span className="eyebrow">{p.category}</span>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <small>{p.publishedAt}</small>
          </Link>)}
        </div>
      </section>

      <section className="perspective">
        <div className="container perspectivegrid">
          <div className="perspectiveintro"><span>BRIO / IDEIAS</span><h2>Notícia é fato.<br/>Opinião tem assinatura.</h2><p>Um espaço para entender o debate sem esconder de onde cada argumento parte.</p></div>
          <Link href="/" className="ideacard"><span>EDITORIAL</span><h3>Informação rápida não precisa ser informação rasa.</h3><p>Direto ao ponto, com contexto, fonte e responsabilidade.</p><b>Ler opinião →</b></Link>
          <Link href="/" className="ideacard light"><span>ANÁLISE</span><h3>Menos torcida.<br/>Mais contexto.</h3><p>Elementos para você formar a sua própria opinião.</p><b>Ler análise →</b></Link>
        </div>
      </section>

      <section className="brandstatement container"><span>BRIO É</span><h2>Coragem para perguntar.<br/><em>Responsabilidade para informar.</em></h2><p>Um portal brasileiro, jovem e direto — para quem quer entender antes de repetir.</p></section>
    </main>
    <Footer/>
  </>
}
