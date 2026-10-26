# BRIO Brasil

Portal editorial da BRIO.

## Estrutura
- `/` capa editorial
- `/noticia/[slug]` página de matéria
- `/admin` painel de redação (interface inicial)

## Arquitetura editorial planejada
O front já foi separado da lógica de conteúdo para permitir a conexão com Supabase sem reconstruir o portal. A fonte temporária é `lib/posts.js`.

### Banco de dados
Tabelas previstas: `posts`, `categories`, `authors`, `profiles`, `media`, `tags` e `post_tags`.

`posts`: id, title, slug, excerpt, content, cover_url, category_id, author_id, status (`draft`, `scheduled`, `published`), featured, breaking, published_at, scheduled_at, seo_title, seo_description, created_at, updated_at.

### Painel
Fluxo: login → publicações → nova matéria → título/subtítulo/conteúdo → imagem → editoria/autor/tags → SEO → rascunho/agendamento/publicação → destaque de capa.

### Perfis
- Admin: tudo
- Editor: cria, edita, publica e organiza capa
- Autor: cria e edita seus rascunhos

### Próxima etapa
1. Criar projeto Supabase e variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Criar schema + RLS.
3. Autenticação do `/admin`.
4. Upload de imagens no Supabase Storage.
5. Editor rich-text e publicação/agendamento reais.

## Desenvolvimento
`npm install`
`npm run dev`
