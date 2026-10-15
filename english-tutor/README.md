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

## Continuar de onde parou e usar em vários aparelhos
- O progresso (conversa, palavras e aula) fica salvo no navegador automaticamente.
- Para usar em outro aparelho, toque em **Sincronizar** e digite o mesmo **código secreto** (mínimo 8 caracteres) em todos. Quem souber o código acessa o progresso, então escolha algo difícil de adivinhar.
- O servidor guarda o progresso no Upstash Redis se `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` estiverem definidos (grátis em upstash.com). Sem isso, usa um arquivo local, que o Render apaga a cada deploy.
