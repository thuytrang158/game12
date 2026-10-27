import Phaser from 'phaser';

/** Small hand-painted canvas assets, rendered with the game's nearest-neighbour scaling. */
export function registerLakeArt(scene: Phaser.Scene) {
  const texture = (key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) return;
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const c = canvas.getContext('2d')!; c.imageSmoothingEnabled = false; paint(c);
    scene.textures.addCanvas(key, canvas);
  };
  const box = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => { c.fillStyle = color; c.fillRect(x,y,w,h); };
  const polygon = (c: CanvasRenderingContext2D, color: string, points: number[][]) => {
    c.fillStyle = color; c.beginPath(); points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill();
  };
  const roof = (c: CanvasRenderingContext2D, x: number, y: number, w: number, color = '#795440') => {
    polygon(c,'#3c4235',[[x-7,y+24],[x+w/2,y-8],[x+w+7,y+24]]);
    polygon(c,color,[[x-12,y+14],[x+w/2,y-13],[x+w+12,y+14],[x+w,y+23],[x,y+23]]);
    box(c,'#d7b578',x-10,y+15,w+20,4);
    for(let i=10;i<w;i+=14) box(c,'#aa7750',x+i,y+7,5,10);
  };
  texture('lake_tree', 76, 106, c => {
    box(c,'#384a37',9,83,58,12); box(c,'#5b4834',33,42,11,57); box(c,'#b29354',40,55,4,41);
    for(const [x,y,w,h,color] of [[18,9,42,29,'#345c43'],[6,26,62,30,'#31543e'],[0,48,76,30,'#274b3a'],[12,24,25,12,'#5a8150'],[35,14,14,9,'#87a15d'],[37,45,28,13,'#547a48'],[8,56,28,11,'#416c47']] as const) box(c,color,x,y,w,h);
  });
  texture('lake_gate', 194, 126, c => {
    for (const x of [24,150]) { box(c,'#405749',x,32,18,91); box(c,'#c8bb8a',x+4,37,10,81); box(c,'#ece0ae',x-5,112,28,11); }
    roof(c,7,27,180,'#725942'); box(c,'#294939',46,44,105,28); box(c,'#dfc27d',52,48,92,3);
    box(c,'#e2d1a1',65,57,64,4); box(c,'#b6a575',82,66,31,3);
  });
  texture('lake_palace', 222, 178, c => {
    box(c,'#3b4d46',14,67,195,103);
    for(let i=0;i<7;i++) box(c,i%2?'#67786a':'#596c60',8+i*29,40+(i%3)*9,35,43);
    polygon(c,'#496153',[[12,70],[39,25],[84,39],[111,11],[160,26],[213,57],[218,92],[11,92]]);
    for(let i=0;i<5;i++)box(c,'#88a077',37+i*33,44+(i%2)*9,16,6);
    polygon(c,'#152d2c',[[72,165],[72,106],[91,80],[129,80],[150,106],[150,165]]);
    box(c,'#b4a46b',66,100,8,66);box(c,'#b4a46b',148,100,8,66);box(c,'#cfbd81',75,81,73,8);
    box(c,'#75988c',79,128,62,38);box(c,'#b0d6c0',84,137,17,3);box(c,'#263f40',98,100,22,29);
    for(let i=0;i<4;i++)box(c,'#a9a281',54-i*10,163+i*3,114+i*20,4);
  });
  texture('lake_pagoda', 244, 260, c => {
    box(c,'#8b875f',36,222,176,17);box(c,'#d8bb76',45,211,158,13);
    polygon(c,'#a99654',[[76,169],[87,111],[101,99],[143,99],[159,120],[172,169]]);
    box(c,'#dac780',101,63,43,40);box(c,'#b9aa69',97,49,51,22);box(c,'#81774f',99,44,47,12);
    box(c,'#2f5144',108,75,7,3);box(c,'#2f5144',131,75,7,3);box(c,'#ad9556',118,91,12,3);
    polygon(c,'#decd86',[[71,165],[95,128],[122,147],[148,128],[174,165],[159,181],[85,181]]);
    roof(c,45,191,159,'#886344');
    box(c,'#d6c192',56,213,137,35);for(const x of [63,104,144,184])box(c,'#725d3c',x,213,5,35);
    box(c,'#203a31',111,218,29,30);box(c,'#bda775',36,247,175,5);
    for(let i=0;i<3;i++)box(c,'#d6c18a',87-i*7,252+i*2,76+i*14,3);
  });
  texture('lake_house', 172, 130, c => {
    box(c,'#5a4937',24,53,125,57);box(c,'#d8be80',29,56,115,6);roof(c,15,37,143,'#755f4c');
    for(const x of [32,65,101,138])box(c,'#a98f5e',x,62,6,50);
    box(c,'#1c362f',71,65,27,45);box(c,'#3a4a36',41,71,17,22);box(c,'#3a4a36',111,71,18,22);
    for(let i=0;i<4;i++)box(c,'#abb49b',52-i*9,110+i*4,68+i*18,4);
  });
  texture('lake_market', 160, 120, c => {
    for(const x of [20,136])box(c,'#65533b',x,31,6,72);
    polygon(c,'#9a6744',[[10,41],[29,12],[131,12],[152,41]]);
    for(let i=0;i<9;i++)box(c,i%2?'#ae8151':'#d4b275',10+i*16,38,15,14);
    box(c,'#91704a',13,84,137,26);box(c,'#d6bb82',10,82,143,6);
    for(let i=0;i<4;i++){box(c,'#44684e',25+i*28,65,17,16);box(c,'#b3bd81',27+i*28,66,13,4);}
  });
  texture('lake_dam', 310, 162, c => {
    polygon(c,'#516c66',[[12,37],[288,37],[310,133],[0,133]]);box(c,'#c8c7aa',8,28,293,18);
    for(let i=0;i<6;i++){box(c,'#9ba797',20+i*48,48,30,69);box(c,'#1d5359',24+i*48,53,22,55);box(c,'#a0d6ce',27+i*48,67,14,75);}
    box(c,'#d5d5ba',0,133,310,10);box(c,'#aeb79e',0,147,310,5);
    for(let i=0;i<13;i++)box(c,'#d2c795',i*25,9,4,20);box(c,'#e6d5a3',0,8,310,4);
  });
  texture('lake_boat', 96, 56, c => {
    polygon(c,'#172f2c',[[2,27],[18,7],[73,7],[94,27],[73,49],[18,49]]);
    polygon(c,'#bf935b',[[5,26],[21,10],[71,10],[88,26],[71,43],[21,43]]);
    box(c,'#e5c68d',26,16,43,23);box(c,'#4d7466',31,19,31,17);box(c,'#f1deac',26,13,43,5);
    box(c,'#b2623f',39,20,14,10);box(c,'#ffd68d',43,17,7,7);box(c,'#593e2a',21,23,6,10);
  });
  texture('lake_bird', 32, 24, c => {
    polygon(c,'#eff1ce',[[0,12],[7,6],[14,12],[17,5],[22,5],[22,10],[31,11],[22,14],[17,13],[12,17],[7,10]]);
    box(c,'#d2aa68',18,17,2,6);box(c,'#d2aa68',13,17,2,6);box(c,'#264b43',20,7,2,2);
  });
}

