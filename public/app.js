const socket = io();
const $ = (id) => document.getElementById(id);
const overlays = ["choiceOverlay", "editorOverlay", "readerOverlay"];
let roomId = new URLSearchParams(location.search).get("room");
let currentLetter = "";
let toastTimer;

function showOverlay(id) { overlays.forEach(x => $(x).hidden = x !== id); }
function closeOverlays() { overlays.forEach(x => $(x).hidden = true); }
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
async function ensureRoom() {
  if (roomId) {
    try { await api(`/api/letters/${roomId}`); return; }
    catch { roomId = null; }
  }
  const data = await api("/api/rooms", { method: "POST" });
  roomId = data.roomId;
  history.replaceState({}, "", `${location.pathname}?room=${roomId}`);
  $("roomNote").textContent = "This is your shared room. Copy the link to invite the other person.";
  socket.emit("room:join", roomId);
}
async function loadLetter() {
  const data = await api(`/api/letters/${roomId}`);
  currentLetter = data.body || "";
  $("letterText").value = currentLetter;
  $("letterBody").textContent = currentLetter || "There isn't a letter here just yet. Someone can write the first one.";
}
$("openEnvelope").addEventListener("click", async () => {
  try {
    await ensureRoom();
    $("openEnvelope").classList.add("opened");
    socket.emit("room:join", roomId);
    showOverlay("choiceOverlay");
  } catch (e) { toast(e.message); }
});
$("createBtn").addEventListener("click", async () => {
  try { await loadLetter(); $("editorTitle").textContent = currentLetter ? "Add to your letter." : "Write your letter."; showOverlay("editorOverlay"); }
  catch (e) { toast(e.message); }
});
$("viewBtn").addEventListener("click", async () => {
  try { await loadLetter(); showOverlay("readerOverlay"); }
  catch (e) { toast(e.message); }
});
$("saveBtn").addEventListener("click", async () => {
  const body = $("letterText").value;
  $("saveBtn").disabled = true; $("saveStatus").textContent = "Saving your words…";
  try {
    const saved = await api(`/api/letters/${roomId}`, { method: "PUT", body: JSON.stringify({ body }) });
    currentLetter = saved.body;
    $("saveStatus").textContent = "Saved. The other device will update live.";
    $("letterBody").textContent = saved.body || "There isn't a letter here just yet.";
    toast("Your letter has been saved.");
    setTimeout(closeOverlays, 500);
  } catch (e) { $("saveStatus").textContent = e.message; }
  finally { $("saveBtn").disabled = false; }
});
socket.on("letter:updated", (data) => {
  currentLetter = data.body || "";
  $("letterBody").textContent = currentLetter || "There isn't a letter here just yet.";
  if (!$("editorOverlay").hidden && $("letterText") !== document.activeElement) $("letterText").value = currentLetter;
  $("syncStatus").innerHTML = "<i></i> Updated just now · Live updates are on";
});
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeOverlays));
overlays.forEach(id => $(id).addEventListener("click", e => { if (e.target.id === id) closeOverlays(); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlays(); });
(async () => {
  if (roomId) {
    try { await ensureRoom(); socket.emit("room:join", roomId); $("roomNote").textContent = "You are in a shared letter room."; }
    catch { $("roomNote").textContent = "Open the envelope to create a new letter room."; }
  }
})();
