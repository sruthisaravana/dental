<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Live Transcription</h1>

    <div class="mb-4 space-x-2">
      <button @click="start" :disabled="isRecording" class="px-4 py-2 bg-blue-600 text-white rounded">Start</button>
      <button @click="stop" :disabled="!isRecording" class="px-4 py-2 bg-red-600 text-white rounded">Stop</button>
    </div>

    <div class="mb-6">
      <div class="rounded border p-3 min-h-[120px]">
        <div v-for="(segment, i) in segments" :key="i" class="mb-2">
          <div class="text-sm text-gray-600">{{ segment.time }}</div>
          <div class="text-lg">{{ segment.text }}</div>
        </div>
        <div v-if="partial" class="text-gray-500 italic">Partial: {{ partial }}</div>
      </div>
    </div>

    <div v-if="error" class="text-red-600">{{ error }}</div>
    <div v-if="status" class="text-sm text-gray-600">{{ status }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue';

const isRecording = ref(false);
const segments = ref([]);
const partial = ref('');
const error = ref(null);
const status = ref('');

let mediaRecorder = null;
let ws = null;
let hasSentResponse = false;

const start = async () => {
  error.value = null;
  partial.value = '';
  status.value = 'Requesting microphone...';
  hasSentResponse = false;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Choose a mimeType supported by the browser for low-latency chunks
    const mimeType = (() => {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/ogg')) return 'audio/ogg';
      return '';
    })();

    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    // Open a websocket to our server
    status.value = 'Connecting websocket...';
    const loc = window.location;
    const wsProto = loc.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = `${loc.hostname}:2095`;
    ws = new WebSocket(`${wsProto}://${wsHost}/api/realtime-ws`);

    ws.addEventListener('open', () => {
      status.value = 'Websocket open — streaming audio';
      isRecording.value = true;
      // start recording in small chunks for near-realtime
      mediaRecorder.start(250); // 250ms chunks (tune for latency)
    });

    ws.addEventListener('message', (evt) => {
      // OpenAI messages may be binary or text. Try parsing JSON text frames.
      if (typeof evt.data === 'string') {
        try {
          const j = JSON.parse(evt.data);
          handleServerMessage(j);
        } catch (e) {
          // not JSON: display raw
          console.log('text message', evt.data);
        }
      } else {
        // binary frames (if your server forwards raw binary)
        // ignore unless you forward text.
      }
    });

    ws.addEventListener('close', () => {
      status.value = 'Websocket closed';
      isRecording.value = false;
    });

    ws.addEventListener('error', (e) => {
      console.error('WS error', e);
      error.value = 'Websocket error — see console';
      isRecording.value = false;
    });

    mediaRecorder.addEventListener('dataavailable', async (ev) => {
      if (!ev.data || ev.data.size === 0) return;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          const ab = await ev.data.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(ab)));
          ws.send(
            JSON.stringify({ type: 'input_audio_buffer.append', audio: base64 })
          );
          ws.send(JSON.stringify({ type: 'input_audio_buffer.flush' }));
          if (!hasSentResponse) {
            ws.send(
              JSON.stringify({
                type: 'response.create',
                response: { modalities: ['text'], instructions: 'transcribe audio' },
              })
            );
            hasSentResponse = true;
          }
        } catch (err) {
          console.error('chunk->base64 err', err);
        }
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      // notify server we finished sending
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'input_audio_buffer.flush' }));
          ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        } catch (e) { /* ignore */ }
      }
      isRecording.value = false;
    });

  } catch (err) {
    console.error('getUserMedia error', err);
    error.value = 'Microphone permission denied or no mic available.';
    status.value = '';
  }
};

const stop = () => {
  status.value = 'Stopping...';
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (ws && ws.readyState === WebSocket.OPEN) {
    // close our WS connection after small timeout to ensure server flush
    setTimeout(() => ws.close(), 500);
  }
  isRecording.value = false;
};

function handleServerMessage(msg) {
  // This depends on OpenAI message shape. We'll handle common cases:
  // - partial text updates: { type: 'transcript.partial', text: '...' }
  // - final transcript: { type: 'transcript.final', text: '...' }
  // - or other event shapes - adapt as necessary.
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'transcript.partial' && msg.text) {
    partial.value = msg.text;
  } else if (msg.type === 'transcript.final' && msg.text) {
    partial.value = '';
    segments.value.push({ text: msg.text, time: new Date().toLocaleTimeString() });
  } else if (msg.type === 'response.delta' && msg.delta && msg.delta.transcript) {
    // alternate shape from some realtime docs
    partial.value = (msg.delta.transcript.partial || '') ;
    if (msg.delta.transcript.final) {
      segments.value.push({ text: msg.delta.transcript.text, time: new Date().toLocaleTimeString() });
      partial.value = '';
    }
  } else if (msg.type === 'error') {
    error.value = msg.message || 'Server error';
  } else {
    // fallback - show raw textual messages if helpful for debugging
    if (msg.text) {
      // sometimes OpenAI returns text fields
      segments.value.push({ text: msg.text, time: new Date().toLocaleTimeString() });
    }
  }
}

onBeforeUnmount(() => {
  try { if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop(); } catch {}
  try { if (ws) ws.close(); } catch {}
});
</script>

<style scoped>
/* small styles optional */
</style>
