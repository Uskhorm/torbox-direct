// Normalization helpers from AIOStreams parser/utils.ts, AGPL-3.0.
const germanDigraphMap: Record<string, string> = {
  Ä: 'Ae',
  ä: 'ae',
  Ö: 'Oe',
  ö: 'oe',
  Ü: 'Ue',
  ü: 'ue',
};
const nordicDigraphMap: Record<string, string> = {
  Å: 'Aa',
  å: 'aa',
};
const languageDigraphMaps: Record<string, Record<string, string>> = {
  de: germanDigraphMap,
  da: nordicDigraphMap,
  no: nordicDigraphMap,
  nb: nordicDigraphMap,
  nn: nordicDigraphMap,
};

// Base letters that NFD cannot decompose, folded to the ASCII forms release
// names use.
const asciiFoldMap: Record<string, string> = {
  ß: 'ss',
  ı: 'i',
  ø: 'o',
  Ø: 'O',
  ł: 'l',
  Ł: 'L',
  đ: 'd',
  Đ: 'D',
  æ: 'ae',
  Æ: 'Ae',
  œ: 'oe',
  Œ: 'Oe',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
};

function foldToAscii(title: string, language?: string): string {
  // every step below only rewrites non-ascii characters
  if (!/[^\x00-\x7f]/.test(title)) return title;
  const digraphMap = language ? languageDigraphMaps[language] : undefined;
  return (
    digraphMap ? title.replace(/[ÄäÖöÜüÅå]/g, (c) => digraphMap[c] ?? c) : title
  )
    .replace(/[ßıøØłŁđĐæÆœŒðÐþÞ]/g, (c) => asciiFoldMap[c])
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function collapseDigraphs(text: string): string {
  return text
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .replace(/aa/g, 'a');
}

export function normaliseTitle(title: string) {
  return collapseDigraphs(
    foldToAscii(title)
      .replace(/&/g, 'and')
      .replace(/[^\p{L}\p{N}+]/gu, '')
      .toLowerCase()
  );
}
