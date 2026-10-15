

const $ = (id) => document.getElementById(id);
const chat = $("chat"), form = $("form"), input = $("input"), micBtn = $("mic"), statusEl = $("status");
const transcript = []; // {who:"Student"|"Teacher", text}
const seen = new Set();

const setStatus = (t) => { statusEl.textContent = t || ""; };
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
function scrollDown() { chat.scrollTop = chat.scrollHeight; }

function speak(text) {
  if (!("speechSynthesis" in window)) return setStatus("Este navegador não tem voz. Tente o Chrome ou Safari.");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = $("slow").checked ? 0.75 : 1;
  const v = speechSynthesis.getVoices().find((x) => x.lang === "en-US");
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

function addUser(text) {
  const m = el("div", "msg user"); m.append(el("div", "en", text)); chat.append(m); scrollDown(); return m;
}

function addCorrection(m, c) {
  if (!c) return;
  const box = el("div", c.has_errors ? "card" : "card ok");
  if (c.has_errors) {
    box.append(el("div", "lbl", "Correção"));
    const a = el("div"); a.append("Você disse: ", el("s", null, c.original)); 
    const b = el("div"); b.append("Correto: ", el("b", null, c.corrected));
    const why = el("div", null, c.explanation_pt);
    const play = el("button", "chip", "Ouvir o correto"); play.type = "button"; play.onclick = () => speak(c.corrected);
    const r = el("div", "row"); r.append(play);
    box.append(a, b, why, r);
  } else {
    box.append(el("div", "lbl", "Muito bem"), el("div", null, c.explanation_pt || "Sua frase está correta."));
  }
  m.append(box);
}

function addTeacher(r, silent) {
  const m = el("div", "msg");
  const pt = el("div", "pt", r.reply_pt);
  const play = el("button", "chip", "Ouvir"); play.type = "button"; play.onclick = () => speak(r.reply_en);
  const tog = el("button", "chip", "Esconder tradução"); tog.type = "button";
  tog.onclick = () => { pt.hidden = !pt.hidden; tog.textContent = pt.hidden ? "Mostrar tradução" : "Esconder tradução"; };
  const row = el("div", "row"); row.append(play, tog);
  m.append(el("div", "en", r.reply_en), pt, row);
  if (r.teach_pt) {
    const t = el("div", "teach"); t.append(el("div", "lbl", "Aprenda"), el("div", null, r.teach_pt)); m.append(t);
  }
  if (r.hint_pt || r.example_answer) {
    const h = el("div", "hint"); h.append(el("div", "lbl", "Como responder"));
    if (r.hint_pt) h.append(el("div", null, r.hint_pt));
    if (r.example_answer) {
      h.append(el("div", "en", r.example_answer));
      const hear = el("button", "chip", "Ouvir"); hear.type = "button"; hear.onclick = () => speak(r.example_answer);
      const use = el("button", "chip", "Usar esta resposta"); use.type = "button";
      use.onclick = () => { input.value = r.example_answer; input.focus(); };
      const hr = el("div", "row"); hr.append(hear, use); h.append(hr);
    }
    m.append(h);
  }
  chat.append(m); scrollDown(); if (!silent) speak(r.reply_en);
  for (const w of r.new_words || []) addWord(w);
}

async function ask(text, userEl) {
  transcript.push({ who: "Student", text });
  const messages = transcript.map((t) => ({ role: t.who === "Student" ? "user" : "assistant", content: t.text }));
  $("send").disabled = true; setStatus("Teacher Ana está pensando…");
  try {
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro");
    const r = data.result;
    transcript.push({ who: "Teacher", text: data.raw });
    const showFix = userEl && !/^(HELP|DONT_UNDERSTAND|NEXT|LESSON:)/.test(text);
    if (showFix) addCorrection(userEl, r.correction);
    addTeacher(r); setStatus("");
    log.push({ u: userEl ? userEl.querySelector(".en").textContent : null, c: showFix ? r.correction : null, r });
    save();
  } catch (err) {
    transcript.pop();
    setStatus("Não consegui responder: " + err.message);
  } finally { $("send").disabled = false; }
}

function addWord(w) {
  if (!w.en || seen.has(w.en.toLowerCase())) return;
  seen.add(w.en.toLowerCase());
  const li = el("li", "word");
  li.append(el("div", "en", w.en), el("div", null, w.pt));
  if (w.pron) li.append(el("div", "pron", "Fala-se: " + w.pron));
  const b = el("button", "chip", "Ouvir"); b.type = "button"; b.onclick = () => speak(w.en);
  const row = el("div", "row"); row.append(b); li.append(row);
  $("wordList").append(li);
  $("wordsEmpty").hidden = true;
  const c = $("wordCount"); c.textContent = seen.size;
  if ($("viewWords").hidden) c.classList.add("new");
}

function showTab(name) {
  const words = name === "words";
  $("viewChat").hidden = words; $("viewWords").hidden = !words;
  $("tabChat").setAttribute("aria-selected", String(!words));
  $("tabWords").setAttribute("aria-selected", String(words));
  if (words) $("wordCount").classList.remove("new"); else scrollDown();
}
$("tabChat").onclick = () => showTab("chat");
$("tabWords").onclick = () => showTab("words");

const KEY = "teacher-ana-v1";
const log = []; // o que aparece na tela: {u, c, r}
let currentLesson = null;

function fresher(a, b) { // devolve o estado com mais progresso; empate: o mais recente
  const la = a && a.log ? a.log.length : 0, lb = b && b.log ? b.log.length : 0;
  if (la !== lb) return la > lb ? a : b;
  return (a && a.updatedAt || 0) >= (b && b.updatedAt || 0) ? a : b;
}

const CODE_KEY = "teacher-ana-code";
let syncCode = null, cloudChain = Promise.resolve();
try { syncCode = localStorage.getItem(CODE_KEY); } catch (_) {}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) { return null; }
}

