const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const micBtn = document.getElementById("mic");
const statusEl = document.getElementById("status");
const wordsBox = document.getElementById("words");
const wordList = document.getElementById("wordList");

const history = []; // formato da API: {role, content}
const seenWords = new Set();

function setStatus(t) { statusEl.textContent = t || ""; }

// ---------- Voz da professora (texto → fala) ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return setStatus("Seu navegador não fala. Use o Chrome.");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = document.getElementById("slow").checked ? 0.7 : 1;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith("en-US"));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

// ---------- Microfone (fala → texto) ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
if (!SR) { micBtn.disabled = true; micBtn.title = "Use o Google Chrome para falar"; }

micBtn.addEventListener("click", () => {
  if (!SR) return;
  if (listening) return rec.stop();
  rec = new SR();
  rec.lang = document.getElementById("micLang").value;
  rec.interimResults = true;
  rec.onstart = () => { listening = true; micBtn.classList.add("on"); setStatus("Estou ouvindo… fale agora"); };
  rec.onresult = (e) => { input.value = [...e.results].map((r) => r[0].transcript).join(" "); };
  rec.onerror = (e) => setStatus("Erro no microfone: " + e.error);
  rec.onend = () => {
    listening = false; micBtn.classList.remove("on"); setStatus("");
    if (input.value.trim()) form.requestSubmit();
  };
  rec.start();
});

// ---------- Renderização ----------
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function addUser(text) {
  const m = el("div", "msg user");
  m.append(el("div", "en", text));
  chat.append(m);
  chat.scrollTop = chat.scrollHeight;
  return m;
}

function addCorrection(userMsg, c) {
  if (!c) return;
  const box = el("div", c.has_errors ? "fix err" : "fix");
  if (c.has_errors) {
    const l1 = el("div"); l1.append("❌ Você disse: ", Object.assign(el("s"), { textContent: c.original }));
    const l2 = el("div"); l2.append("✅ Correto: ", Object.assign(el("b"), { textContent: c.corrected }));
    const l3 = el("div", null, "💡 " + c.explanation_pt);
    const play = el("button", null, "🔊 Ouvir correto");
    play.onclick = () => speak(c.corrected);
    box.append(l1, l2, l3, play);
  } else {
    box.textContent = "✅ Perfeito! " + (c.explanation_pt || "Sua frase está correta.");
  }
  userMsg.append(box);
}

function addTeacher(r) {
  const m = el("div", "msg");
  m.append(el("div", "en", r.reply_en));
  const pt = el("div", "pt", "🇧🇷 " + r.reply_pt);
  m.append(pt);
  const a = el("div", "actions");
  const play = el("button", null, "🔊 Ouvir");
  play.onclick = () => speak(r.reply_en);
  const toggle = el("button", null, "Esconder tradução");
  toggle.onclick = () => {
    pt.hidden = !pt.hidden;
    toggle.textContent = pt.hidden ? "Mostrar tradução" : "Esconder tradução";
  };
  a.append(play, toggle);
  m.append(a);
  chat.append(m);
  chat.scrollTop = chat.scrollHeight;
  speak(r.reply_en);

  (r.new_words || []).forEach((w) => {
    if (seenWords.has(w.en.toLowerCase())) return;
    seenWords.add(w.en.toLowerCase());
    const li = el("li", null, `${w.en} = ${w.pt}${w.ipa_pt ? " (" + w.ipa_pt + ")" : ""}`);
    li.style.cursor = "pointer";
    li.onclick = () => speak(w.en);
    wordList.append(li);
    wordsBox.hidden = false;
  });
}

// ---------- Conversa com a IA ----------
async function ask(content, userMsgEl) {
  history.push({ role: "user", content });
  setStatus("Teacher Ana está pensando…");
  document.getElementById("send").disabled = true;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    history.push({ role: "assistant", content: data.raw });
    if (userMsgEl) addCorrection(userMsgEl, data.result.correction);
    addTeacher(data.result);
    setStatus("");
  } catch (e) {
    history.pop();
    setStatus("⚠️ " + e.message);
  } finally {
    document.getElementById("send").disabled = false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  ask(text, addUser(text));
});

speechSynthesis?.getVoices(); // pré-carrega vozes
ask("START");
