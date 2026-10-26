export default function AdSlot({ad,className=''}){
 if(!ad)return null;
 const creative=<picture>{ad.mobile_image_url&&<source media="(max-width: 700px)" srcSet={ad.mobile_image_url}/>}<img src={ad.image_url} alt={ad.alt_text||`Publicidade de ${ad.advertiser}`}/></picture>;
 return <aside className={'brioAd '+className} aria-label="Publicidade"><div className="brioAdLabel"><span>PUBLICIDADE</span><small>{ad.advertiser}</small></div>{ad.target_url?<a href={ad.target_url} target="_blank" rel="sponsored noopener noreferrer">{creative}</a>:creative}</aside>;
}
