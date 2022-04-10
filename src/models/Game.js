/**
 * Game model
 */
 class Game {
    constructor(data = {}) {
      this.gameId = null;
      this.gameName = null;
      this.cardCzarMode = null;
      this.gameEdition = null;
      this.numOfPlayersJoined = null;
      Object.assign(this, data);
    }
  }
  export default Game;
  