'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Menu, ArrowUpRight, X, ArrowRight } from 'lucide-react';
import { posts } from '../lib/posts';

const nav=['Brasil','Política','Economia','Segurança','Mundo','Sociedade','Opinião'];
const slugify=(value)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const normalize=(value)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export default function Header(){
  const [menuOpen,setMenuOpen]=useState(false);
  const [searchOpen,setSearchOpen]=useState(false);
  const [query,setQuery]=useState('');
  const inputRef=useRef(null);
  useEffect(()=>{document.body.style.overflow=(menuOpen||searchOpen)?'hidden':'';return()=>{document.body.style.overflow=''}},[menuOpen,searchOpen]);
  useEffect(()=>{if(searchOpen)setTimeout(()=>inputRef.current?.focus(),80)},[searchOpen]);
  useEffect(()=>{const key=(e)=>{if(e.key==='Escape'){setMenuOpen(false);setSearchOpen(false)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
  const results=useMemo(()=>{const q=normalize(query.trim());if(!q)return posts.slice(0,6);return posts.filter(post=>normalize(`${post.title} ${post.excerpt||''} ${post.category||''}`).includes(q)).slice(0,9)},[query]);
  const closeAll=()=>{setMenuOpen(false);setSearchOpen(false)};
  return <>
    <header className="brioHeader">
      <div className="container headerBar">
        <Link href="/" className="logo headerLogo" aria-label="BRIO Brasil — Capa">BRIO<span>.</span><small>BRASIL</small></Link>
        <nav className="desktopNav" aria-label="Editorias principais">{nav.map(x=><Link key={x} href={'/editoria/'+slugify(x)}>{x}</Link>)}</nav>
        <div className="headerActions">
          <button className="icon headerSearch" aria-label="Buscar" onClick={()=>setSearchOpen(true)}><Search size={18}/></button>
          <Link href="/#comunidade" className="member">FAÇA PARTE <ArrowUpRight size={13}/></Link>
          <button className="icon mobileMenuTrigger" aria-label="Abrir menu" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button>
        </div>
      </div>
    </header>

    <div className={`menuBackdrop ${menuOpen?'open':''}`} onClick={()=>setMenuOpen(false)}/>
    <aside className={`mobileMenu ${menuOpen?'open':''}`} aria-hidden={!menuOpen}><div className="mobileMenuHead"><Link href="/" className="mobileMenuLogo" onClick={closeAll}>BRIO<span>.</span></Link><button className="mobileClose" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}><X size={19}/></button></div><span className="mobileMenuLabel">EXPLORE O BRASIL COM CONTEXTO</span><div className="mobileLinks"><Link href="/" onClick={closeAll}>Capa</Link>{nav.map(x=><Link key={x} href={'/editoria/'+slugify(x)} onClick={closeAll}>{x}</Link>)}</div><Link className="mobileJoin" href="/#comunidade" onClick={closeAll}>FAÇA PARTE DO BRIO ↗</Link></aside>

    <section className={`searchOverlay ${searchOpen?'open':''}`} aria-hidden={!searchOpen}><div className="searchTop"><div className="container searchTopInner"><div className="searchBrand">BRIO<span>.</span></div><span/><button className="searchClose" aria-label="Fechar busca" onClick={()=>setSearchOpen(false)}><X size={20}/></button></div></div><div className="container searchBody"><span className="searchEyebrow">BUSCA BRIO</span><div className="searchForm"><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="O que você quer entender?" aria-label="Buscar notícias"/><button aria-label="Buscar"><ArrowRight size={20}/></button></div><p className="searchHint">Busque por assunto, editoria ou palavra-chave. Sem caça-clique: encontre o contexto.</p>{results.length?<div className="searchResults">{results.map(post=><Link key={post.id} href={'/noticia/'+post.slug} className="searchResult" onClick={closeAll}><span>{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p></Link>)}</div>:<div className="searchEmpty"><b>Nada encontrado.</b><span>Tente outra palavra ou procure por uma editoria.</span></div>}</div></section>
  </>;
}
