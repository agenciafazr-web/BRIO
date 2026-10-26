import Link from 'next/link';
import {notFound} from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import {posts} from '../../../lib/posts';
import './article-premium.css';

export default async function Article({params}){
 const {slug}=await params;
 const p=posts.find(x=>x.slug===slug);
 if(!p)return notFound();
 const related=posts.filter(x=>x.slug!==slug).slice(0,3);
 return <><Header/><main className="storyPage">
  <article>
   <header className="storyHero container">
    <div className="storyKicker"><span>{p.category}</span><i/> <small>BRIO AGORA</small></div>
    <h1>{p.title}</h1>
    <p className="storyDeck">{p.excerpt}</p>
    <div className="storyMeta"><div className="authorMark">B.</div><div><b>{p.author}</b><span>{p.publishedAt} · 4 min de leitura</span></div><div className="storyShare"><button aria-label="Compartilhar matéria">↗ Compartilhar</button><button aria-label="Salvar matéria">＋ Salvar</button></div></div>
   </header>

   <div className="storyCover container"><img src={p.image} alt={p.imageAlt||p.title}/><span>{p.category} / BRIO Brasil</span></div>

   <div className="storyLayout container">
    <aside className="storyRail"><span>NESTA MATÉRIA</span><a href="#resumo">Resumo</a><a href="#contexto">Contexto</a><a href="#importa">Por que importa</a><a href="#agora">E agora?</a></aside>
    <div className="storyBody">
     <p className="storyLead">A notícia informa o que aconteceu. O BRIO quer ir um passo além: organizar os fatos, mostrar o contexto e deixar claro o que realmente merece sua atenção.</p>
     <section className="brioSummary" id="resumo"><span>BRIO EM 30 SEGUNDOS</span><h2>O que você precisa saber</h2><ul><li>O fato principal, sem rodeios e sem transformar informação em espetáculo.</li><li>O contexto necessário para entender como esse assunto chegou até aqui.</li><li>Os efeitos que podem chegar à vida real do brasileiro.</li></ul></section>
     <section id="contexto"><span className="bodyLabel">O CONTEXTO</span><h2>O fato é só o começo.</h2><p>Uma boa cobertura não termina na manchete. Decisões públicas, movimentos econômicos e acontecimentos sociais quase sempre fazem parte de uma história maior. É essa conexão que ajuda o leitor a formar sua própria visão.</p><p>Por isso, as matérias do BRIO são construídas para separar fato, contexto e interpretação. Quando houver opinião, ela deve aparecer identificada como opinião — não disfarçada de notícia.</p></section>
     <blockquote>“Informação sem contexto vira barulho. Contexto transforma notícia em entendimento.”<small>— Princípio editorial BRIO</small></blockquote>
     <section className="whyBox" id="importa"><span>POR QUE ISSO IMPORTA?</span><h2>Porque a notícia precisa chegar à vida real.</h2><p>O objetivo deste bloco é responder à pergunta que muita cobertura deixa de fazer: o que muda para quem está lendo? Aqui entram consequências práticas, impactos possíveis e os pontos que merecem acompanhamento.</p></section>
     <section id="agora"><span className="bodyLabel">E AGORA?</span><h2>O que vale acompanhar daqui para frente</h2><p>Novos fatos podem mudar o cenário. O BRIO acompanha os próximos movimentos e atualiza a cobertura quando houver informação relevante — sem fabricar urgência onde ela não existe.</p></section>
     <div className="storyTags"><span>#BRIOBrasil</span><span>#{p.category.replace('í','i').replace('ç','c')}</span><span>#BrasilReal</span></div>
    </div>
   </div>
  </article>

  <section className="related container"><div className="relatedHead"><div><span>CONTINUE NO BRIO</span><h2>Mais para entender o agora.</h2></div><Link href="/">Ver capa →</Link></div><div className="relatedGrid">{related.map(r=><Link href={'/noticia/'+r.slug} className="relatedCard" key={r.id}><div><img src={r.image} alt={r.imageAlt||r.title}/><span>{r.category}</span></div><h3>{r.title}</h3><p>{r.excerpt}</p><b>LER AGORA →</b></Link>)}</div></section>
 </main><Footer/></>;
}