function cloud(method, body) {
  return fetch("/api/progress", {
    method, headers: { "Content-Type": "application/json", "x-sync-code": syncCode },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json().then((j) => { if (!r.ok) throw new Error(j.error); return j; }));
}

function save() {
  const state = { transcript, log, currentLesson, updatedAt: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
  if (syncCode) { // uma gravação por vez
    cloudChain = cloudChain.then(() => cloud("PUT", { state })).catch(() => setStatus("Não consegui sincronizar. O progresso fica só neste aparelho."));
  }
}

function markLesson() {
  document.querySelectorAll(".lessons .chip").forEach((x) => x.classList.toggle("cur", x.textContent === currentLesson));
}

function restore(saved) {
  if (!saved || !Array.isArray(saved.log) || !saved.log.length) return false;
  transcript.push(...saved.transcript);
  currentLesson = saved.currentLesson || null; markLesson();
  for (const item of saved.log) {
    log.push(item);
    if (item.u) { const m = addUser(item.u); if (item.c) addCorrection(m, item.c); }
    addTeacher(item.r, true);
  }
  setStatus(syncCode ? "Continuando de onde você parou (sincronizado)." : "Continuando de onde você parou.");
  return true;
}

let resetTimer = null;
$("reset").onclick = () => {
  const b = $("reset");
  if (!resetTimer) {
    b.textContent = "Apagar tudo?";
    resetTimer = setTimeout(() => { resetTimer = null; b.textContent = "Recomeçar"; }, 3000);
    return;
  }
  clearTimeout(resetTimer); resetTimer = null; b.textContent = "Recomeçar";
  try { localStorage.removeItem(KEY); } catch (_) {}
  if (syncCode) cloudChain = cloudChain.then(() => cloud("DELETE")).catch(() => {});
  transcript.length = 0; log.length = 0; seen.clear(); currentLesson = null; markLesson();
  chat.textContent = ""; $("wordList").textContent = ""; $("wordsEmpty").hidden = false;
  $("wordCount").textContent = "0"; showTab("chat");
  ask("START", null);
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const t = input.value.trim(); if (!t) return;
  input.value = ""; ask(t, addUser(t));
});

const LESSONS = ["Cumprimentos", "Apresentação", "Números", "Cores", "Família", "Comida", "Verbo to be", "No restaurante", "Viagem"];
const LABELS = { HELP: "Me ajuda", DONT_UNDERSTAND: "Não entendi", NEXT: "Próxima" };
for (const name of LESSONS) {
  const b = el("button", "chip", name); b.type = "button";
  b.onclick = () => {
    document.querySelectorAll(".lessons .chip").forEach((x) => x.classList.toggle("cur", x === b));
    currentLesson = name; ask("LESSON: " + name, addUser("Aula: " + name));
  };
  $("lessons").append(b);
}
document.querySelectorAll("[data-send]").forEach((b) => {
  b.onclick = () => ask(b.dataset.send, addUser(LABELS[b.dataset.send]));
});

// Microfone (Chrome pede permissão na primeira vez)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, on = false;
if (!SR) { micBtn.hidden = true; $("micLangWrap").hidden = true; }
micBtn.addEventListener("click", () => {
  if (on) return rec.stop();
  rec = new SR(); rec.lang = $("micLang").value; rec.interimResults = true;
  rec.onstart = () => { on = true; micBtn.classList.add("on"); micBtn.textContent = "Ouvindo…"; };
  rec.onresult = (e) => { input.value = [...e.results].map((r) => r[0].transcript).join(" "); };
  rec.onerror = (e) => setStatus(e.error === "not-allowed" || e.error === "service-not-allowed"
    ? "O microfone está bloqueado. Clique em Permitir quando o Chrome perguntar (cadeado na barra de endereço)." : "Erro no microfone: " + e.error);
  rec.onend = () => { on = false; micBtn.classList.remove("on"); micBtn.textContent = "Falar"; if (input.value.trim()) form.requestSubmit(); };
  try { rec.start(); } catch (_) { setStatus("Não consegui abrir o microfone."); }
});

$("syncBtn").onclick = () => { $("syncPanel").hidden = !$("syncPanel").hidden; $("syncBtn").textContent = syncCode ? "Sincronizado" : "Sincronizar"; };
if (syncCode) $("syncBtn").textContent = "Sincronizado";
$("syncPanel").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("syncCode").value.trim();
  if (v.length < 8) return setStatus("O código precisa ter pelo menos 8 caracteres.");
  try { localStorage.setItem(CODE_KEY, v); } catch (_) {}
  location.reload(); // recarrega e puxa o progresso deste código
});
$("syncOff").onclick = () => { try { localStorage.removeItem(CODE_KEY); } catch (_) {} location.reload(); };

(async () => {
  speechSynthesis?.getVoices();
  let saved = readLocal();
  if (syncCode) {
    try {
      const { state } = await cloud("GET");
      if (state) saved = fresher(saved, state);
    } catch (err) { setStatus("Não consegui sincronizar: " + err.message); }
  }
  if (!restore(saved)) ask("START", null);
})();
