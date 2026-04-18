// Level data for all 5 stages
// Row format: string of 100 characters (or 60 for boss)
// ' '=empty, 'G'=ground, 'B'=brick, '?'=question, 'H'=hard block, 'S'=server, 'c'=coin, 'P'=powerup

function row(width, fills) {
  const arr = Array(width).fill(' ');
  fills.forEach(([pos, ch, count = 1]) => {
    for (let i = 0; i < count; i++) {
      if (pos + i < width) arr[pos + i] = ch;
    }
  });
  return arr.join('');
}

function solidRow(width, ch = 'G') {
  return ch.repeat(width);
}

// ─── STAGE 0 ─── Inicio del Sistema (Easy) ────────────────────────────────
const STAGE_0 = {
  name: 'Inicio del Sistema',
  subtitle: 'Mundo Intranet · Etapa 1',
  width: 100,
  bgColors: { sky: 0x5c94fc, ground: 0x54a030, detail: 0x2244aa },
  timeLimit: 400,
  rows: [
    row(100, []),                                                              // 0 sky
    row(100, []),                                                              // 1 sky
    row(100, [[15,'c',3],[35,'c',3],[55,'c',3],[75,'c',3]]),                  // 2 coins
    row(100, [[14,'?'],[19,'?'],[34,'?'],[39,'?'],[54,'?'],[59,'?'],[74,'?'],[79,'?']]),  // 3 ?blocks
    row(100, []),                                                              // 4 sky
    row(100, [[22,'H',6],[46,'H',6],[70,'H',6]]),                             // 5 platforms
    row(100, [[22,'c',6],[46,'c',6],[70,'c',6]]),                             // 6 coins on platforms... actually these are above platforms, but platforms are at row 5 so let me rethink
    row(100, []),                                                              // 7 sky
    row(100, []),                                                              // 8 sky
    row(100, []),                                                              // 9 sky
    row(100, [                                                                 // 10 ground with gaps
      [0,'G',8],[11,'G',16],[30,'G',20],[53,'G',17],[73,'G',24],[99,'|']
    ]),
    solidRow(100, 'G'),                                                        // 11 solid ground
  ],
  enemies: [
    { type: 'wifi', x: 14,  y: 9 },
    { type: 'wifi', x: 25,  y: 9 },
    { type: 'wifi', x: 40,  y: 9 },
    { type: 'wifi', x: 63,  y: 9 },
    { type: 'wifi', x: 82,  y: 9 },
  ],
  playerStart: { x: 3, y: 9 },
};

// Fix row 6: coins above platforms should be on row 4
STAGE_0.rows[4] = row(100, [[22,'c',6],[46,'c',6],[70,'c',6]]);
STAGE_0.rows[6] = row(100, []);

// ─── STAGE 1 ─── Red de Datos (Medium-Easy) ───────────────────────────────
const STAGE_1 = {
  name: 'Red de Datos',
  subtitle: 'Mundo Intranet · Etapa 2',
  width: 100,
  bgColors: { sky: 0x4a7acc, ground: 0x3d8a2a, detail: 0x1a3388 },
  timeLimit: 350,
  rows: [
    row(100, []),                                                              // 0
    row(100, [[12,'c',4],[40,'c',3],[65,'c',4],[85,'c',2]]),                  // 1 high coins
    row(100, [[11,'?'],[16,'?'],[39,'?'],[43,'?'],[64,'?'],[70,'?'],[84,'?']]),// 2 ?blocks
    row(100, []),                                                              // 3
    row(100, [[20,'H',8],[50,'B',6],[75,'H',5]]),                             // 4 platforms
    row(100, [[20,'c',8],[50,'c',6],[75,'c',5]]),                             // 5 coins on platforms
    row(100, [[30,'B',5],[60,'H',4]]),                                        // 6 mid platforms
    row(100, []),                                                              // 7
    row(100, [[8,'S'],[9,'S'],[42,'S'],[43,'S'],[72,'S'],[73,'S']]),          // 8 server towers
    row(100, []),                                                              // 9
    row(100, [                                                                 // 10 ground
      [0,'G',7],[10,'G',13],[26,'G',7],[36,'G',10],[49,'G',15],[67,'G',12],[82,'G',16],[99,'|']
    ]),
    solidRow(100, 'G'),                                                        // 11
  ],
  enemies: [
    { type: 'wifi', x: 12,  y: 9 },
    { type: 'bug',  x: 30,  y: 9 },
    { type: 'wifi', x: 44,  y: 9 },
    { type: 'bug',  x: 60,  y: 9 },
    { type: 'wifi', x: 70,  y: 9 },
    { type: 'bug',  x: 87,  y: 9 },
  ],
  playerStart: { x: 3, y: 9 },
};

