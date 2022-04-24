/**
 * Round model
 */
 class Round {
    constructor(data = {}) {
      this.blackCard = null;
      this.roundNr = null;
      this.playersChoices = null;
      this.winner = null;
      Object.assign(this, data);
    }
  }
  
  export default Round;
  