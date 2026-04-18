// Pixel art sprite definitions (16x16 pixels, rendered at 3x = 48px)
// Each row = 16 characters. Each character maps to a color via palette.
// '.' = transparent

// ── PALETTES ──────────────────────────────────────────────────────────────

export const P1_PAL = {
  'H': 0x1d6fa5, // helmet dark blue
  'h': 0x5aaed6, // helmet light blue
  'S': 0xf8c090, // skin
  'e': 0x222222, // eye / dark
  'm': 0xcc5533, // mouth
  'T': 0x1a50d0, // shirt blue
  't': 0x4477ee, // shirt lighter
  'P': 0x0a3080, // pants
  'B': 0x2a1a0a, // boot dark
  'b': 0x5c3a1e, // boot lighter
};

export const P2_PAL = {
  'H': 0xaa3300, // hair dark red
  'h': 0xdd5522, // hair lighter
  'S': 0xf8c090, // skin
  'e': 0x222222, // eye
  'g': 0x333333, // glasses
  'm': 0xcc5533, // mouth
  'T': 0xdd5500, // shirt orange
  't': 0xff7722, // shirt lighter
  'P': 0x882200, // pants
  'B': 0x2a1a0a, // boot dark
  'b': 0x5c3a1e, // boot lighter
};

export const WIFI_PAL = {
  'W': 0x88aaff, // wifi arc
  'w': 0x4466dd, // wifi arc dark
  'G': 0x888888, // body gray
  'g': 0xaaaaaa, // body lighter
  'e': 0xff2222, // angry eyes
  'm': 0x222222, // mouth
  'f': 0x555555, // feet
};

export const BUG_PAL = {
  'D': 0x004400, // shell dark green
  'G': 0x00aa44, // shell green
  'g': 0x44dd88, // shell highlight
  'L': 0x33ff88, // circuit line
  'e': 0xffff00, // eyes yellow
  'm': 0x222222, // mouth
};

export const PHONE_PAL = {
  'D': 0x222222, // phone body dark
  'G': 0x444444, // phone body
  's': 0x001133, // screen dark
  'S': 0x00ff99, // screen bright
  'e': 0xff4400, // angry eyes
  'f': 0x333333, // feet
};

export const DRONE_PAL = {
  'p': 0x888888, // propeller
  'P': 0x555555, // propeller center
  'D': 0x222244, // body dark
  'B': 0x1a50d0, // body blue
  'b': 0x4477ee, // body lighter
  'L': 0x00ff66, // LED
};

export const BOSS_PAL = {
  'D': 0x111122, // server dark
  'B': 0x1a2050, // server body
  'b': 0x2a3080, // server lighter
  'L': 0x00ff44, // LED green
  'R': 0xff2200, // LED red / error
  'Y': 0xffaa00, // LED yellow
  'S': 0x888888, // steel gray
  's': 0xaaaaaa, // steel lighter
  'e': 0xff0000, // angry light
  'V': 0x444455, // vent
};

// ── PLAYER 1 FRAMES ────────────────────────────────────────────────────────

export const P1_STAND = [
  '....HHHHH.......',
  '...HHhhhhHH.....',
  '..HHhHHHhHH.....',
  '..SSSSSSSSSS....',
  '..SeSSSSSSeS....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '..PPPPPPPPP.....',
  '..PP.....PP.....',
  '..PP.....PP.....',
  '..BB.....BB.....',
  '..Bb.....bB.....',
  '................',
  '................',
];

export const P1_WALK1 = [
  '....HHHHH.......',
  '...HHhhhhHH.....',
  '..HHhHHHhHH.....',
  '..SSSSSSSSSS....',
  '..SeSSSSSSeS....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '.PPPPPPPPPPP....',
  '..PPP...........',
  '..PPP...........',
  '..BBB...........',
  '..bBb...........',
  '................',
  '................',
];

export const P1_WALK2 = [
  '....HHHHH.......',
  '...HHhhhhHH.....',
  '..HHhHHHhHH.....',
  '..SSSSSSSSSS....',
  '..SeSSSSSSeS....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '.PPPPPPPPPPP....',
  '........PPP.....',
  '........PPP.....',
  '........BBB.....',
  '........bBb.....',
  '................',
  '................',
];

export const P1_JUMP = [
  '....HHHHH.......',
  '...HHhhhhHH.....',
  '..HHhHHHhHH.....',
  '..SSSSSSSSSS....',
  '..SeSSSSSSeS....',
  '..SSSmSSSSS.....',
  'TTTTTTTTTTTTTTT.',
  '.TTTTTTTTTTT....',
  '.TTTTTTTTTTT....',
  '..PPPPPPPPP.....',
  '..PP.....PP.....',
  '..BB.....BB.....',
  '................',
  '................',
  '................',
  '................',
];

