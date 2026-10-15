# Teacher Ana — IA que ensina inglês

Professora de inglês para iniciantes: dá aulas por tema, explica em português, corrige seus erros, mostra como responder, fala em voz alta e escuta você pelo microfone.
corrige seus erros explicando o porquê, fala em voz alta e escuta você pelo microfone.

## Como rodar
```bash
cd english-tutor
export ANTHROPIC_API_KEY=sk-ant-...   # chave em console.anthropic.com
node server.js
```
Abra http://localhost:3000 no **Google Chrome** (necessário para o microfone).

Requer Node 18+. Sem dependências. A chave fica só no servidor, nunca no navegador.
