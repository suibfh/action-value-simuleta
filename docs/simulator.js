// Simplified structure around buff update (patch target snippet only shown)
if (buff.activated) {
  if (!buff.actedCountStarted) {
    buff.actedCountStarted = true;
    buff.actedCount = 1;
  } else {
    buff.actedCount++;
  }
} else {
  buff.activated = true;
}