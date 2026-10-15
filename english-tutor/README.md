# Teacher Ana — IA que ensina inglês

Professora de inglês para iniciantes: conversa em inglês simples, traduz para português,
corrige seus erros explicando o porquê, fala em voz alta e escuta você pelo microfone.

## Como rodar
```bash
cd english-tutor
export ANTHROPIC_API_KEY=sk-ant-...   # chave em console.anthropic.com
node server.js
```
Abra http://localhost:3000 no **Google Chrome** (necessário para o microfone).

Requer Node 18+. Sem dependências. A chave fica só no servidor, nunca no navegador.
