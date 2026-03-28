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
 * Province boundaries and center-coordinates mapped onto an
 * 800 × 750 SVG viewBox. Paths are simplified but accurately
 * represent relative positions, shapes, and adjacency.
 */
export const provinces: Record<string, Province> = {
  duhok: {
    id: 'duhok',
    name: 'Duhok',
    nameAr: 'دهوك',
    x: 370,
    y: 60,
    path: 'M330 25 L360 20 L400 30 L420 55 L410 80 L380 90 L345 85 L325 70 L320 45 Z',
    label: { x: 370, y: 12, lines: ['دهوك'], fontSize: 13, outside: true, leaderTo: { x: 370, y: 45 } },
  },
  nineveh: {
    id: 'nineveh',
    name: 'Nineveh',
    nameAr: 'نينوى',
    x: 310,
    y: 115,
    path: 'M230 60 L280 45 L325 45 L325 70 L345 85 L380 90 L370 120 L355 145 L320 160 L280 155 L250 140 L230 115 L225 80 Z',
    label: { x: 295, y: 110, lines: ['نينوى'], fontSize: 16 },
  },
  erbil: {
    id: 'erbil',
    name: 'Erbil',
    nameAr: 'أربيل',
    x: 430,
    y: 95,
    path: 'M380 90 L410 80 L420 55 L460 60 L490 80 L485 110 L465 125 L440 130 L410 125 L385 115 L370 120 Z',
    label: { x: 435, y: 96, lines: ['أربيل'], fontSize: 14 },
  },
  sulaymaniyah: {
    id: 'sulaymaniyah',
    name: 'Sulaymaniyah',
    nameAr: 'السليمانية',
    x: 500,
    y: 145,
    path: 'M440 130 L465 125 L485 110 L490 80 L530 95 L555 120 L560 155 L545 180 L520 185 L490 175 L460 165 L445 150 Z',
    label: { x: 505, y: 140, lines: ['السليمانية'], fontSize: 12 },
  },
  kirkuk: {
    id: 'kirkuk',
    name: 'Kirkuk',
    nameAr: 'كركوك',
    x: 420,
    y: 180,
    path: 'M370 120 L385 115 L410 125 L440 130 L445 150 L460 165 L450 195 L430 210 L400 210 L375 195 L355 175 L355 145 Z',
    label: { x: 406, y: 168, lines: ['كركوك'], fontSize: 13 },
  },
  saladin: {
    id: 'saladin',
    name: 'Saladin',
    nameAr: 'صلاح الدين',
    x: 355,
    y: 220,
    path: 'M280 155 L320 160 L355 145 L355 175 L375 195 L400 210 L395 245 L380 270 L350 275 L310 265 L280 240 L265 210 L260 175 Z',
    label: { x: 325, y: 215, lines: ['صلاح', 'الدين'], fontSize: 13 },
  },
  diyala: {
    id: 'diyala',
    name: 'Diyala',
    nameAr: 'ديالى',
    x: 475,
    y: 260,
    path: 'M400 210 L430 210 L450 195 L460 165 L490 175 L520 185 L535 215 L530 260 L510 290 L480 305 L450 300 L430 280 L395 245 Z',
    label: { x: 478, y: 248, lines: ['ديالى'], fontSize: 14 },
  },
  anbar: {
    id: 'anbar',
    name: 'Anbar',
    nameAr: 'الأنبار',
    x: 210,
    y: 310,
    path: 'M60 180 L120 140 L175 120 L230 115 L250 140 L260 175 L265 210 L280 240 L310 265 L330 290 L325 330 L290 370 L240 400 L180 410 L120 390 L80 350 L55 290 L50 230 Z',
    label: { x: 182, y: 288, lines: ['الأنبار'], fontSize: 18 },
  },
  baghdad: {
    id: 'baghdad',
    name: 'Baghdad',
    nameAr: 'بغداد',
    x: 405,
    y: 310,
    path: 'M380 270 L395 245 L430 280 L450 300 L440 330 L420 345 L395 340 L375 325 L365 300 L350 275 Z',
    label: { x: 400, y: 304, lines: ['بغداد'], fontSize: 12 },
  },
  babil: {
    id: 'babil',
    name: 'Babil',
    nameAr: 'بابل',
    x: 385,
    y: 375,
    path: 'M350 340 L375 325 L395 340 L420 345 L415 380 L405 410 L380 415 L355 400 L340 375 L335 350 Z',
    label: { x: 377, y: 374, lines: ['بابل'], fontSize: 12 },
  },
  karbala: {
    id: 'karbala',
    name: 'Karbala',
    nameAr: 'كربلاء',
    x: 330,
    y: 365,
    path: 'M290 370 L325 330 L350 340 L335 350 L340 375 L355 400 L340 420 L310 415 L285 395 Z',
    label: { x: 268, y: 382, lines: ['كربلاء'], fontSize: 11, outside: true, leaderTo: { x: 312, y: 382 } },
  },
  wasit: {
    id: 'wasit',
    name: 'Wasit',
    nameAr: 'واسط',
    x: 465,
    y: 370,
    path: 'M420 345 L440 330 L450 300 L480 305 L510 290 L520 320 L510 365 L490 390 L460 400 L435 395 L415 380 Z',
    label: { x: 470, y: 350, lines: ['واسط'], fontSize: 13 },
  },
  najaf: {
    id: 'najaf',
    name: 'Najaf',
    nameAr: 'النجف',
    x: 290,
    y: 460,
    path: 'M240 400 L290 370 L285 395 L310 415 L340 420 L345 455 L330 490 L300 510 L260 520 L220 500 L190 460 L180 410 Z',
    label: { x: 275, y: 460, lines: ['النجف'], fontSize: 15 },
  },
  qadisiyyah: {
    id: 'qadisiyyah',
    name: 'Qadisiyyah',
    nameAr: 'القادسية',
    x: 380,
    y: 440,
    path: 'M340 420 L355 400 L380 415 L405 410 L410 440 L400 465 L375 475 L350 465 L345 455 Z',
    label: { x: 374, y: 445, lines: ['القادسية'], fontSize: 11 },
  },
  muthanna: {
    id: 'muthanna',
    name: 'Muthanna',
    nameAr: 'المثنى',
    x: 330,
    y: 545,
    path: 'M260 520 L300 510 L330 490 L345 455 L350 465 L375 475 L380 510 L370 555 L340 585 L300 595 L260 580 L240 545 Z',
    label: { x: 318, y: 542, lines: ['المثنى'], fontSize: 14 },
  },
  dhi_qar: {
    id: 'dhi_qar',
    name: 'Dhi Qar',
    nameAr: 'ذي قار',
    x: 420,
    y: 500,
    path: 'M375 475 L400 465 L410 440 L435 450 L465 460 L470 495 L455 530 L430 545 L400 540 L380 510 Z',
    label: { x: 425, y: 500, lines: ['ذي قار'], fontSize: 13 },
  },
  maysan: {
    id: 'maysan',
    name: 'Maysan',
    nameAr: 'ميسان',
    x: 500,
    y: 460,
    path: 'M460 400 L490 390 L510 365 L540 380 L555 415 L545 455 L520 470 L490 465 L465 460 L435 450 L410 440 L415 380 L435 395 Z',
    label: { x: 505, y: 425, lines: ['ميسان'], fontSize: 13 },
  },
  basra: {
    id: 'basra',
    name: 'Basra',
    nameAr: 'البصرة',
    x: 470,
    y: 575,
    path: 'M380 510 L400 540 L430 545 L455 530 L470 495 L490 465 L520 470 L545 495 L555 540 L540 580 L510 610 L470 630 L430 625 L400 600 L370 555 Z',
    label: { x: 470, y: 568, lines: ['البصرة'], fontSize: 16 },
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