// ── PLAYER 2 FRAMES ────────────────────────────────────────────────────────
// Player 2 uses same shape, different palette keys for hair vs helmet

export const P2_STAND = [
  '....HHHHHH......',
  '...HHHhhhHH.....',
  '..HHhHHHhHHH....',
  '..SSSSSSSSSS....',
  '..gesSSSSeg.....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '..PPPPPPPPP.....',
  '..PP.....PP.....',
  '..PP.....PP.....',
  '..BB.....BB.....',
  '..Bb.....bB.....',
  '................',
  '................',
];

export const P2_WALK1 = [
  '....HHHHHH......',
  '...HHHhhhHH.....',
  '..HHhHHHhHHH....',
  '..SSSSSSSSSS....',
  '..gesSSSSeg.....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '.PPPPPPPPPPP....',
  '..PPP...........',
  '..PPP...........',
  '..BBB...........',
  '..bBb...........',
  '................',
  '................',
];

export const P2_WALK2 = [
  '....HHHHHH......',
  '...HHHhhhHH.....',
  '..HHhHHHhHHH....',
  '..SSSSSSSSSS....',
  '..gesSSSSeg.....',
  '..SSSmSSSSS.....',
  '.TTTTTTTTTTT....',
  '.TtTTTTTTTtT....',
  '.TTTTTTTTTTT....',
  '.PPPPPPPPPPP....',
  '........PPP.....',
  '........PPP.....',
  '........BBB.....',
  '........bBb.....',
  '................',
  '................',
];

export const P2_JUMP = [
  '....HHHHHH......',
  '...HHHhhhHH.....',
  '..HHhHHHhHHH....',
  '..SSSSSSSSSS....',
  '..gesSSSSeg.....',
  '..SSSmSSSSS.....',
  'TTTTTTTTTTTTTTT.',
  '.TTTTTTTTTTT....',
  '.TTTTTTTTTTT....',
  '..PPPPPPPPP.....',
  '..PP.....PP.....',
  '..BB.....BB.....',
  '................',
  '................',
  '................',
  '................',
];

// ── WIFI WALKER ────────────────────────────────────────────────────────────

export const WIFI_WALK1 = [
  '................',
  '.....WWWWW......',
  '....W.....W.....',
  '.....WW.WW......',
  '......W.W.......',
  '.......W........',
  '.....GGGGG......',
  '....GGGGGGG.....',
  '....GGeGGeGG....',
  '....GGGmmGGG....',
  '....GGGGGGG.....',
  '.....ff.ff......',
  '.....ff.ff......',
  '................',
  '................',
  '................',
];

export const WIFI_WALK2 = [
  '................',
  '.....WWWWW......',
  '....W.....W.....',
  '.....WW.WW......',
  '......W.W.......',
  '.......W........',
  '.....GGGGG......',
  '....GGGGGGG.....',
  '....GGeGGeGG....',
  '....GGGmmGGG....',
  '....GGGGGGG.....',
  '....ff...ff.....',
  '....ff...ff.....',
  '................',
  '................',
  '................',
];

