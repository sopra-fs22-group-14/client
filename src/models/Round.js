/**
 * Round model
 */
 class Round {
    constructor(data = {}) {
      this.blackCard = null;
      this.roundNr = null;
      this.playedCards = null;
      Object.assign(this, data);
    }
  }
  
  export default Round;
  