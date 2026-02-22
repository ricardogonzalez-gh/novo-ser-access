

## Plano: App Instituto Novo Ser — Autenticação com Google OAuth

### 1. Conexão com Supabase
- Conectar o projeto Lovable ao Supabase (URL: `https://bcdodtyyoqlqhdnnqdds.supabase.co`)
- Armazenar a **anon key** como secret seguro do projeto
- **Pré-requisito:** Você precisará configurar o Google OAuth no painel do Supabase (Authentication → Providers → Google) e no Google Cloud Console

### 2. Tela de Login
- Página de login limpa e responsiva com a identidade visual do Instituto Novo Ser
- Botão único: **"Entrar com Google"**
- Sem formulários de e-mail/senha

### 3. Verificação de Domínio
- Após login com Google, verificar se o e-mail do usuário termina em `@novoser.org.br`
- Se o domínio for diferente → redirecionar para **tela de acesso negado** com a mensagem: *"Acesso restrito à equipe do Instituto Novo Ser."*
- Botão para voltar/tentar com outra conta

### 4. Perfis e Roles
- Consultar a tabela `profiles` já existente no Supabase para obter o role do usuário (`admin`, `equipe`, `visualizacao`)
- Tratar caso de perfil não encontrado com mensagem adequada

### 5. Tela Pós-Login (Dashboard Placeholder)
- **Header** com:
  - Logo do Instituto Novo Ser (placeholder inicial)
  - Nome do usuário logado
  - Botão de **Logout**
- **Conteúdo:**
  - Mensagem de boas-vindas personalizada com o nome e perfil/role do usuário
  - Placeholder: *"Dashboard em construção"*

### 6. Proteção de Rotas
- Rotas protegidas que redirecionam para login se não autenticado
- Gerenciamento de sessão com `onAuthStateChange` do Supabase