export const WIFI_DEAD = [
  '................',
  '................',
  '................',
  '................',
  '....GGGGGGg.....',
  '...GGGGeGeGG....',
  '...GGGGxGGGG....',
  '..GGGGGGGGGGg...',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ── BUG BOT ────────────────────────────────────────────────────────────────

export const BUG_WALK1 = [
  '..DDDDDDDDDDD...',
  '.DGGGGGGGGGGgD..',
  'DGGgGGGGGGGGGGD.',
  'DGGGLGGGGLGGGGgD',
  'DGGGGGGGGGGGGGgD',
  '.DDDDDDDDDDDDD..',
  '..GGGGGGGGGG....',
  '..GGGeGGeGGG....',
  '..GGGmmmGGG.....',
  'GGG.........GGG.',
  'GG...........GG.',
  '................',
  '................',
  '................',
  '................',
  '................',
];

export const BUG_WALK2 = [
  '..DDDDDDDDDDD...',
  '.DGGGGGGGGGGgD..',
  'DGGgGGGGGGGGGGD.',
  'DGGGLGGGGLGGGGgD',
  'DGGGGGGGGGGGGGgD',
  '.DDDDDDDDDDDDD..',
  '..GGGGGGGGGG....',
  '..GGGeGGeGGG....',
  '..GGGmmmGGG.....',
  '..GGG...GGG.....',
  '.GGG.....GGG....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

export const BUG_DEAD = [
  '................',
  '................',
  'GGG.........GGG.',
  '.DDDDDDDDDDDDD..',
  'DGGgGGGGGGGGGGD.',
  'DGGGxGGGGGxGGGgD',
  'DGGGGGGGGGGGGGgD',
  '.DDDDDDDDDDDDD..',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ── PHONE ZOMBIE ───────────────────────────────────────────────────────────

export const PHONE_WALK1 = [
  '...DDDDDDDDD....',
  '..DGGGGGGGGGDw..',
  '..DsssssssssDw..',
  '..DseSSSSSeSsD..',
  '..DsssssssssD...',
  '..DsSSSSSSssD...',
  '..DsssssssssD...',
  '..DGGGGGGGGD....',
  '...DDDDDDDDD....',
  '....GGGGGGG.....',
  '.....ff.ff......',
  '.....ff.ff......',
  '................',
  '................',
  '................',
  '................',
];

export const PHONE_WALK2 = [
  '...DDDDDDDDD....',
  '..DGGGGGGGGGDw..',
  '..DsssssssssDw..',
  '..DseSSSSSeSsD..',
  '..DsssssssssD...',
  '..DsSSSSSSssD...',
  '..DsssssssssD...',
  '..DGGGGGGGGD....',
  '...DDDDDDDDD....',
  '....GGGGGGG.....',
  '....ff...ff.....',
  '....ff...ff.....',
  '................',
  '................',
  '................',
  '................',
];

export const PHONE_DEAD = [
  '................',
  '................',
  '................',
  '...DDDDDDDDD....',
  '..DGGGGGGGGGDw..',
  '..DssxSSSSxsD...',
  '..DsssssssssD...',
  '...DDDDDDDDD....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ── DATA DRONE ─────────────────────────────────────────────────────────────

export const DRONE_FLY1 = [
  '.pp...pp........',
  '.pP...Pp........',
  '.pp...pp........',
  '..DBBBBBD.......',
  '..DBbbbbD.......',
  '..DBLBbBD.......',
  '..DBbbbbD.......',
  '..DBBBBBD.......',
  '...DDDDD........',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

export const DRONE_FLY2 = [
  '...pp.pp........',
  '...pP.Pp........',
  '...pp.pp........',
  '..DBBBBBD.......',
  '..DBbbbbD.......',
  '..DBLBbBD.......',
  '..DBbbbbD.......',
  '..DBBBBBD.......',
  '...DDDDD........',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ── FINAL BOSS (32x32 = two 16x16 halves, top and bottom) ──────────────────

export const BOSS_TOP = [
  'DBBBBBBBBBBBBBD.',
  'BSSSSSsssSSSSSBD',
  'BsVVVsLsVVVsSBD.',
  'BSssssLsssssSBD.',
  'BsVVVsLsVVVsSBD.',
  'BSssssLsssssSBD.',
  'BsVVVsRsVVVsSBD.',
  'BSssssRsssssSBD.',
  'BsVVVsRsVVVsSBD.',
  'BSssssYsssssSBD.',
  'BsVVVsYsVVVsSBD.',
  'BSssssYsssssSBD.',
  'BsRRsssssssRRsBD',
  'BSSSSSsssSSSSSBD',
  'DBBBBBBBBBBBBBD.',
  'DDDDDDDDDDDDDDDD',
];

export const BOSS_BOTTOM = [
  'DBBBBBBBBBBBBBD.',
  'BSSSSSsssSSSSSBD',
  'BsVVVsLsVVVsSBD.',
  'BSssssLsssssSBD.',
  'BsVVVsLsVVVsSBD.',
  'BSssssLsssssSBD.',
  'BsVVVsLsVVVsSBD.',
  'BSssssLsssssSBD.',
  'BeeeeeeeeeeeeeB.',
  'BeSSSSSSSSSSSeBD',
  'BeSeSeSeSeSeSeBD',
  'BeSSSSSSSSSSSeBD',
  'DBBBBBBBBBBBBBD.',
  'DDDDDDDDDDDDDDDD',
  '................',
  '................',
];

// Projectile (data packet)
export const PROJECTILE_PAL = {
  'Y': 0xffcc00,
  'y': 0xff8800,
  'R': 0xff2200,
};
export const PROJECTILE = [
  '................',
  '................',
  '....YYYYYYY.....',
  '...YyyyyyyyY....',
  '..YyyyRRRyyyY...',
  '..YyyRRRRRyyY...',
  '..YyyyRRRyyyY...',
  '...YyyyyyyyY....',
  '....YYYYYYY.....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];
