import './globals.css';
import './home-premium.css';
import './home-newshero.css';
import './citizen.css';
import './citizen-executive.css';
import './editoria/editoria.css';
import './admin/ads-admin.css';
import './admin/ad-formats.css';
import '../components/header-interactive.css';
import '../components/ads.css';
export const metadata={title:'BRIO Brasil — Informação com coragem',description:'Notícias, contexto e opinião para quem quer entender e participar do Brasil.'};
export default function RootLayout({children}){return <html lang="pt-BR"><body>{children}</body></html>}
