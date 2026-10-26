import Daily from "https://cdn.jsdelivr.net/npm/@daily-co/daily-js@0.93.0/+esm";

const app = document.querySelector("#app");
const banner = document.querySelector("#banner");
const video = document.querySelector("#avatar");
const status = document.querySelector("#status");
const fill = document.querySelector("#fill");
const loading = document.querySelector("#loading");
const empty = document.querySelector("#empty");
const transcript = document.querySelector("#transcript");
const startButton = document.querySelector("#start");
const endButton = document.querySelector("#end");

let call = null;
let audio = null;
let callReady = false;

function setPhase(phase) {
  app.className = `live-call is-${phase}`;
}

function showBanner(text) {
  banner.hidden = !text;
  banner.textContent = text || "";
}

function setLoading(visible) {
  loading.hidden = !visible;
}

function setStatus(text) {
  status.textContent = text;
}

function setPercent(value) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  fill.style.width = `${percent}%`;
}

function line(who, text, pending) {
  empty.hidden = true;
  const last = transcript.lastElementChild;
  if (last && last.dataset.who === who && last.dataset.pending === "true") {
    last.textContent = text;
    last.dataset.pending = pending ? "true" : "false";
    return;
  }
  const item = document.createElement("li");
  item.dataset.who = who;
  item.dataset.pending = pending ? "true" : "false";
  item.className = who === "You" ? "is-user" : "is-bot";
  item.textContent = text;
  transcript.append(item);
  transcript.scrollTop = transcript.scrollHeight;
}

function statusBody(message) {
  if (!message || message.label !== "rtvi-ai" || message.type !== "server-message") {
    return null;
  }
  const data = message.data;
  if (!data || data.type !== "status") {
    return null;
  }
  return data;
}

function onAppMessage(event) {
  const message = event && event.data ? event.data : event;
  const body = statusBody(message);
  if (body) {
    if (typeof body.completion_percent === "number") {
      setPercent(body.completion_percent);
    }
    const text = body.latest_update_text;
    if (typeof text === "string" && text) {
      setStatus(text);
    }
    if (body.call_is_ready === true) {
      callReady = true;
      setPercent(100);
      setLoading(false);
      if (app.classList.contains("is-connecting")) {
        setStatus("Connected");
        setPhase("connected");
      }
    }
    return;
  }
  if (!message || message.label !== "rtvi-ai") {
    return;
  }
  if (message.type === "user-transcription" && message.data && message.data.text) {
    line("You", message.data.text, message.data.final !== true);
  }
  if (message.type === "bot-transcription" && message.data && message.data.text) {
    line("Assistant", message.data.text, false);
  }
}

function onTrackStarted(event) {
  if (!event || !event.track || !event.participant || event.participant.local) {
    return;
  }
  if (event.participant.user_name !== "Avatar") {
    return;
  }
  if (event.track.kind === "video") {
    video.srcObject = new MediaStream([event.track]);
    video.play().catch(() => {
      setStatus("Select the page to play the video.");
    });
    if (callReady) {
      setLoading(false);
    }
  }
  if (event.track.kind === "audio") {
    if (!audio) {
      audio = new Audio();
      audio.autoplay = true;
    }
    audio.srcObject = new MediaStream([event.track]);
    audio.play().catch(() => {
      setStatus("Select the page to hear the audio.");
    });
  }
}

async function endCall() {
  const current = call;
  call = null;
  callReady = false;
  startButton.disabled = false;
  endButton.disabled = true;
  setLoading(false);
  setPhase("ended");
  if (current) {
    await current.leave();
    current.destroy();
  }
  video.srcObject = null;
  if (audio) {
    audio.srcObject = null;
  }
  setStatus("Call ended");
  showBanner("");
}

async function startCall() {
  startButton.disabled = true;
  endButton.disabled = true;
  callReady = false;
  setPhase("connecting");
  showBanner("");
  setLoading(true);
  setPercent(0);
  setStatus("Opening the room…");
  const response = await fetch("/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok || !body || typeof body !== "object") {
    const message = body && typeof body.error === "string" ? body.error : `Connect failed (${response.status}).`;
    setPhase("error");
    showBanner(message);
    setStatus(message);
    setLoading(false);
    startButton.disabled = false;
    return;
  }
  if (typeof body.room_url !== "string" || !body.room_url.startsWith("https://")) {
    setPhase("error");
    showBanner("Connect did not return a room url.");
    setStatus("Connect did not return a room url.");
    setLoading(false);
    startButton.disabled = false;
    return;
  }
  if (typeof body.token !== "string" || !body.token) {
    setPhase("error");
    showBanner("Connect did not return a token.");
    setStatus("Connect did not return a token.");
    setLoading(false);
    startButton.disabled = false;
    return;
  }
  call = Daily.createCallObject({
    videoSource: false,
    audioSource: true,
    subscribeToTracksAutomatically: true,
  });
  call.on("app-message", onAppMessage);
  call.on("track-started", onTrackStarted);
  call.on("left-meeting", () => {
    startButton.disabled = false;
    endButton.disabled = true;
    setLoading(false);
  });
  try {
    await call.join({
      url: body.room_url,
      token: body.token,
      userName: "You",
      startVideoOff: true,
      startAudioOff: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daily join failed.";
    setPhase("error");
    showBanner(message);
    setStatus(message);
    await endCall();
    return;
  }
  endButton.disabled = false;
  setStatus("Joining the call…");
}

startButton.addEventListener("click", () => {
  startCall().catch((error) => {
    const message = error instanceof Error ? error.message : "Start failed.";
    setPhase("error");
    showBanner(message);
    setStatus(message);
    setLoading(false);
    startButton.disabled = false;
  });
});

endButton.addEventListener("click", () => {
  endCall().catch((error) => {
    const message = error instanceof Error ? error.message : "End failed.";
    setPhase("error");
    showBanner(message);
    setStatus(message);
  });
});
