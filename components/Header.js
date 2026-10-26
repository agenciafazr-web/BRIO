import Link from 'next/link';
import { Search, Menu, ArrowUpRight } from 'lucide-react';
const nav=['Brasil','Política','Economia','Segurança','Mundo','Sociedade','Opinião'];
const slugify=(value)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export default function Header(){return <header className="brioHeader"><div className="container mast"><button className="icon" aria-label="Abrir menu"><Menu size={20}/></button><Link href="/" className="logo">BRIO<span>.</span><small>BRASIL</small></Link><div className="headerActions"><Link href="/" className="member">FAÇA PARTE <ArrowUpRight size={13}/></Link><button className="icon" aria-label="Buscar"><Search size={19}/></button></div></div><nav><div className="container navrow"><Link href="/">Capa</Link>{nav.map(x=><Link key={x} href={'/editoria/'+slugify(x)}>{x}</Link>)}</div></nav></header>}
