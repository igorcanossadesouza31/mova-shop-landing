// Servidor simples (sem dependências) — guarda a chave da API fora do navegador.
// Uso: ANTHROPIC_API_KEY=sk-ant-... node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You are a friendly English teacher for a Brazilian Portuguese speaker who is a COMPLETE BEGINNER (level A1).

Rules:
- Talk in very simple English: short sentences, common words, present tense when possible. Max 2-3 short sentences.
- Always end with one easy question to keep the conversation going.
- The student may write in English, in Portuguese, or mixed. If they write in Portuguese, teach them how to say it in English.
- Check the student's last message. If it has mistakes (grammar, spelling, word choice, or it was in Portuguese), give the corrected English and explain in simple Portuguese (pt-BR) WHY. If it is correct, say so and praise briefly.
- Never be harsh. Be encouraging.

Reply with ONLY a JSON object (no markdown, no text outside it) in this exact shape:
{
  "reply_en": "your reply in simple English",
  "reply_pt": "Portuguese translation of reply_en",
  "correction": {
    "has_errors": true or false,
    "original": "what the student wrote (empty if nothing to correct)",
    "corrected": "the correct English version",
    "explanation_pt": "short, simple explanation in Portuguese"
  },
  "new_words": [ { "en": "word or phrase", "pt": "tradução", "ipa_pt": "como se pronuncia, escrito em letras do português" } ]
}
"new_words" has at most 3 useful words from your reply. For the very first message (the student says "START"), greet them, ask their name, and set has_errors to false with empty strings.`;

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
