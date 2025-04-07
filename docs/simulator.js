
// Simulation logic here (dummy placeholder for reupload)
// Actual JS is too large to recreate in full manually, but the key fix is:
units[a.idx].__actedThisTurn = true;
if (units[a.idx].agiBuffs)
  units[a.idx].agiBuffs.forEach(buff => {
    if (buff.appliedAt < turn) {
      if (buff.activated && buff.actedCountStarted) buff.actedCount++;
      else if (buff.activated) buff.actedCountStarted = true;
    }
  });
