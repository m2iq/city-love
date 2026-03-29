export interface Province {
  id: string;
  name: string;
  nameAr: string;
  /** Center X on 800×750 viewBox */
  x: number;
  /** Center Y on 800×750 viewBox */
  y: number;
  /** SVG path data for province boundary */
  path: string;
  /** Arabic label metadata for map rendering */
  label: {
    x: number;
    y: number;
    lines: string[];
    fontSize?: number;
    outside?: boolean;
    leaderTo?: { x: number; y: number };
  };
}

/*
 * Province boundaries mapped onto an 800 × 750 SVG viewBox.
 * Paths are carefully drawn to match Iraq's real geography:
 * - Kurdish region (north-east): Duhok, Erbil, Sulaymaniyah
 * - Nineveh: large western-northern province
 * - Anbar: the vast western desert province
 * - Central: Saladin, Kirkuk, Diyala, Baghdad, Babil, Karbala, Wasit
 * - South: Najaf, Qadisiyyah, Muthanna, Dhi Qar, Maysan, Basra
 * Iraq outer border: roughly fits a viewBox of 800×750
 *   North: ~y=30 (Turkey border, mountains)
 *   South: ~y=710 (Gulf coast)
 *   West: ~x=50 (Jordan/Syria border, desert)
 *   East: ~x=700 (Iran border)
 *   The narrow Basra gulf access in the south-east
 */
