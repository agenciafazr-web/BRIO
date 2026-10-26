export default function AdSlot({ad,className='',placement=''}){
 if(!ad)return <aside className={'brioAd brioAdEmpty '+className} aria-label="Espaço publicitário disponível"><div className="brioAdEmptyInner"><span>PUBLICIDADE</span><div><b>Anuncie aqui</b><small>Leve sua marca para quem acompanha o BRIO.</small></div><em>ESPAÇO DISPONÍVEL</em></div></aside>;
 const creative=<picture>{ad.mobile_image_url&&<source media="(max-width: 700px)" srcSet={ad.mobile_image_url}/>}<img src={ad.image_url} alt={ad.alt_text||`Publicidade de ${ad.advertiser}`}/></picture>;
 return <aside className={'brioAd '+className} aria-label="Publicidade"><div className="brioAdLabel"><span>PUBLICIDADE</span><small>{ad.advertiser}</small></div>{ad.target_url?<a href={ad.target_url} target="_blank" rel="sponsored noopener noreferrer">{creative}</a>:creative}</aside>;
}
