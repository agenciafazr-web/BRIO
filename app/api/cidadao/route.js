const UF_NAMES={
 AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'
};
const GOV_SECOND_ROUND=new Set(['AL','AM','BA','ES','MS','PB','PE','RO','RS','SC','SE','SP']);
const TSE_RESULTS='https://resultados.tse.jus.br/oficial/app/index.html';
const CHAMBER_URL='https://www.camara.leg.br/deputados/quem-sao';

const PA_DEPUTIES_2022=[
 ['AIRTON FALEIRO','PT'],['ANDREIA SIQUEIRA','MDB'],['ANTONIO DOIDO','MDB'],['CELSO SABINO','UNIÃO'],['DELEGADO CAVEIRA','PL'],['DELEGADO EDER MAURO','PL'],['DILVANDA FARO','PT'],['DRA ALESSANDRA HABER','MDB'],['ELCIONE','MDB'],['HENDERSON PINTO','MDB'],['JOAQUIM PASSARINHO','PL'],['JÚNIOR FERRARI','PSD'],['KENISTON','MDB'],['OLIVAL MARQUES','MDB'],['PRIANTE','MDB'],['RAIMUNDO SANTOS','PSD'],['RENILCE NICODEMOS','MDB']
].map(([name,party],i)=>({id:`pa-fallback-${i}`,name,party,uf:'PA',photo:'',url:CHAMBER_URL,fallback:true}));

function plain(value=''){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function resolveUf(value=''){
 const clean=plain(value).replace(/\./g,'');
 const byCode=Object.keys(UF_NAMES).find(uf=>uf.toLowerCase()===clean);
 if(byCode)return byCode;
 return Object.entries(UF_NAMES).find(([,name])=>plain(name)===clean)?.[0]||null;
}
function numberValue(value='0'){return Number(String(value).replace(/\D/g,''))||0;}
function partyFromCoalition(value=''){return String(value).split(' - ')[0].trim();}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function fetchJson(url,options={}){
 let lastError;
 for(let attempt=0;attempt<2;attempt++){
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),8000);
   try{
     const response=await fetch(url,{
       ...options,
       signal:controller.signal,
       headers:{
         Accept:'application/json,text/plain,*/*',
         'User-Agent':'BRIO-Brasil/1.0 (+https://brio-brasil.vercel.app)',
         ...(options.headers||{})
       }
     });
     if(!response.ok)throw new Error(`HTTP ${response.status}`);
     return await response.json();
   }catch(error){
     lastError=error;
     if(attempt===0)await sleep(250);
   }finally{clearTimeout(timeout);}
 }
 throw lastError||new Error('Fonte externa indisponível');
}
async function safeJson(url,options={}){try{return await fetchJson(url,options);}catch{return null;}}

async function resolveLocation(raw){
 const q=raw.trim();
 const digits=q.replace(/\D/g,'');
 if(digits.length===8&&/^[\d.\-\s]+$/.test(q)){
   const brasil=await safeJson(`https://brasilapi.com.br/api/cep/v1/${digits}`,{next:{revalidate:86400}});
   const via=brasil?null:await safeJson(`https://viacep.com.br/ws/${digits}/json/`,{next:{revalidate:86400}});
   const city=brasil?.city||via?.localidade;
   const uf=String(brasil?.state||via?.uf||'').toUpperCase();
   if(!city||!uf||via?.erro)throw new Error('Não consegui consultar esse CEP agora. Tente buscar por Cidade, UF.');
   return {city,uf};
 }
 const parts=q.split(',').map(x=>x.trim()).filter(Boolean);
 if(parts.length<2)throw new Error('Digite um CEP ou use o formato Cidade, UF.');
 const uf=resolveUf(parts.pop());
 const city=parts.join(', ').replace(/\s+/g,' ').trim();
 if(!uf)throw new Error('Estado não reconhecido. Use a sigla, por exemplo: Ananindeua, PA.');
 if(city.length<2)throw new Error('Informe o nome da cidade.');
 return {city,uf};
}

function currentExecutiveOverride(location){
 const city=plain(location.city);
 const result={mayor:null,governor:null};
 if(location.uf==='PA'){
   result.governor={
     id:'governador-pa-atual',name:'Hana Ghassan',party:'',uf:'PA',office:'GOVERNADORA',
     term:'Em exercício em 2026',elected:'Situação atual confirmada',photo:'',
     url:'https://www.agenciapara.com.br/noticia/79970/imagem-peregrina-de-nossa-senhora-de-nazare-visita-a-sede-do-governo-do-para',current:true
   };
   if(city==='ananindeua'){
     result.mayor={
       id:'prefeito-ananindeua-atual',name:'Dr. Hugo Atayde',party:'PSDB',uf:'PA',office:'PREFEITO',
       term:'Em exercício em 2026',elected:'Assumiu em 2026',photo:'',
       url:'https://ananindeua.pa.gov.br/orgao.asp?id_orgao=25',current:true
     };
   }
 }
 return result;
}

function findTseMunicipality(config,location){
 const state=(config?.abr||[]).find(item=>String(item.cd).toUpperCase()===location.uf);
 const list=state?.mu||[];
 return list.find(item=>plain(item.nm)===plain(location.city))||null;
}
function pickWinner(candidates=[]){return [...candidates].filter(Boolean).sort((a,b)=>numberValue(b.vap)-numberValue(a.vap))[0]||null;}

