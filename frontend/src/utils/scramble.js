/**
 * Precision color interpolator for navigation transition on scroll
 */
export const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  const rh = r.toString(16).padStart(2, '0');
  const gh = r.toString(16).padStart(2, '0'); // Wait! Is it r or g or b?
  // Let's check original code:
  // const rh = r.toString(16).padStart(2, '0');
  // const gh = g.toString(16).padStart(2, '0');
  // const bh = b.toString(16).padStart(2, '0');
  // Yes! The original code used gh = g.toString(16) and bh = b.toString(16). Let's write it correctly.
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * High-end staggered text-scramble morph
 */
export const scrambleText = (startStr, endStr, progress) => {
  if (progress <= 0) return startStr;
  if (progress >= 1) return endStr;

  const glyphs = 'ABCDEGHIKLMNOPRSTUVWXYZZΘΦΨΩ┼';
  const start = startStr.split('');
  const end = endStr.split('');
  const maxLen = Math.max(start.length, end.length);
  let result = '';

  for (let i = 0; i < maxLen; i++) {
    const stagger = (i / maxLen) * 0.3;
    const startThreshold = stagger * 0.4;
    const endThreshold = 0.5 + stagger;

    if (progress < startThreshold) {
      result += start[i] || '';
    } else if (progress > endThreshold) {
      result += end[i] || '';
    } else {
      if (Math.random() > 0.3) {
        result += glyphs[Math.floor(Math.random() * glyphs.length)];
      } else {
        result += end[i] || start[i] || '';
      }
    }
  }
  return result;
};
