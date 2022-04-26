import React, {useState, useEffect, useRef} from 'react';
import {useInterval} from 'helpers/utils';
import {api, catchError} from 'helpers/api';
import Player from 'models/Player';
import Round from 'models/Round';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {Confetti} from 'components/ui/Confetti';
import 'styles/views/GameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';

const GameView = () => {
  const { gameId } = useParams();
  const history = useHistory();
  const didMount = useRef(false);

  // COMMENT Player data:
  const [player, setPlayer] = useState(null);

  // COMMENT Round data: 
  const [blackCard, setBlackCard] = useState(null);
  const [roundNr, setRoundNr] = useState(1);
  const [playersChoices, setPlayersChoices] = useState(null);  // cards that were played in this round
  const [roundWinner, setRoundWinner] = useState(null);
  const [roundWinningCard, setRoundWinningCard] = useState(null); // TODO needed?
  const [countdown, setCountdown] = useState(0);
  
  // COMMENT Game data:
  const [cardsPlayed, setCardsPlayed] = useState(0); // if this is > 0 then button is disabled till next round 
  // const [scores, setScores] = useState(null); 
  const [gameWinner, setGameWinner] = useState(null); // TDOO needed?

  // keep track of which card was selected - ID of the card
  // COMMENT they have to be reset to null when a new round starts! -> see "if (didMount.current) {...}"
  const [chosenCard, setChosenCard] = useState(null);
  const [chosenWinner, setChosenWinner] = useState(null);

  // variables to temporarily store information of a new round
  let roundNumberVariable = roundNr;
  let blackCardVariable = blackCard;

  // ------------------- Container for all cards ------------------------------
  const Card = props => {
    let className;
    if (props.cardId === chosenCard || props.cardId === chosenWinner) className = "card focused";
    // else if (props.cardId === chosenCard && cardsPlayed > 0 ) {
    //     //  TODO this card should stay makred as green 
    //     //  TODO create a css which is marked as green 
    // }
    else className = props.isBlack ? "blackCard" : "card";
    // BLACK CARD
    if (props.isBlack) {
      return (
        <div className={className}>
          {props.text}
        </div>
      );
    }
    // WHITE CARD
    if(props.isChoice && props.role === true){
      return(
        <button className={className} onClick={() => setChosenWinner(props.cardId)}>
        {props.text}
        </button>
      );
    }
    else if(props.isChoice && props.role === false){
      return(
        <button className="notActiveCard" disabled>
        {props.text}
        </button>
      );
    }
    else if(!props.isChoice && props.role === true){
      return(
        <button className="notActiveCard" disabled>
        {props.text}
        </button>
      );
    }
    else if(!props.isChoice && props.role === false){
      return(
        <button className={className} onClick={() => setChosenCard(props.cardId)}>
        {props.text}
        </button>
      );
    }
  };

  Card.propTypes = {
    isBlack: PropTypes.bool,
    isChoice: PropTypes.bool, 
    text: PropTypes.string,
    role: PropTypes.bool
  };
  // ---------------------------------------------------------------------------
  // useEffect to initially get the round data - at the page load, so that we can display blackCard
  // fist this one is called then fetchData for player then other fetchData with didMount
  useEffect(() => {
    fetchRoundData();
  }, []);

  /*
   useEffect used to always fetch new Player-data (white cards & role) 
   whenever a new round starts (so when roundNr changes!) OR when
   a card was played (to only display 9 white cards)
  */
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/player');
        const player = new Player(response.data);
        setPlayer(player);
      } catch (error) {
        catchError(history, error, 'fetching the player data');
      }
    }
    fetchData();
  }, [roundNr, cardsPlayed]);


  /*
  As soon as the roundWinner changes (therefore, was decided from the Card Czar),
  a countdown of 10 seconds will start. 
  */
  useEffect(() => {
    // DO NOT include 10 second countown when mounting (render immediately)
    if (!didMount.current) {
      didMount.current = true;
      setRoundNr(roundNumberVariable);  // this will also trigger the useEffect to fetch the player data
      setBlackCard(blackCardVariable);
      setCardsPlayed(0); // COMMENT  - enable the submit button again
    } else {
      // this will trigger the useEffect for the countdown
      setCountdown(15);

      setChosenCard(null);
      setChosenWinner(null);
    }
  }, [roundWinner]);


  /*
  useEffect for the 10 second countdown before new round starts.
  After that, the information of the new round will be rendered!
  */
  useEffect(() => {
    if (countdown > 0) {
      // for 10 seconds, just count down
      setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      // after 10 seconds, update the states from the new round data
      setRoundNr(roundNumberVariable);  // this will also trigger the useEffect to fetch the new player data
      setBlackCard(blackCardVariable);
      setCardsPlayed(0); // COMMENT  - enable the submit button again
    }
  }, [countdown])


  /*
  useInterval is used to periodically fetch data regarding the rounds of the game. 
  This includes things such as the played cards, (so that the played cards from all 
  players are shown), the black card as well as the current round number and even the roundWinner
  */
  useInterval(() => {
    // if new round data is available, display the new data
    fetchRoundData();
  }, 5000);

  const fetchRoundData = async () => {
    try {
      console.log("Fetch round data");
      const response = await api.get(`/${gameId}/gameround`);
      console.log(response.data);
      /*
      in case a new round started, save the important things in variables for now.
      The corresponding states will only be updated after a countdown (see useEffect of the roundWinner)
      */

      // will look something like this:
      roundNumberVariable = response.data.roundId; // TODO wait for backend to actually send roundNr
      blackCardVariable = response.data.blackCard;
      if (blackCard == null) { 
        setBlackCard(blackCardVariable); // COMMENT - called only intially when the blackCard is still null
        setRoundNr(roundNumberVariable);
      }

      // COMMENT - just for testing 
      var dict = {
        0: {cardId: 2123, cardText: 'Crumbs all over the god damn carpet.'},
        1: {cardId: 2332, cardText: 'Grave robbing.'},
        2: {cardId: 2968, cardText: 'The wrath of Vladimir Putin.'}
      };
      setPlayersChoices(dict); 
      // setPlayersChoices(response.data.playersChoices); // TESTME setPlayersChoices
      // TODO wait for backend to actually send round Winner
      // setRoundWinner(response.data.winner); // TESTME setRoundWinner - always update the roundWinner (will trigger useEffect when changing)
    } catch (error) {
      catchError(history, error, 'fetching the round data');
    }
  }


  // method that is called when a player plays a white card
  const playCard = async () => {
    try {
      console.log("Player submitted a card: ", chosenCard);
      // TODO add playCard POST
      /*
      after successfully playing a card, change cardsPlayed so that the useEffect is triggered
      to fetch the playerData. This will then update the white cards (only 9 left)
      */
      setCardsPlayed(cardsPlayed + 1);
    } catch (error) {
      catchError(history, error, 'playing a white card');
    }
  }


  // method that is used when the Card Czar chooses a round winner
  const chooseRoundWinner = async () => {
    try {
      // TODO add chooseRoundWinner POST
      setCardsPlayed(cardsPlayed + 1); // COMMENT to make the submit button disabled after submission
    } catch (error) {
      catchError(history, error, 'choosing the winning card');
    }
  }

  // blurr background if countdown is active 
  const mainClass = countdown === 0 ? 'gameView main' : 'gameView blurryMain';

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (player != null && blackCard != null && playersChoices != null && roundNr != null) {
    content = (
      <div className = {mainClass}>

        <div className="gameView roundSection">
          {"Round "+roundNr}
          {player.cardCzar === false && <p>You are a normal player this round - pick card from hand!</p>}
          {player.cardCzar === true && <p>You are a Card Czar this round - pick played card that you think is best!</p>}
        </div>
        
        {/* TODO display the opponents name - waiting for the endpoint*/}
        <div className="gameView opponentSection center"> 
          <h2>oponnents name 1</h2> 
          <div className="gameView opponentSection tile"></div>
        </div>
        <div className="gameView opponentSection"> 
          <h2>oponnents name 2</h2> 
          <div className="gameView opponentSection tile"></div>
        </div>
        <div className="gameView blackCardSection">
          <Card isBlack={true} isChoice={false} key={blackCard.cardId} text={blackCard.cardText} role={player.cardCzar}/>
        </div>
        <div className="gameView opponentSection"> 
          <h2>oponnents name 3</h2> 
          <div className="gameView opponentSection tile"></div>
        </div>

        {/* Displaying of the roundWinner (small and all the time)*/}
        {/* <div className="gameView roundWinnerSection">
          {roundWinner == null && <h3>Last round was won by: {roundWinner}</h3>}
        </div> */}

        <div className="gameView cardsSection">
          {/* COMMENT - choice section for Card Czar */}
          <div className="gameView choiceSection">
            <h2>Round's played cards:</h2>
            <div className="gameView choiceSection cards">
              {/* COMMENT - makes the card not clickable after submitting */}
              {(cardsPlayed > 0) && 
                <div className="gameView choiceSection cards">
                  <Card isBlack={false} isChoice={false} key={playersChoices[0].cardId} text={playersChoices[0].cardText} role={true}/>
                  <Card isBlack={false} isChoice={false} key={playersChoices[1].cardId} text={playersChoices[1].cardText} role={true}/>
                  <Card isBlack={false} isChoice={false} key={playersChoices[2].cardId} text={playersChoices[2].cardText} role={true}/>
                </div> 
              } 
              {(cardsPlayed == 0) && 
                <div className="gameView choiceSection cards">
                  {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} role={player.cardCzar}/>}
                  {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} role={player.cardCzar}/>}
                  {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} role={player.cardCzar}/>}
                </div> 
              }
              </div>
          </div>


          {/* COMMENT - choice section for normal players */}
          <div className="gameView handSection">
            <h2>Your hand:</h2>
            <div className="gameView whiteCardSection">

              {/* {player.cardsOnHands.map(card => (
              <Card isBlack={false} isChoice={false} key={card.cardId} cardId={card.cardId} text={card.cardText} role={player.cardCzar}/>
              ))} */}

              {/* COMMENT - makes the card not clickable after submitting */}
              {(cardsPlayed > 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={true} key={card.cardId} cardId={card.cardId} text={card.cardText} role={false}/>
                  ))}
                </div> 
              }
              {(cardsPlayed == 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={false} key={card.cardId} cardId={card.cardId} text={card.cardText} role={player.cardCzar}/>
                  ))}
                </div> 
              }
            </div>
            {/* TODO call playCard for the onClick event of the button */}
          </div>
        </div>


        {/* COMMENT - SECTION - if you are normal Player */}
        {player.cardCzar == false && 
          <div className="gameView bottomSection">
            <Button
                width="100%"
                // onClick={() => createGame()} //TODO leave function 
              >
              🥺 Leave game...
            </Button>
            <Button
                disabled = {!chosenCard || (cardsPlayed > 0)}
                width="100%"
                // onClick={() => window.location.reload(false)}
                onClick={() => setChosenCard(null)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenCard || (cardsPlayed > 0)}
                width="100%"
                onClick={() => playCard()} //TODO submit function 
              >
              ✔️ Submit
            </Button>
          </div>
        } 

        {/*COMMENT - SECTION - if you are Card Czar */}
        {player.cardCzar == true && 
          <div className="gameView bottomSection">
            <Button
                width="100%"
                // onClick={() => createGame()} //TODO leave function 
              >
              🥺 Leave game...
            </Button>
            <Button
                disabled = {!chosenWinner || (cardsPlayed > 0)}
                width="100%"
                // onClick={() => window.location.reload(false)}
                onClick={() => setChosenWinner(null)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenWinner || (Object.keys(playersChoices).length != 3) || (cardsPlayed > 0)}
                width="100%"
                onClick={() => chooseRoundWinner()}
              >
              ✔️ Submit
            </Button>
          </div>
        } 
      </div>
    );
  } 
  // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="gameView container">
      {/* Include countdown until new round starts 
      and display the roundWinner in a fancy way while countdown is active*/}
      {countdown != 0 && 
      <div>
        <div className="gameView countdownSection">
          <p>Next round starts in: {countdown}</p>
        </div>
        <div className="gameView countdownSection roundWinner">
          <p>This round was won by: {roundWinner}</p> 
        </div>
        <Confetti/>
      </div>}
      {content}
    </BaseContainer>
  );
};

export default GameView;