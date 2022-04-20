import React, {useState, useEffect, useRef} from 'react';
import {useInterval} from 'helpers/utils';
import {api, catchError} from 'helpers/api';
import Player from 'models/Player';
import Round from 'models/Round';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/GameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';

const GameView = () => {
  const { gameId } = useParams();
  const history = useHistory();
  const didMount = useRef(false);

  const [player, setPlayer] = useState(null);
  // TODO maybe blackCard, roundNum & choices can be combined in a Round (probably easier to leave it like this)
  const [blackCard, setBlackCard] = useState(null);
  const [roundNr, setRoundNr] = useState(1);
  const [choices, setChoices] = useState(null);
  // const [round, setRound] = useState(null);
  // TODO update this counter whenever a player successfully played a card
  const [cardsPlayed, setCardsPlayed] = useState(0);
  // const [scores, setScores] = useState(null);
  const [winner, setWinner] = useState(null);

  // keep track of which card was selected
  // TODO they have to be reset to null when a new round starts!!
  const [chosenCard, setChosenCard] = useState(null);
  const [chosenWinner, setChosenWinner] = useState(null);

  // variables to temporarily store information of a new round
  let roundNumberVariable = roundNr;
  let blackCardVariable = blackCard;

  // ------------------- Container for all cards ------------------------------
  const Card = props => {
    let className;
    if (props.text === chosenCard || props.text === chosenWinner) className = "card focused";
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
        <button className={className} onClick={() => setChosenWinner(props.text)}>
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
        <button className={className} onClick={() => setChosenCard(props.text)}>
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
   useEffect is used to always fetch new Player-data (white cards & role) 
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
  As soon as the winner changes (therefore, was decided from the Card Czar),
  a countdown of 10 seconds will start. After that, the information of the
  new round will be rendered!
  */
  useEffect(() => {
    async function fetchData() {
      // DO NOT include 10 second countown when mounting (render immediately)
      if (didMount.current) {
        /*
        TODO add a 10 second countdown until the round and blackCard are set and therefore updated
        This is for the players to actually see the winner!
        */
      } else {
        didMount.current = true;
      }
      // TODO setRoundNr & setBlackCard (the STATES)
      setRoundNr(roundNumberVariable);  // this will also trigger the useEffect to fetch the player data
      setBlackCard(blackCardVariable);
      // TODO enable the submit button again
    }
    fetchData();
  }, [winner]);



  /*
  useIntervall is used to periodically fetch data regarding the rounds
  of the game. This includes things such as the played cards, (so that 
  the played cards from all players are shown), the black card as well
  as the current round number and even the winner
  */
  useInterval(() => {
    // if new round data is available, display the new data
    fetchRoundData();
  }, 5000);


  /*
  This method is used to fetch all round relevant information such as
  the choices (played cards), the winner as well as the round number and the black card
  */
  const fetchRoundData = async () => {
    try {
      console.log("Fetch round data");
      const response = await api.get(`/${gameId}/gameround`);
      /*
      in case a new round started, save the important things in variables for now.
      The corresponding states will only be updated after a delay (see useEffect of the winner)
      */

      // will look something like this:
      // roundNumberVariable = response.data.roundNr;
      blackCardVariable = response.data.blackCard;
      if(blackCard == null){ 
        setBlackCard(blackCardVariable); // COMMENT - called only intially when the blackCard is still null
      }
      // TODO setChoices (played Cards) - always update the choices when they change
      // TODO setWinner - always update the winner (will trigger useEffect when changing)
    } catch (error) {
      catchError(history, error, 'fetching the round data');
    }
  }


  // method that is called when a player plays a white card
  const playCard = async () => {
    try {
      // TODO add playCard POST
      /*
      after successfully playing a card, change cardsPlayed so that the useEffect is triggered
      to fetch the playerData. This will then update the white cards (only 9 left)
      */
     // TODO make sure that only 9 cards are visible after playing the card
      setCardsPlayed(cardsPlayed + 1);
      // TODO disable the button after card is played (until new round starts)
    } catch (error) {
      catchError(history, error, 'playing a white card');
    }
  }


  // method that is used when the Card Czar chooses a round winner
  const chooseRoundWinner = async () => {
    try {
      // TODO add chooseRoundWinner POST
    } catch (error) {
      catchError(history, error, 'choosing the winning card');
    }
  }
  
  /*
  TODO display the winner in some sort of textField for all to see
  if (winner == null) don't display anything (only the case when mounting)
  This textfield is not yet included anywhere..
  */
  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (player) {
    content = (
      <div className = "gameView main">

        <div className="gameView roundSection">
          {"Round "+roundNr}
          {player.cardCzar === false && <p>You are a normal player this round - pick card from hand!</p>}
          {player.cardCzar === true && <p>You are a Card Czar this round - pick played card that you think is best!</p>}
        </div>
        
        {/* TODO display the opponents name */}
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


        <div className="gameView cardsSection">
          {/* COMMENT - choice section for Card Czar */}
          <div className="gameView choiceSection">
            <h2>Round's played cards:</h2>
            <div className="gameView choiceSection cards">
              {/* TODO iterate over the choices and display the ones that are available */}
              <Card isBlack={false} isChoice={true} text="CHOICE 1" role={player.cardCzar}/>
              <Card isBlack={false} isChoice={true} text="CHOICE 2" role={player.cardCzar}/>
              <Card isBlack={false} isChoice={true} text="CHOICE 3" role={player.cardCzar}/>
            </div>
                {/* TODO submission is only possible when 3 choices are available*/}
                {/* TODO add chooseRoundWinner for the onClick event */}
          </div>

          {/* COMMENT - choice section for normal players */}
          <div className="gameView handSection">
            <h2>Your hand:</h2>
            <div className="gameView whiteCardSection">
              {player.cardsOnHands.map(card => (
              <Card isBlack={false} isChoice={false} key={card.cardId} text={card.cardText} role={player.cardCzar}/>
              ))}
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
                disabled = {!chosenCard}
                width="100%"
                onClick={() => window.location.reload(false)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenCard}
                width="100%"
                // onClick={() => createGame()}
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
                disabled = {!chosenWinner}
                width="100%"
                onClick={() => window.location.reload(false)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenWinner}
                width="100%"
                // onClick={() => createGame()}
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
      {content}
    </BaseContainer>
  );

};

export default GameView;