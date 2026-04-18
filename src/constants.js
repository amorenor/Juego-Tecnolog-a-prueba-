export const TILE_SIZE = 48;
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 576;
export const ROWS = 12;      // rows of tiles tall
export const GROUND_ROW = 10; // top of ground
export const GRAVITY = 900;
export const PLAYER_SPEED = 280;
export const PLAYER_JUMP = -660;
export const PLAYER_BOUNCE = -420;

// Tile IDs
export const TILES = {
  EMPTY: ' ',
  GROUND: 'G',
  UNDERGROUND: 'g',
  BRICK: 'B',
  QUESTION: '?',
  HARD: 'H',
  SERVER: 'S',
  COIN: 'c',
  POWERUP: 'P',
  EXIT: '|',
};

// Enemy types
export const ENEMY = {
  WIFI: 'wifi',
  BUG: 'bug',
  PHONE: 'phone',
  DRONE: 'drone',
};

// Stage info
export const STAGE_INFO = [
  { name: 'Inicio del Sistema',   subtitle: 'Mundo Intranet · Etapa 1', icon: '📡' },
  { name: 'Red de Datos',         subtitle: 'Mundo Intranet · Etapa 2', icon: '🖥️' },
  { name: 'Centro de Datos',      subtitle: 'Mundo Intranet · Etapa 3', icon: '🔌' },
  { name: 'Sala de Servidores',   subtitle: 'Mundo Intranet · Etapa 4', icon: '💾' },
  { name: 'Crisis del Sistema',   subtitle: 'Mundo Intranet · JEFE FINAL', icon: '⚠️' },
];

// AquaChile brand colors
export const AQUACHILE = {
  BLUE_DARK:  0x003366,
  BLUE_MED:   0x0055aa,
  BLUE_LIGHT: 0x0088dd,
  CYAN:       0x00ccff,
  WHITE:      0xffffff,
  GRAY:       0x888888,
};
