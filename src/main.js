import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene, CharSelectScene } from './scenes/MenuScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { StageScene } from './scenes/StageScene.js';
import { WinScene } from './scenes/WinScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000010',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    CharSelectScene,
    WorldMapScene,
    StageScene,
    WinScene,
    GameOverScene,
  ],
};

new Phaser.Game(config);