async function getMayor(location){
 if(location.uf==='DF')return null;
 const [firstConfig,secondConfig]=await Promise.all([
   safeJson('https://resultados.tse.jus.br/oficial/ele2024/619/config/mun-e000619-cm.json',{next:{revalidate:604800}}),
   safeJson('https://resultados.tse.jus.br/oficial/ele2024/620/config/mun-e000620-cm.json',{next:{revalidate:604800}})
 ]);
 const firstMunicipality=findTseMunicipality(firstConfig,location);
 if(!firstMunicipality)return null;
 const secondMunicipality=findTseMunicipality(secondConfig,location);
 const election=secondMunicipality?'620':'619';
 const electionPadded=election.padStart(6,'0');
 const municipality=secondMunicipality||firstMunicipality;
 const uf=location.uf.toLowerCase();
 const result=await safeJson(`https://resultados.tse.jus.br/oficial/ele2024/${election}/dados/${uf}/${uf}${municipality.cd}-c0011-e${electionPadded}-u.json`,{next:{revalidate:86400}});
 if(!result)return null;
 const office=(result?.carg||[]).find(item=>String(item.cd)==='11')||result?.carg?.[0];
 const candidates=[];
 for(const coalition of office?.agr||[])for(const party of coalition?.par||[])for(const candidate of party?.cand||[])candidates.push({...candidate,party:party.sg||coalition.sg||partyFromCoalition(candidate.cc)});
 const winner=pickWinner(candidates);
 if(!winner)return null;
 return {id:`prefeito-${location.uf}-${plain(location.city)}`,name:winner.nmu||winner.nm||'Prefeito eleito',party:winner.party||partyFromCoalition(winner.cc),uf:location.uf,office:'PREFEITO ELEITO EM 2024',term:'Mandato 2025–2028',elected:'Resultado eleitoral',photo:winner.sqcand?`https://resultados.tse.jus.br/oficial/ele2024/${election}/fotos/${uf}/${winner.sqcand}.jpeg`:'',url:TSE_RESULTS,current:false};
}

async function getGovernor(ufCode){
 const election=GOV_SECOND_ROUND.has(ufCode)?'547':'546';
 const uf=ufCode.toLowerCase();
 const result=await safeJson(`https://resultados.tse.jus.br/oficial/ele2022/${election}/dados-simplificados/${uf}/${uf}-c0003-e000${election}-r.json`,{next:{revalidate:86400}});
 if(!result)return null;
 const winner=pickWinner(result?.cand||[]);
 if(!winner)return null;
 return {id:`governador-${ufCode}`,name:winner.nm||'Governador eleito',party:partyFromCoalition(winner.cc),uf:ufCode,office:'GOVERNADOR ELEITO EM 2022',term:'Mandato 2023–2026',elected:'Resultado eleitoral',photo:winner.sqcand?`https://resultados.tse.jus.br/oficial/ele2022/${election}/fotos/${uf}/${winner.sqcand}.jpeg`:'',url:TSE_RESULTS,current:false};
}

export async function GET(request){
 try{
   const q=new URL(request.url).searchParams.get('q')||'';
   if(!q.trim())return Response.json({error:'Informe um CEP ou Cidade, UF.'},{status:400});
   const location=await resolveLocation(q);
   const override=currentExecutiveOverride(location);

   const [chamber,senate,tseMayor,tseGovernor]=await Promise.all([
     safeJson(`https://dadosabertos.camara.leg.br/api/v2/deputados?siglaUf=${location.uf}&itens=100&ordem=ASC&ordenarPor=nome`,{cache:'no-store'}),
     safeJson('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json',{next:{revalidate:1800}}),
     override.mayor?Promise.resolve(null):getMayor(location).catch(()=>null),
     override.governor?Promise.resolve(null):getGovernor(location.uf).catch(()=>null)
   ]);

   let deputies=(chamber?.dados||[]).map(item=>({id:String(item.id),name:item.nome,party:item.siglaPartido||'',uf:item.siglaUf||location.uf,photo:item.urlFoto||'',url:`https://www.camara.leg.br/deputados/${item.id}`}));
   let deputiesFallback=false;
   if(!deputies.length&&location.uf==='PA'){
     deputies=PA_DEPUTIES_2022;
     deputiesFallback=true;
   }

   const rawSenators=senate?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar||[];
   const senatorList=Array.isArray(rawSenators)?rawSenators:(rawSenators?[rawSenators]:[]);
   const senators=senatorList.map(item=>item?.IdentificacaoParlamentar).filter(Boolean).filter(item=>item.UfParlamentar===location.uf).map(item=>({id:String(item.CodigoParlamentar),name:item.NomeParlamentar,party:item.SiglaPartidoParlamentar||'',uf:item.UfParlamentar,photo:(item.UrlFotoParlamentar||'').replace('http://','https://'),url:(item.UrlPaginaParlamentar||`https://www25.senado.leg.br/web/senadores/senador/-/perfil/${item.CodigoParlamentar}`).replace('http://','https://')}));

   const mayor=override.mayor||tseMayor;
   const governor=override.governor||tseGovernor;
   const unavailable=[];
   if(!chamber&&!deputiesFallback)unavailable.push('Câmara dos Deputados');
   if(!senate)unavailable.push('Senado Federal');
   if(!mayor&&!governor)unavailable.push('Executivo');

   return Response.json({city:location.city,uf:location.uf,executives:{mayor,governor},deputies,senators,deputiesFallback,unavailable},{headers:{'Cache-Control':'public, s-maxage=600, stale-while-revalidate=86400'}});
 }catch(error){
   const raw=error?.message||'';
   const known=/Digite|CEP|Estado|Informe/.test(raw);
   return Response.json({error:known?raw:'Não foi possível concluir a consulta agora. Tente novamente ou busque por Cidade, UF.'},{status:known?400:503});
 }
}
