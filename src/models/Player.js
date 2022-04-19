/**
 * Player model
 */
class Player {
  constructor(data = {}) {
    this.cardCzar = null; // was isCardCzar
    this.roundsWon = null;
    this.cardsOnHands = null; // was whiteCards
    Object.assign(this, data);
    // @Mapping(source = "playerId", target = "playerId")
    // @Mapping(source = "playerName", target = "playerName")
    // @Mapping(source = "cardCzar", target = "cardCzar")
    // @Mapping(source = "playing", target = "playing")
    // @Mapping(source = "roundsWon", target = "roundsWon")
    // @Mapping(source = "cardsOnHands", target = "cardsOnHands")
  }
}

export default Player;
