export const GameState = {
  score: 0,
  lives: 3,
  coins: 0,
  selectedCharacter: 0, // 0 = TecnoMax (azul), 1 = DigiPro (naranja)
  currentStageIndex: 0,
  completedStages: new Set(),
  totalStages: 5,

  reset() {
    this.score = 0;
    this.lives = 3;
    this.coins = 0;
    this.completedStages = new Set();
    this.currentStageIndex = 0;
  },

  addScore(points) {
    this.score += points;
  },

  addCoin() {
    this.coins++;
    this.score += 100;
    if (this.coins >= 100) {
      this.coins -= 100;
      this.lives++;
    }
  },

  loseLife() {
    this.lives--;
    return this.lives <= 0;
  },

  completeStage(index) {
    this.completedStages.add(index);
    this.addScore(5000);
  },

  isCompleted(index) {
    return this.completedStages.has(index);
  },

  isUnlocked(index) {
    if (index === 0) return true;
    return this.completedStages.has(index - 1);
  },

  isAllCompleted() {
    return this.completedStages.size >= this.totalStages;
  },
};