/** Original vector illustrations for exhibits and downloadable in-game postcards. */
export function lakeIllustration(kind = 'lake', light = 'morning', caption = ''): string {
  const sunset = light === 'sunset';
  const sky = sunset ? '#efb87c' : '#d2e7d3', water = sunset ? '#6e9a87' : '#579995';
  const safeCaption = caption.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  const building = kind === 'pagoda' ? '<path d="M520 178h150v38H520z" fill="#d6c59a"/><path d="m500 177 95-32 95 32-10 10H510z" fill="#785b43"/><path d="M563 146v-50h64v50" fill="#c6b174"/><circle cx="595" cy="78" r="19" fill="#d6c181"/><path d="m553 145 13-39h59l16 39" fill="#c5af68"/>'
    : kind === 'island' ? '<path d="M510 183h145v49H510z" fill="#a18a60"/><path d="m495 181 86-39 88 39-9 9H504z" fill="#665747"/><path d="M566 197h27v35h-27z" fill="#283f34"/><path d="M460 242v-46h12v46m55 0v-46h12v46" fill="#c5b57d"/><path d="m446 196 52-21 52 21-8 9h-88z" fill="#695643"/>'
    : kind === 'history' ? '<path d="m500 183 250-18 38 72-302 8z" fill="#9baea0"/><path d="m499 185 257-18" stroke="#ddd6b0" stroke-width="8"/><g stroke="#bfe3d7" stroke-width="13"><path d="m533 203 0 35m43-38v37m44-40v37m45-40v36m42-40v36"/></g>'
    : kind === 'palace' ? '<path d="m489 230 9-78 38-38 43 8 32-25 66 18 36 54 1 61z" fill="#4b6d5c"/><path d="M567 232v-48a35 35 0 0 1 70 0v48" fill="#173a39"/><path d="m576 221 50-6" stroke="#91c4ad" stroke-width="5"/>'
    : kind === 'before' ? '<path d="M0 265q170-110 350-25t530-25v115H0z" fill="#839962"/><path d="M300 330q-18-84 120-107t55-59" fill="none" stroke="#88b4a2" stroke-width="25"/>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 330" role="img" aria-label="Minh họa cách điệu Hồ Núi Cốc"><rect width="880" height="330" fill="${sky}"/><circle cx="712" cy="67" r="29" fill="#f6dc9c"/><path d="M0 139 85 63l99 62L304 34l116 102 93-65 147 70 82-71 138 76v120H0z" fill="#91afa0"/><path d="m0 174 145-70 94 56 122-56 124 75 117-40 124 38 154-54v131H0z" fill="#658e78"/><rect y="195" width="880" height="135" fill="${water}"/><path d="M0 228q72-80 187-33l72 30q-116 18-259 27m404-21q78-52 172-20l66 24q-144 24-238-4" fill="#446c4b"/><g fill="#355f46"><path d="m89 199 18-55 19 55zm46 2 17-44 17 44zm346 17 16-40 15 40z"/></g>${building}<g fill="none" stroke="#b9d6b6" stroke-width="2" opacity=".5"><path d="M25 274h117m39 26h87m75-33h84m256 22h106m-277 22h64"/></g><g transform="translate(292 263)"><path d="m0 0 102 0-18 15H19z" fill="#5a4f36"/><path d="M24-19h52v19H24z" fill="#e4ce8d"/><path d="m17-19 14-8h43l11 8z" fill="#626b46"/></g><g fill="none" stroke="#355c4b" stroke-width="2"><path d="m321 81 7-4 7 4 7-4 7 4m41 13 6-4 6 4 6-4 6 4"/></g>${caption ? `<rect y="297" width="880" height="33" fill="#183d35" fill-opacity=".85"/><text x="440" y="319" text-anchor="middle" fill="#f9e6b8" font-family="sans-serif" font-size="15">${safeCaption}</text>` : ''}</svg>`;
}