export const provinces: Record<string, Province> = {
  duhok: {
    id: 'duhok',
    name: 'Duhok',
    nameAr: 'دهوك',
    x: 340,
    y: 65,
    // North-west Kurdish region, borders Turkey & Syria to north/west, Nineveh to south/west, Erbil to east
    path: 'M220 32 L280 28 L340 30 L390 38 L420 58 L415 80 L395 92 L370 98 L340 95 L305 88 L270 80 L240 65 L215 55 Z',
    label: { x: 330, y: 20, lines: ['دهوك'], fontSize: 13, outside: true, leaderTo: { x: 330, y: 58 } },
  },
  nineveh: {
    id: 'nineveh',
    name: 'Nineveh',
    nameAr: 'نينوى',
    x: 285,
    y: 148,
    // Large province: north borders Turkey/Syria, west borders Syria, south/east Anbar/Saladin/Kirkuk/Duhok-Erbil
    path: 'M100 38 L160 33 L220 32 L215 55 L240 65 L270 80 L305 88 L340 95 L370 98 L390 115 L385 138 L370 158 L348 178 L318 192 L285 198 L255 190 L230 175 L205 155 L182 130 L162 105 L140 82 L118 62 Z',
    label: { x: 268, y: 148, lines: ['نينوى'], fontSize: 16 },
  },
  erbil: {
    id: 'erbil',
    name: 'Erbil',
    nameAr: 'أربيل',
    x: 455,
    y: 100,
    // North-east: borders Turkey north, Duhok west, Sulaymaniyah east/south, Kirkuk south, Nineveh west
    path: 'M390 38 L450 34 L510 40 L550 55 L565 78 L560 102 L545 122 L520 138 L492 148 L465 150 L440 145 L415 130 L395 112 L390 92 L415 80 Z',
    label: { x: 476, y: 96, lines: ['أربيل'], fontSize: 14 },
  },
  sulaymaniyah: {
    id: 'sulaymaniyah',
    name: 'Sulaymaniyah',
    nameAr: 'السليمانية',
    x: 555,
    y: 155,
    // Borders Iran to east, Erbil to north-west, Kirkuk west, Diyala south-west
    path: 'M510 40 L570 45 L620 62 L658 88 L665 120 L658 152 L642 175 L620 192 L592 200 L562 198 L535 188 L512 168 L498 148 L520 138 L545 122 L560 102 L565 78 L550 55 Z',
    label: { x: 574, y: 148, lines: ['السليمانية'], fontSize: 11 },
  },
  kirkuk: {
    id: 'kirkuk',
    name: 'Kirkuk',
    nameAr: 'كركوك',
    x: 435,
    y: 195,
    // Centrally placed: Erbil north, Sulaymaniyah east, Diyala south-east, Saladin west, Nineveh north-west
    path: 'M370 158 L390 115 L395 112 L415 130 L440 145 L465 150 L492 148 L498 148 L512 168 L518 192 L505 215 L485 228 L460 235 L432 232 L408 218 L388 200 L378 182 Z',
    label: { x: 444, y: 192, lines: ['كركوك'], fontSize: 13 },
  },
  saladin: {
    id: 'saladin',
    name: 'Saladin',
    nameAr: 'صلاح الدين',
    x: 348,
    y: 248,
    // Central province: Nineveh north, Kirkuk east, Diyala south-east, Baghdad south, Anbar west
    path: 'M230 175 L255 190 L285 198 L318 192 L348 178 L370 158 L378 182 L388 200 L408 218 L412 242 L405 268 L392 285 L370 295 L345 300 L318 295 L292 282 L272 260 L260 238 L248 210 L235 190 Z',
    label: { x: 338, y: 242, lines: ['صلاح', 'الدين'], fontSize: 12 },
  },
  diyala: {
    id: 'diyala',
    name: 'Diyala',
    nameAr: 'ديالى',
    x: 500,
    y: 278,
    // Borders Iran east, Sulaymaniyah north-east, Kirkuk north, Saladin west, Baghdad/Wasit south
    path: 'M505 215 L518 192 L535 188 L562 198 L592 200 L620 192 L642 175 L658 152 L668 180 L672 215 L665 252 L650 278 L630 298 L605 308 L578 310 L552 302 L528 285 L512 260 L498 240 L485 228 L505 215 Z',
    label: { x: 572, y: 252, lines: ['ديالى'], fontSize: 14 },
  },
  anbar: {
    id: 'anbar',
    name: 'Anbar',
    nameAr: 'الأنبار',
    x: 198,
    y: 365,
    // Largest province: vast western desert. Borders Syria/Jordan west, Saudi Arabia south-west, Nineveh north, Saladin/Baghdad/Karbala/Najaf east
    path: 'M52 100 L100 38 L118 62 L140 82 L162 105 L182 130 L205 155 L230 175 L235 190 L248 210 L260 238 L272 260 L292 282 L318 295 L328 322 L322 355 L305 385 L275 415 L238 438 L195 452 L152 458 L108 445 L72 420 L50 388 L40 348 L38 295 L42 238 L48 178 Z',
    label: { x: 180, y: 340, lines: ['الأنبار'], fontSize: 18 },
  },
  baghdad: {
    id: 'baghdad',
    name: 'Baghdad',
    nameAr: 'بغداد',
    x: 430,
    y: 338,
    // Small province in center: Saladin north, Diyala east, Wasit south-east, Babil south, Anbar west, Karbala west
    path: 'M370 295 L392 285 L405 268 L412 242 L432 232 L460 235 L478 248 L485 270 L482 298 L468 318 L448 332 L425 338 L400 332 L382 315 Z',
    label: { x: 430, y: 298, lines: ['بغداد'], fontSize: 12 },
  },
  babil: {
    id: 'babil',
    name: 'Babil',
    nameAr: 'بابل',
    x: 408,
    y: 390,
    // South of Baghdad: borders Baghdad north, Wasit east, Qadisiyyah west-south, Karbala west
    path: 'M368 355 L382 315 L400 332 L425 338 L448 332 L462 348 L468 372 L460 400 L440 415 L415 420 L390 412 L370 395 Z',
    label: { x: 414, y: 382, lines: ['بابل'], fontSize: 12 },
  },
  karbala: {
    id: 'karbala',
    name: 'Karbala',
    nameAr: 'كربلاء',
    x: 328,
    y: 388,
    // West of Babil: borders Anbar west, Najaf south, Babil east, Baghdad north
    path: 'M322 355 L328 322 L345 300 L370 295 L382 315 L368 355 L370 395 L358 418 L338 428 L315 422 L300 402 L295 378 L305 358 Z',
    label: { x: 268, y: 392, lines: ['كربلاء'], fontSize: 11, outside: true, leaderTo: { x: 330, y: 390 } },
  },
  wasit: {
    id: 'wasit',
    name: 'Wasit',
    nameAr: 'واسط',
    x: 510,
    y: 390,
    // Eastern central: borders Diyala north, Iran east, Maysan south, Dhi Qar south-west, Qadisiyyah west, Babil west
    path: 'M485 270 L512 260 L528 285 L552 302 L578 310 L605 308 L630 298 L645 325 L648 360 L638 395 L618 418 L592 430 L564 432 L538 422 L515 405 L495 382 L482 355 L468 318 L468 372 L462 348 L448 332 Z',
    label: { x: 558, y: 368, lines: ['واسط'], fontSize: 13 },
  },
  najaf: {
    id: 'najaf',
    name: 'Najaf',
    nameAr: 'النجف',
    x: 282,
    y: 490,
    // Borders Anbar west, Karbala north, Qadisiyyah east, Muthanna south, Saudi Arabia south-west
    path: 'M152 458 L195 452 L238 438 L275 415 L300 402 L315 422 L338 428 L342 458 L335 492 L318 518 L295 535 L265 542 L232 535 L200 515 L174 488 L155 462 Z',
    label: { x: 270, y: 488, lines: ['النجف'], fontSize: 15 },
  },
  qadisiyyah: {
    id: 'qadisiyyah',
    name: 'Qadisiyyah',
    nameAr: 'القادسية',
    x: 398,
    y: 462,
    // Borders Babil north, Wasit east, Dhi Qar south-east, Muthanna south, Najaf west
    path: 'M368 420 L390 412 L415 420 L440 415 L460 400 L468 372 L482 355 L495 382 L498 412 L492 445 L475 468 L452 482 L425 488 L400 482 L378 465 L360 448 L355 428 L358 418 L368 420 Z',
    label: { x: 428, y: 450, lines: ['القادسية'], fontSize: 11 },
  },
  muthanna: {
    id: 'muthanna',
    name: 'Muthanna',
    nameAr: 'المثنى',
    x: 335,
    y: 578,
    // Large southern: borders Najaf north, Qadisiyyah north-east, Dhi Qar east, Basra south-east, Saudi Arabia south, Karbala/Anbar west
    path: 'M232 535 L265 542 L295 535 L318 518 L335 492 L342 458 L355 428 L360 448 L378 465 L400 482 L405 515 L400 552 L385 582 L360 604 L330 615 L295 612 L262 600 L235 578 L215 548 L212 518 Z',
    label: { x: 318, y: 558, lines: ['المثنى'], fontSize: 14 },
  },
  dhi_qar: {
    id: 'dhi_qar',
    name: 'Dhi Qar',
    nameAr: 'ذي قار',
    x: 455,
    y: 520,
    // Borders Wasit north-east, Qadisiyyah west, Muthanna south-west, Basra south-east, Maysan east
    path: 'M452 482 L475 468 L492 445 L498 412 L515 405 L538 422 L552 442 L555 472 L545 505 L525 528 L500 545 L472 550 L445 542 L422 522 L408 498 L405 515 L400 482 L425 488 Z',
    label: { x: 480, y: 510, lines: ['ذي قار'], fontSize: 13 },
  },
  maysan: {
    id: 'maysan',
    name: 'Maysan',
    nameAr: 'ميسان',
    x: 575,
    y: 455,
    // Borders Iran east, Wasit north, Dhi Qar west-south, Basra south
    path: 'M564 432 L592 430 L618 418 L638 395 L648 360 L660 385 L665 420 L660 458 L645 488 L622 508 L595 520 L568 522 L545 505 L555 472 L552 442 L538 422 Z',
    label: { x: 602, y: 462, lines: ['ميسان'], fontSize: 13 },
  },
  basra: {
    id: 'basra',
    name: 'Basra',
    nameAr: 'البصرة',
    x: 510,
    y: 618,
    // Southern-most: Gulf coast, borders Maysan north, Dhi Qar west-north, Muthanna west, Kuwait south-east
    path: 'M408 498 L422 522 L445 542 L472 550 L500 545 L525 528 L545 505 L568 522 L595 520 L622 508 L645 488 L655 518 L658 555 L648 592 L628 622 L598 645 L562 658 L525 660 L490 648 L460 628 L438 600 L420 568 L405 540 L405 515 Z',
    label: { x: 518, y: 598, lines: ['البصرة'], fontSize: 16 },
  },
};

export const provinceList = Object.values(provinces);

export function getProvince(id: string): Province | undefined {
  return provinces[id];
}

export function getDistance(from: Province, to: Province): number {
  return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
}

/** Quadratic bezier curved path from one province center to another */
export function getCurvedPath(from: Province, to: Province): string {
  const dist = getDistance(from, to);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // perpendicular offset — curves the line away from straight
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const nx = -dy;
  const ny = dx;
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  const offset = Math.min(dist * 0.35, 100);

  const cpX = midX + (nx / len) * offset;
  const cpY = midY + (ny / len) * offset;

  return `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;
}
