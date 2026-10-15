import Daily from "https://cdn.jsdelivr.net/npm/@daily-co/daily-js@0.93.0/+esm";

const video = document.querySelector("#avatar");
const status = document.querySelector("#status");
const transcript = document.querySelector("#transcript");
const startButton = document.querySelector("#start");
const endButton = document.querySelector("#end");

let call = null;
let audio = null;

function setStatus(text) {
  status.textContent = text;
}

function line(who, text, pending) {
  const last = transcript.lastElementChild;
  if (last && last.dataset.who === who && last.dataset.pending === "true") {
    last.querySelector("span:last-child").textContent = text;
    last.dataset.pending = pending ? "true" : "false";
    return;
  }
  const item = document.createElement("li");
  item.dataset.who = who;
  item.dataset.pending = pending ? "true" : "false";
  const label = document.createElement("span");
  label.className = "who";
  label.textContent = who;
  const body = document.createElement("span");
  body.textContent = text;
  item.append(label, body);
  transcript.append(item);
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
    const percent = body.completion_percent;
    const text = body.latest_update_text;
    if (typeof text === "string" && text) {
      setStatus(typeof percent === "number" ? `${percent}% ${text}` : text);
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
  startButton.disabled = false;
  endButton.disabled = true;
  if (current) {
    await current.leave();
    current.destroy();
  }
  video.srcObject = null;
  if (audio) {
    audio.srcObject = null;
  }
  setStatus("Call ended");
}

async function startCall() {
  startButton.disabled = true;
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
    setStatus(message);
    startButton.disabled = false;
    return;
  }
  if (typeof body.room_url !== "string" || !body.room_url.startsWith("https://")) {
    setStatus("Connect did not return a room url.");
    startButton.disabled = false;
    return;
  }
  if (typeof body.token !== "string" || !body.token) {
    setStatus("Connect did not return a token.");
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
    setStatus(error instanceof Error ? error.message : "Daily join failed.");
    await endCall();
    return;
  }
  endButton.disabled = false;
  setStatus("Joining the call…");
}

startButton.addEventListener("click", () => {
  startCall().catch((error) => {
    setStatus(error instanceof Error ? error.message : "Start failed.");
    startButton.disabled = false;
  });
});

endButton.addEventListener("click", () => {
  endCall().catch((error) => {
    setStatus(error instanceof Error ? error.message : "End failed.");
  });
});
