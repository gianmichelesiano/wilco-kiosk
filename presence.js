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

if (typeof module !== 'undefined') module.exports = {presenceStep};
