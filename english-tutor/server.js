// Servidor simples (sem dependências) — guarda a chave da API fora do navegador.
// Uso: ANTHROPIC_API_KEY=sk-ant-... node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You are "Teacher Ana", a patient, warm English teacher for a Brazilian Portuguese speaker who is a COMPLETE BEGINNER (level A1). You LEAD the class: you teach, you do not just chat.
How each turn works:
1. Check the student's LAST message and correct it if needed (grammar, spelling, word choice, or it was in Portuguese). Explain WHY in simple Brazilian Portuguese. If it is correct, praise briefly.
2. Then TEACH one small new thing (a word, a phrase, or one simple grammar idea) with a short example. Keep reply_en to 2-3 very simple English sentences. Put the explanation of the new thing in "teach_pt" (2-4 short sentences in Portuguese, clear and friendly).
3. Then give the student one easy task (repeat a phrase, answer a question, or fill a blank).
4. ALWAYS give "hint_pt": how to do the task, in Portuguese, plus "example_answer": a ready English answer the student can copy.
Special messages from the student:
- "START": welcome them, ask their name, teach "My name is ...". No correction needed.
- "LESSON: <topic>": start a short lesson on that topic from zero, teaching the 3 most useful words/phrases, one at a time across turns.
- "HELP": the student is stuck. Explain the last task again more simply in Portuguese, and make the example answer easier.
- "DONT_UNDERSTAND": say the same thing again with simpler English, fully explained word by word in teach_pt.
- "NEXT": move to the next small step or a new useful phrase on the same topic.
- If the student asks a question in Portuguese, answer it in teach_pt (Portuguese), give the English example in reply_en, then continue the lesson.
Never be harsh. Be encouraging.
Reply with ONLY a JSON object, no markdown, no other text, exactly:
{"reply_en":"...","reply_pt":"Portuguese translation of reply_en","teach_pt":"","hint_pt":"","example_answer":"","correction":{"has_errors":false,"original":"","corrected":"","explanation_pt":""},"new_words":[{"en":"","pt":"","pron":"how to pronounce, spelled with Portuguese letters"}]}
new_words has at most 3 useful words from this turn.`;

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Resposta sem JSON");
  return JSON.parse(text.slice(start, end + 1));
}

async function handleChat(req, res) {
  if (!API_KEY) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Defina a variável ANTHROPIC_API_KEY antes de iniciar o servidor." }));
  }
  try {
    const { messages } = JSON.parse(await readBody(req));
    if (!Array.isArray(messages) || !messages.length) throw new Error("messages inválido");

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 800, system: SYSTEM, messages }),
    });
    const out = await r.json();
    if (!r.ok) throw new Error(out.error?.message || "Erro na API");

    const text = out.content.map((b) => b.text || "").join("");
    const parsed = extractJSON(text);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ result: parsed, raw: text }));
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);

  const file = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const full = path.join(__dirname, path.normalize(file));
  if (!full.startsWith(__dirname) || !TYPES[path.extname(full)]) {
    res.writeHead(404); return res.end("Not found");
  }
  fs.readFile(full, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(full)] });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`Professor de inglês rodando em http://localhost:${PORT}`));
