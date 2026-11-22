import {
  Room,
  RoomEvent,
  Track,
  createLocalTracks,
} from "https://cdn.jsdelivr.net/npm/livekit-client@2.15.8/dist/livekit-client.esm.mjs";

const STATUS_TOPIC = "akapulu.avatar.status";
const SPEAKING_TOPIC = "akapulu.avatar.speaking";
const AVATAR_IDENTITY = "Avatar";

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

let room = null;
let remoteAudio = null;
let callReady = false;
const heldLines = [];

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

function setBotSpeaking(on) {
  app.dataset.botSpeaking = on ? "true" : "false";
}

function paintLine(who, text, pending) {
  // LiveKit Agents send one text stream per interim/final segment. Update the
  // open same-who bubble, skip an identical already-final bubble, else append.
  const cleaned = (text || "").trim();
  if (!cleaned) {
    return;
  }
  empty.hidden = true;
  const last = transcript.lastElementChild;
  if (last && last.dataset.who === who && last.dataset.pending === "true") {
    last.textContent = cleaned;
    last.dataset.pending = pending ? "true" : "false";
    transcript.scrollTop = transcript.scrollHeight;
    return;
  }
  if (
    last &&
    last.dataset.who === who &&
    last.dataset.pending === "false" &&
    last.textContent === cleaned
  ) {
    return;
  }
  const item = document.createElement("li");
  item.dataset.who = who;
  item.dataset.pending = pending ? "true" : "false";
  item.className = who === "You" ? "is-user" : "is-bot";
  item.textContent = cleaned;
  transcript.append(item);
  transcript.scrollTop = transcript.scrollHeight;
}

function holdLine(who, text, pending) {
  const cleaned = (text || "").trim();
  if (!cleaned) {
    return;
  }
  const last = heldLines[heldLines.length - 1];
  if (last && last.who === who && last.pending) {
    last.text = cleaned;
    last.pending = pending;
    return;
  }
  if (last && last.who === who && !last.pending && last.text === cleaned) {
    return;
  }
  heldLines.push({ who, text: cleaned, pending });
}

function showHeldLines() {
  const queued = heldLines.splice(0, heldLines.length);
  for (const item of queued) {
    paintLine(item.who, item.text, item.pending);
  }
}

function clearTranscript() {
  heldLines.splice(0, heldLines.length);
  transcript.replaceChildren();
  empty.hidden = false;
}

function line(who, text, pending) {
  if (!callReady) {
    holdLine(who, text, pending);
    return;
  }
  paintLine(who, text, pending);
}

function whoForTranscription(participantInfo, attrs) {
  const trackId = attrs && attrs["lk.transcribed_track_id"];
  if (room && typeof trackId === "string" && trackId) {
    for (const pub of room.localParticipant.trackPublications.values()) {
      if (pub.trackSid === trackId) {
        return "You";
      }
    }
    return "Assistant";
  }
  const identity = participantInfo && participantInfo.identity;
  if (room && identity === room.localParticipant.identity) {
    return "You";
  }
  return "Assistant";
}

function applyStatus(body) {
  if (!body || typeof body !== "object") {
    return;
  }
  if (typeof body.completion_percent === "number") {
    setPercent(body.completion_percent);
  }
  const text = body.latest_update_text;
  if (typeof text === "string" && text) {
    setStatus(text);
  }
  if (body.call_is_ready === true) {
    const wasReady = callReady;
    callReady = true;
    setPercent(100);
    setLoading(false);
    if (!wasReady) {
      showHeldLines();
    }
    if (app.classList.contains("is-connecting")) {
      setStatus("Connected");
      setPhase("connected");
    }
  }
}

function applySpeaking(body) {
  if (!body || typeof body !== "object") {
    return;
  }
  if (body.type !== "speaking" || body.who !== "bot") {
    return;
  }
  if (typeof body.bot_speaking === "boolean") {
    setBotSpeaking(body.bot_speaking);
    return;
  }
  if (body.state === "started") {
    setBotSpeaking(true);
    return;
  }
  if (body.state === "stopped" || body.state === "interrupted") {
    setBotSpeaking(false);
  }
}

async function endCall() {
  const current = room;
  room = null;
  callReady = false;
  setBotSpeaking(false);
  startButton.disabled = false;
  endButton.disabled = true;
  setLoading(false);
  setPhase("ended");
  if (current) {
    await current.disconnect();
  }
  video.srcObject = null;
  if (remoteAudio) {
    remoteAudio.srcObject = null;
  }
  setStatus("Call ended");
  showBanner("");
}

async function startCall() {
  startButton.disabled = true;
  endButton.disabled = true;
  callReady = false;
  setBotSpeaking(false);
  clearTranscript();
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
    const message =
      body && typeof body.error === "string"
        ? body.error
        : `Connect failed (${response.status}).`;
    setPhase("error");
    showBanner(message);
    setStatus(message);
    setLoading(false);
    startButton.disabled = false;
    return;
  }
  if (
    typeof body.room_url !== "string" ||
    !(body.room_url.startsWith("wss://") || body.room_url.startsWith("ws://"))
  ) {
    setPhase("error");
    showBanner("Connect did not return a LiveKit url.");
    setStatus("Connect did not return a LiveKit url.");
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

  room = new Room({ adaptiveStream: true, dynacast: true });
  room.registerTextStreamHandler("lk.transcription", async (reader, participantInfo) => {
    const attrs = reader.info?.attributes || {};
    const who = whoForTranscription(participantInfo, attrs);
    const final = attrs["lk.transcription_final"] === "true";
    let text = "";
    for await (const chunk of reader) {
      text += chunk;
      if (!final) {
        line(who, text, true);
      }
    }
    line(who, text, false);
  });
  room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
    if (participant.identity !== AVATAR_IDENTITY) {
      return;
    }
    if (track.kind === Track.Kind.Video) {
      track.attach(video);
      video.play().catch(() => {
        setStatus("Select the page to play the video.");
      });
    }
    if (track.kind === Track.Kind.Audio) {
      if (!remoteAudio) {
        remoteAudio = new Audio();
        remoteAudio.autoplay = true;
      }
      remoteAudio.srcObject = new MediaStream([track.mediaStreamTrack]);
      remoteAudio.play().catch(() => {
        setStatus("Select the page to hear the audio.");
      });
    }
  });
  room.on(RoomEvent.DataReceived, (payload, _participant, _kind, topic) => {
    let text;
    try {
      text = new TextDecoder().decode(payload);
    } catch {
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }
    if (!topic || topic === STATUS_TOPIC) {
      applyStatus(parsed);
    }
    if (topic === SPEAKING_TOPIC || parsed.type === "speaking") {
      applySpeaking(parsed);
    }
  });
  room.on(RoomEvent.Disconnected, () => {
    startButton.disabled = false;
    endButton.disabled = true;
    setLoading(false);
  });

  try {
    await room.connect(body.room_url, body.token);
    const localTracks = await createLocalTracks({ audio: true, video: false });
    await Promise.all(
      localTracks.map((track) => room.localParticipant.publishTrack(track)),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "LiveKit join failed.";
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
