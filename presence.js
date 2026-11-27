// Webcam presence: Wilco notices a visitor who stops in front of the kiosk.
// Privacy: frames stay in the <video> element and inside MediaPipe, in memory. Only numbers come out of
// this file (width and centre of the biggest face); nothing is drawn, stored, logged or sent.
// test/check.cjs fails if this file ever uses an API that could keep or send an image.

const presenceEnterMs = 1000, presenceLeaveMs = 3000;
// One detection: faces as fractions of the frame width. Near after 1 s of a face at least `threshold`
// wide; away 3 s after the last one. Only the biggest face counts when several people stand in front.
function presenceStep(state, faces, now, threshold) {
  const face = faces.filter(f => f.width >= threshold).reduce((big, f) => !big || f.width > big.width ? f : big, null);
  const since = face ? state.since ?? now : null;
  const lastNearAt = face ? now : state.lastNearAt;
  const near = face ? state.near || now - since >= presenceEnterMs : state.near && now - lastNearAt <= presenceLeaveMs;
  return {near, since, lastNearAt, face};
}

// The camera loop, used by the kiosk page (ui.js, settings.js). Tests call feed() directly.
// status: off | starting | working | no-camera | no-permission | unavailable. A missing or unplugged
// camera is tried again every 10 s; whatever fails, the kiosk keeps working by touch.
const presenceEmpty = {near: false, since: null, lastNearAt: -Infinity, face: null};
let presenceDetector, presenceVideo, presenceLoop, presenceRetry, presenceGeneration = 0;
var Presence = {
  // last: the biggest face of the latest detection, near enough or not, for the calibration in Settings.
  status: 'off', threshold: 0.10, stream: null, onchange: null, state: presenceEmpty, last: null,
  feed(faces, now = performance.now()) {
    this.last = faces.reduce((big, f) => !big || f.width > big.width ? f : big, null);
    const was = this.state.near;
    this.state = presenceStep(this.state, faces, now, this.threshold);
    if (this.state.near !== was) this.onchange?.(this.state, this.status);
  },
  setStatus(next) {
    if (this.status === next) return;
    this.status = next;
    this.onchange?.(this.state, this.status);
  },
  async start() {
    if (this.status === 'starting' || this.status === 'working') return;
    const run = ++presenceGeneration;
    clearTimeout(presenceRetry);
    this.setStatus('starting');
    let detector;
    try {
      presenceDetector ??= Vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href)
        .then(files => Vision.FaceDetector.createFromOptions(files, {baseOptions: {modelAssetPath: new URL('vendor/mediapipe/face.tflite', location.href).href, delegate: 'GPU'}, runningMode: 'VIDEO', minDetectionConfidence: 0.5}));
      detector = await presenceDetector;
    } catch {
      presenceDetector = null;
      if (run === presenceGeneration) this.setStatus('unavailable');
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({video: {width: 320, height: 240}});
    } catch (error) {
      if (run !== presenceGeneration) return;
      if (['NotAllowedError', 'SecurityError'].includes(error?.name)) return this.setStatus('no-permission');
      this.setStatus('no-camera');
      presenceRetry = setTimeout(() => { if (run === presenceGeneration) { this.status = 'off'; this.start(); } }, 10000);
      return;
    }
    if (run !== presenceGeneration) return stream.getTracks().forEach(track => track.stop()); // Stopped meanwhile.
    this.stream = stream;
    presenceVideo ??= Object.assign(document.createElement('video'), {muted: true, playsInline: true});
    presenceVideo.srcObject = stream;
    await presenceVideo.play().catch(() => {});
    for (const track of stream.getTracks()) track.onended = () => {
      if (run !== presenceGeneration) return;
      this.stop();
      this.setStatus('no-camera');
      presenceRetry = setTimeout(() => { if (this.status === 'no-camera') { this.status = 'off'; this.start(); } }, 10000);
    };
    presenceLoop = setInterval(() => {
      const video = presenceVideo;
      if (video.readyState < 2 || !video.videoWidth) return;
      let found;
      try { found = detector.detectForVideo(video, performance.now()).detections; } catch { return; }
      this.feed(found.map(d => ({width: d.boundingBox.width / video.videoWidth, x: (d.boundingBox.originX + d.boundingBox.width / 2) / video.videoWidth})));
    }, 200);
    this.setStatus('working');
  },
  stop() {
    presenceGeneration++;
    clearInterval(presenceLoop);
    clearTimeout(presenceRetry);
    this.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    this.stream = null;
    if (presenceVideo) presenceVideo.srcObject = null;
    const was = this.state.near;
    this.state = presenceEmpty;
    this.last = null;
    if (was) this.onchange?.(this.state, this.status);
    this.setStatus('off');
  }
};

if (typeof module !== 'undefined') module.exports = {presenceStep};
