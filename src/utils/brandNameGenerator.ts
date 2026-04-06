// Lightweight client-side brandable domain name generator

const prefixes = [
  'nex', 'flux', 'vibe', 'zen', 'nova', 'arc', 'evo', 'lux', 'orb', 'axi',
  'syn', 'pix', 'kin', 'zap', 'dex', 'ryn', 'kai', 'sol', 'lex', 'fin',
];

const roots = [
  'flow', 'forge', 'shift', 'pulse', 'spark', 'wave', 'mint', 'bolt',
  'peak', 'core', 'hive', 'rise', 'nest', 'sync', 'loop', 'grid',
  'dock', 'link', 'base', 'cast', 'edge', 'line', 'mark', 'path',
];

const suffixes = [
  'ly', 'io', 'fy', 'ra', 'ix', 'os', 'ia', 'on', 'er', 'al',
  'up', 'go', 'do', 'it', 'en', 'eo', 'ux', 'ax', 'ry', 'sy',
];

const brandWords: Record<string, string[]> = {
  modern: ['nex', 'flux', 'arc', 'sync', 'shift', 'edge'],
  premium: ['lux', 'nova', 'sol', 'peak', 'elite', 'prime'],
  urban: ['vibe', 'pulse', 'grid', 'dock', 'hub', 'metro'],
  playful: ['zap', 'pop', 'fizz', 'bop', 'doodle', 'whirl'],
  tech: ['byte', 'data', 'algo', 'cyber', 'neural', 'pixel'],
  creative: ['muse', 'ink', 'craft', 'bloom', 'spark', 'canvas'],
  minimal: ['zen', 'kin', 'simple', 'pure', 'bare', 'lean'],
  bold: ['forge', 'titan', 'blaze', 'storm', 'iron', 'apex'],
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface GeneratedDomain {
  name: string;
  tld: string;
  full: string;
  available: boolean;
}

export function generateBrandNames(
  keyword: string,
  vibe: string = '',
  count: number = 18
): GeneratedDomain[] {
  const kw = keyword.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const words = kw.split(/\s+/).filter(Boolean);
  const mainWord = words[0] || 'brand';
  const shortWord = mainWord.slice(0, Math.min(mainWord.length, 5));

  // Get vibe-specific words
  const vibeKey = vibe.trim().toLowerCase();
  const vibeWords = brandWords[vibeKey] || [];
  const extraRoots = vibeWords.length > 0 ? vibeWords : [];

  const names = new Set<string>();

  const generators: (() => string)[] = [
    // keyword + suffix
    () => capitalize(shortWord) + pick(suffixes),
    // prefix + keyword
    () => capitalize(pick(prefixes)) + shortWord,
    // keyword + root
    () => capitalize(shortWord) + capitalize(pick(roots)),
    // root + keyword
    () => capitalize(pick(roots)) + capitalize(shortWord),
    // prefix + root (pure brand)
    () => capitalize(pick(prefixes)) + capitalize(pick(roots)),
    // keyword + "ly/fy/io" style
    () => capitalize(mainWord) + pick(['ly', 'fy', 'io', 'ify', 'eo']),
    // two-syllable brand from keyword
    () => capitalize(shortWord.slice(0, 3)) + pick(['ora', 'iva', 'ica', 'ura', 'ana', 'ela']),
    // vibe-influenced
    () => vibeWords.length ? capitalize(pick(vibeWords)) + capitalize(shortWord) : capitalize(pick(prefixes)) + capitalize(pick(roots)),
    // keyword mashup
    () => words.length > 1 ? capitalize(words[0].slice(0, 3)) + capitalize(words[1].slice(0, 4)) : capitalize(shortWord) + pick(suffixes),
  ];

  // Generate enough unique names
  let attempts = 0;
  while (names.size < count + 6 && attempts < 200) {
    const gen = pick(generators);
    const name = gen();
    if (name.length >= 4 && name.length <= 14) {
      names.add(name);
    }
    attempts++;
  }

  const tlds = ['.ai', '.com'];
  const nameList = shuffle(Array.from(names)).slice(0, count);

  return nameList.map((name) => {
    const tld = pick(tlds);
    // Random availability: ~60% available
    const available = Math.random() > 0.4;
    return {
      name,
      tld,
      full: `${name}${tld}`.toLowerCase(),
      available,
    };
  });
}
