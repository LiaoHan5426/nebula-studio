function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  const c =
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055;
  return clamp(Math.round(c * 255), 0, 255);
}

export function parseHexColor(input: string): [number, number, number] {
  const hex = input.trim().replace('#', '');
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return [77, 124, 255];
  }
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const lCube = Math.cbrt(l);
  const mCube = Math.cbrt(m);
  const sCube = Math.cbrt(s);
  const L = 0.2104542553 * lCube + 0.793617785 * mCube - 0.0040720468 * sCube;
  const a = 1.9779984951 * lCube - 2.428592205 * mCube + 0.4505937099 * sCube;
  const b2 = 0.0259040371 * lCube + 0.7827717662 * mCube - 0.808675766 * sCube;
  const C = Math.sqrt(a * a + b2 * b2);
  const H = (Math.atan2(b2, a) * 180) / Math.PI;
  return [L, C, H < 0 ? H + 360 : H];
}

function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const h = (H * Math.PI) / 180;
  const a = Math.cos(h) * C;
  const b = Math.sin(h) * C;
  const lCone = L + 0.3963377774 * a + 0.2158037573 * b;
  const mCone = L - 0.1055613458 * a - 0.0638541728 * b;
  const sCone = L - 0.0894841775 * a - 1.291485548 * b;
  const l = lCone ** 3;
  const m = mCone ** 3;
  const s = sCone ** 3;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) {
      h = ((gn - bn) / d) % 6;
    } else if (max === gn) {
      h = (bn - rn) / d + 2;
    } else {
      h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h, s * 100, l * 100];
}

function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(
  a: [number, number, number],
  b: [number, number, number],
): number {
  const l1 = relativeLuminance(...a);
  const l2 = relativeLuminance(...b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatHsl(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function oklchToHslString(L: number, C: number, H: number): string {
  const [r, g, b] = oklchToRgb(L, C, H);
  const [h, s, l] = rgbToHsl(r, g, b);
  return formatHsl(h, s, l);
}

/**
 * Derive action/focus/selection tokens from an accent seed.
 * Does not emit success/warning/danger.
 */
export function generateAccentPalette(seed: string): Record<string, string> {
  const rgb = parseHexColor(seed);
  let [L, C, H] = rgbToOklch(...rgb);
  C = clamp(C, 0.04, 0.22);

  const actionRgb = (): [number, number, number] => oklchToRgb(L, C, H);
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [20, 20, 24];
  let guard = 0;
  while (contrastRatio(actionRgb(), white) < 4.5 && L > 0.28 && guard < 24) {
    L -= 0.02;
    guard += 1;
  }
  while (contrastRatio(actionRgb(), black) < 3 && L < 0.72 && guard < 48) {
    L += 0.02;
    guard += 1;
  }

  const hoverL = clamp(L - 0.05, 0.2, 0.85);
  const activeL = clamp(L - 0.09, 0.16, 0.8);
  const subtleL = clamp(L + 0.28, 0.7, 0.96);
  const mutedL = clamp(L + 0.18, 0.55, 0.9);
  const strongL = clamp(L - 0.12, 0.18, 0.7);
  const content =
    contrastRatio(actionRgb(), white) >= 4.5 ? '0 0% 100%' : '233 35% 14%';

  return {
    'action-primary': oklchToHslString(L, C, H),
    'action-primary-hover': oklchToHslString(hoverL, C, H),
    'action-primary-active': oklchToHslString(activeL, C, H),
    'action-primary-content': content,
    'focus-ring': oklchToHslString(clamp(L + 0.04, 0.3, 0.8), C * 0.85, H),
    selection: oklchToHslString(subtleL, C * 0.45, H),
    'accent-subtle': oklchToHslString(subtleL, C * 0.35, H),
    'accent-muted': oklchToHslString(mutedL, C * 0.5, H),
    'accent-strong': oklchToHslString(strongL, C, H),
    primary: oklchToHslString(L, C, H),
    'primary-foreground': content,
    'primary-hover': oklchToHslString(hoverL, C, H),
    ring: oklchToHslString(clamp(L + 0.04, 0.3, 0.8), C * 0.85, H),
  };
}
