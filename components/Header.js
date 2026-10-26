import Link from 'next/link';
import { Search, Menu, ArrowUpRight } from 'lucide-react';
const nav=['Brasil','Política','Economia','Segurança','Mundo','Sociedade','Opinião'];
export default function Header(){return <header className="brioHeader"><div className="container mast"><button className="icon"><Menu size={20}/></button><Link href="/" className="logo">BRIO<span>.</span><small>BRASIL</small></Link><div className="headerActions"><Link href="/" className="member">FAÇA PARTE <ArrowUpRight size={13}/></Link><button className="icon"><Search size={19}/></button></div></div><nav><div className="container navrow"><Link className="active" href="/">Capa</Link>{nav.map(x=><Link key={x} href={'/?editoria='+encodeURIComponent(x)}>{x}</Link>)}</div></nav></header>}
