/**
 * Player model
 */
class Player {
  constructor(data = {}) {
    this.isCardCzar = null;
    this.roundsWon = null;
    this.whiteCards = null;
    Object.assign(this, data);
  }
}

export default Player;
