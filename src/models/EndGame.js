// EndGame model -> GET {gameId}/gameWinner
 class EndGame {
    constructor(data = {}) {
      this.playersNames = null; 
      this.playersNumbersOfPicked = null;
      this.winnersNames = null; 
      this.winnersIds = null;
      Object.assign(this, data);
    }
  }
  export default EndGame;
  