// ─── STAGE 2 ─── Centro de Datos (Medium) ─────────────────────────────────
const STAGE_2 = {
  name: 'Centro de Datos',
  subtitle: 'Mundo Intranet · Etapa 3',
  width: 100,
  bgColors: { sky: 0x1a2040, ground: 0x282828, detail: 0x0a0a20 },
  timeLimit: 300,
  rows: [
    row(100, []),                                                              // 0
    row(100, [[10,'c',3],[35,'c',5],[60,'c',3],[80,'c',4]]),                  // 1
    row(100, [[9,'?'],[13,'?'],[34,'?'],[40,'?'],[59,'?'],[63,'?'],[79,'P'],[84,'?']]),// 2
    row(100, []),                                                              // 3
    row(100, [[15,'H',10],[42,'B',8],[70,'H',7]]),                            // 4
    row(100, []),                                                              // 5
    row(100, [[25,'H',6],[55,'B',5],[78,'H',4]]),                             // 6
    row(100, []),                                                              // 7
    row(100, [[5,'S'],[6,'S'],[20,'S'],[21,'S'],[50,'S'],[51,'S'],[75,'S'],[76,'S']]),// 8
    row(100, []),                                                              // 9
    row(100, [                                                                 // 10 ground
      [0,'G',6],[9,'G',10],[22,'G',8],[33,'G',9],[45,'G',9],[57,'G',10],[70,'G',8],[81,'G',17],[99,'|']
    ]),
    solidRow(100, 'G'),
  ],
  enemies: [
    { type: 'wifi',  x: 10,  y: 9 },
    { type: 'bug',   x: 24,  y: 9 },
    { type: 'phone', x: 36,  y: 9 },
    { type: 'bug',   x: 50,  y: 9 },
    { type: 'phone', x: 64,  y: 9 },
    { type: 'wifi',  x: 75,  y: 9 },
    { type: 'bug',   x: 88,  y: 9 },
    { type: 'phone', x: 94,  y: 9 },
  ],
  playerStart: { x: 3, y: 9 },
};

// ─── STAGE 3 ─── Sala de Servidores (Hard) ────────────────────────────────
const STAGE_3 = {
  name: 'Sala de Servidores',
  subtitle: 'Mundo Intranet · Etapa 4',
  width: 100,
  bgColors: { sky: 0x0d0d20, ground: 0x1a1a1a, detail: 0x000010 },
  timeLimit: 250,
  rows: [
    row(100, []),                                                              // 0
    row(100, [[8,'c',4],[30,'c',3],[55,'c',3],[78,'c',4]]),                   // 1
    row(100, [[7,'?'],[12,'?'],[29,'B',5],[34,'?'],[54,'?'],[60,'?'],[77,'P'],[82,'?']]),// 2
    row(100, [[17,'H',6],[43,'B',8],[68,'H',7]]),                             // 3
    row(100, []),                                                              // 4
    row(100, [[10,'H',5],[35,'B',4],[55,'H',5],[80,'H',4]]),                  // 5
    row(100, []),                                                              // 6
    row(100, [[20,'B',6],[45,'H',5],[70,'B',6]]),                             // 7
    row(100, [[3,'S'],[4,'S'],[18,'S'],[19,'S'],[40,'S'],[41,'S'],[63,'S'],[64,'S'],[85,'S'],[86,'S']]),// 8
    row(100, []),                                                              // 9
    row(100, [                                                                 // 10 ground (harder gaps)
      [0,'G',5],[8,'G',8],[19,'G',6],[28,'G',7],[38,'G',5],[46,'G',9],[58,'G',7],[68,'G',8],[79,'G',5],[87,'G',11],[99,'|']
    ]),
    solidRow(100, 'G'),
  ],
  enemies: [
    { type: 'wifi',  x: 9,  y: 9 },
    { type: 'bug',   x: 20, y: 9 },
    { type: 'phone', x: 30, y: 9 },
    { type: 'drone', x: 37, y: 6 },
    { type: 'bug',   x: 48, y: 9 },
    { type: 'phone', x: 59, y: 9 },
    { type: 'drone', x: 63, y: 6 },
    { type: 'wifi',  x: 70, y: 9 },
    { type: 'bug',   x: 80, y: 9 },
    { type: 'phone', x: 89, y: 9 },
    { type: 'drone', x: 92, y: 6 },
  ],
  playerStart: { x: 3, y: 9 },
};

// ─── STAGE 4 ─── Crisis del Sistema - BOSS ────────────────────────────────
const STAGE_4 = {
  name: 'Crisis del Sistema',
  subtitle: 'Mundo Intranet · JEFE FINAL',
  width: 60,
  bgColors: { sky: 0x050510, ground: 0x0a0a0a, detail: 0x020208 },
  timeLimit: 200,
  rows: [
    row(60, []),                                                               // 0
    row(60, []),                                                               // 1
    row(60, [[10,'H',5],[20,'H',5],[30,'H',5],[40,'H',5]]),                   // 2 platforms
    row(60, []),                                                               // 3
    row(60, [[5,'H',8],[25,'H',8],[45,'H',8]]),                               // 4 platforms
    row(60, []),                                                               // 5
    row(60, []),                                                               // 6
    row(60, []),                                                               // 7
    row(60, []),                                                               // 8
    row(60, []),                                                               // 9
    row(60, [[0,'G',60]]),                                                     // 10 solid
    solidRow(60, 'G'),                                                         // 11 solid
  ],
  enemies: [],
  boss: { x: 50, y: 8 },
  playerStart: { x: 3, y: 9 },
};

export const LEVELS = [STAGE_0, STAGE_1, STAGE_2, STAGE_3, STAGE_4];
