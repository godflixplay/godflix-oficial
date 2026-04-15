
# Godflix MVP — Plano de Implementação

## Visão Geral
Plataforma com visual dark cinematográfico (estilo Netflix), em português BR, com dados mock estáticos. Quatro páginas principais com navegação fluida.

## Design System
- **Tema**: Dark mode com fundo escuro (#0a0a0a / #141414), acentos dourados (#D4A853), texto branco/cinza claro
- **Tipografia**: Headings bold e impactantes, corpo limpo e legível
- **Cards**: Estilo poster de filme com overlay gradiente e informações sobre hover
- **Componentes**: Carrosséis horizontais, barras de progresso de arrecadação, badges de categoria

## Páginas

### 1. Home — Vitrine Cinematográfica (`/`)
- **Hero**: Projeto em destaque com imagem fullscreen, título grande, sinopse, barra de progresso de arrecadação e CTA "Apoiar este projeto"
- **Carrosséis por categoria**: Filmes, Séries, Documentários, Animações — estilo Netflix com scroll horizontal
- **Seção "Como funciona"**: 3 pilares (Apoie, Associe-se, Patrocine)
- **CTA de associação**: Banner convidando a ser membro
- **Footer**: Links, redes sociais, logo

### 2. Página do Projeto (`/projetos/$projetoId`)
- Imagem/trailer em destaque (embed de vídeo ou imagem hero)
- Título, sinopse completa, equipe de produção
- **Barra de progresso**: Meta de arrecadação vs. valor arrecadado, número de apoiadores, dias restantes
- **Opções de apoio**: Cards com diferentes valores e recompensas
- Status do projeto (em financiamento, em produção, concluído)
- Projetos relacionados

### 3. Seja Membro (`/membros`)
- Explicação da missão da Godflix
- **Cards de planos**: 2-3 níveis de associação com benefícios diferentes
- FAQ sobre a associação
- CTA para assinar

### 4. Para Empresas (`/empresas`)
- Proposta de valor para patrocinadores corporativos
- Benefícios de visibilidade de marca
- Cases/depoimentos (mock)
- **Formulário de contato** para empresas interessadas

### 5. Enviar Projeto (`/enviar-projeto`)
- Página para produtores submeterem propostas
- Formulário com campos: título, categoria, sinopse, orçamento estimado, link para portfólio
- Mensagem de que projetos passam por curadoria

## Navegação
- **Header**: Logo Godflix, links (Projetos, Seja Membro, Para Empresas, Enviar Projeto), botão de CTA
- **Footer**: Links institucionais, redes sociais, copyright

## Dados Mock
- 8-10 projetos fictícios com imagens (de bancos gratuitos), títulos, categorias, metas e progresso de arrecadação
- 3 planos de associação
- Categorias: Filme, Série, Documentário, Animação, Teatro

## Sugestões de Produto para o Futuro
- Autenticação e perfil de apoiador
- Dashboard do produtor para acompanhar arrecadação
- Integração com pagamentos (Stripe/Paddle) para apoios reais
- Banco de dados real (Supabase) para gestão de projetos
- Sistema de notificações e updates de projetos
- Área de conteúdo exclusivo para membros
