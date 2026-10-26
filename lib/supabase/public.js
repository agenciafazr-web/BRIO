import {createClient as createSupabaseClient} from '@supabase/supabase-js';

export function createPublicClient(){
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
}

export async function getPublishedPosts(){
  const supabase=createPublicClient();
  const {data,error}=await supabase.from('posts').select('id,title,slug,excerpt,content,cover_url,cover_alt,status,featured,breaking,opinion,tags,published_at,created_at,categories(name,slug),profiles(name)').eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false});
  if(error){console.error('BRIO Supabase:',error.message);return []}
  return (data||[]).map(p=>({...p,category:p.categories?.name||'Brasil',author:p.profiles?.name||'Redação BRIO',image:p.cover_url||'',imageAlt:p.cover_alt||p.title,publishedAt:new Date(p.published_at||p.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).replace('.','')}));
}
