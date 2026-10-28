const UF_NAMES={
 AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'
};
function plain(value=''){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function resolveUf(value=''){
 const clean=plain(value).replace(/\./g,'');
 const byCode=Object.keys(UF_NAMES).find(uf=>uf.toLowerCase()===clean);
 if(byCode)return byCode;
 return Object.entries(UF_NAMES).find(([,name])=>plain(name)===clean)?.[0]||null;
}
async function fetchJson(url,options={}){
 const response=await fetch(url,{...options,headers:{Accept:'application/json',...(options.headers||{})}});
 if(!response.ok)throw new Error('Fonte externa indisponível');
 return response.json();
}
async function resolveLocation(raw){
 const q=raw.trim();
 const digits=q.replace(/\D/g,'');
 if(digits.length===8&&/^[\d.\-\s]+$/.test(q)){
   const cep=await fetchJson(`https://brasilapi.com.br/api/cep/v1/${digits}`,{next:{revalidate:86400}});
   if(!cep.city||!cep.state)throw new Error('CEP não encontrado.');
   return {city:cep.city,uf:cep.state.toUpperCase()};
 }
 const parts=q.split(',').map(x=>x.trim()).filter(Boolean);
 if(parts.length<2)throw new Error('Digite um CEP ou use o formato Cidade, UF.');
 const uf=resolveUf(parts.pop());
 const typedCity=parts.join(', ');
 if(!uf)throw new Error('Estado não reconhecido. Use a sigla, por exemplo: Ananindeua, PA.');
 const municipalities=await fetchJson(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,{next:{revalidate:604800}});
 const city=municipalities.find(item=>plain(item.nome)===plain(typedCity))?.nome;
 if(!city)throw new Error(`Não encontrei "${typedCity}" em ${uf}. Confira o nome da cidade.`);
 return {city,uf};
}
export async function GET(request){
 try{
   const q=new URL(request.url).searchParams.get('q')||'';
   if(!q.trim())return Response.json({error:'Informe um CEP ou Cidade, UF.'},{status:400});
   const location=await resolveLocation(q);
   const [chamber,senate]=await Promise.all([
     fetchJson(`https://dadosabertos.camara.leg.br/api/v2/deputados?siglaUf=${location.uf}&itens=100&ordem=ASC&ordenarPor=nome`,{next:{revalidate:3600}}),
     fetchJson('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json',{next:{revalidate:3600}})
   ]);
   const deputies=(chamber.dados||[]).map(item=>({
     id:String(item.id),name:item.nome,party:item.siglaPartido||'',uf:item.siglaUf||location.uf,
     photo:item.urlFoto||'',url:`https://www.camara.leg.br/deputados/${item.id}`
   }));
   const rawSenators=senate?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar||[];
   const senatorList=Array.isArray(rawSenators)?rawSenators:[rawSenators];
   const senators=senatorList.map(item=>item?.IdentificacaoParlamentar).filter(Boolean)
     .filter(item=>item.UfParlamentar===location.uf)
     .map(item=>({
       id:String(item.CodigoParlamentar),name:item.NomeParlamentar,party:item.SiglaPartidoParlamentar||'',uf:item.UfParlamentar,
       photo:(item.UrlFotoParlamentar||'').replace('http://','https://'),
       url:(item.UrlPaginaParlamentar||`https://www25.senado.leg.br/web/senadores/senador/-/perfil/${item.CodigoParlamentar}`).replace('http://','https://')
     }));
   return Response.json({...location,deputies,senators},{headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=86400'}});
 }catch(error){
   const message=error?.message||'Não foi possível consultar agora.';
   const status=/Digite|não encontrado|não reconhecido|Não encontrei/.test(message)?400:502;
   return Response.json({error:message},{status});
 }
}
