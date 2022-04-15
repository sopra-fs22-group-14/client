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


const GameView = () => {

  const { gameId } = useParams();
  const history = useHistory();

  const didMount = useRef(false);

  // TODO maybe role & whiteCards can be combined in a Player
  const [role, setRole] = useState(null);
  const [whiteCards, setWhiteCards] = useState(null);
  // const [player, setPlayer] = useState(null);

  // TODO maybe blackCard, roundNum & choices can be combined in a Round (probably easier to leave it like this)
  const [blackCard, setBlackCard] = useState(null);
  const [roundNr, setRoundNr] = useState(1);
  const [choices, setChoices] = useState(null);
  // const [round, setRound] = useState(null);

  // TODO update this counter whenever a player successfully played a card
  const [cardsPlayed, setCardsPlayed] = useState(0);

  // const [scores, setScores] = useState(null);

  const [winner, setWinner] = useState(null);

  // variables to store temporarily store information of a new round
  let roundNumberVariable = roundNr;
  let blackCardVariable = blackCard;

  // keep track of which card was selected
  // TODO they have to be reset to null when a new round starts!!
  const [chosenCard, setChosenCard] = useState(null);
  const [chosenWinner, setChosenWinner] = useState(null);


  // ------------------- Container for all cards ------------------------------
  const Card = props => {
    let className;
    if (props.text === chosenCard) className = "card focused";
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
    // TODO IF (props.isChoice && role === 'cardCzar') THEN DISPLAY BUTTONS WITH ONCLICK TO SET chosenWinner
    // TODO IF (props.isChoice && role === 'notNardCzar') THEN DISPLAY DIVS
    // TODO IF (!props.isChoice && role === 'cardCzar') THEN DISPLAY DIVS
    // TODO IF (!props.isChoice && role === 'notCardCzar') THEN DISPLAY BUTTONS WITH ONCLICK TO SET chosenCard
    
    // TODO to be removed after the above cases are implemented
    return (
      <button className={className} onClick={() => setChosenCard(props.text)}>
        {props.text}
      </button>
    );
  };

  Card.propTypes = {
    isBlack: PropTypes.bool,
    text: PropTypes.string
  };
  // ---------------------------------------------------------------------------


  /*
   useEffect is used to always fetch new Player-data (white cards & role) 
   whenever a new round starts (so when roundNr changes!) OR when
   a card was played (to only display 9 white cards)
  */
  useEffect(() => {
    async function fetchData() {
      try {
        // TODO fetch the player data
        // const response = await api.get('/player');
        // const player = new Player(response.data);
        // setPlayer(player);
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
      // setRoundNr(roundNumberVariable);  // this will also trigger the useEffect to fetch the player data
      // setBlackCard(blackCardVariable);
  
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
      // const response = await api.get(`/${gameId}/gameround`);

      /*
      in case a new round started, save the important things in variables for now.
      The corresponding states will only be updated after a delay (see useEffect of the winner)
      */

      // will look something like this:
      // roundNumberVariable = response.data.roundNr;
      // blackCardVariable = response.data.blackCard;

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
  return (
    <BaseContainer className="gameView mainContainer">
      <div className="gameView roundSection">
        {"Round "+roundNr}
      </div>
      {/* TODO display a hidden card tile maybe together with the opponents name */}
      <div className="gameView opponentSection center"> OPPONENT </div>
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView blackCardSection">
        {/* TODO display the black card fetched from the backend here */}
        <Card isBlack={true} text="BLACK CARD"/>
      </div>
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView choiceSection">
        <div className="gameView choiceSection cards">
          {/* TODO iterate over the choices and display the ones that are available */}
          <Card isBlack={false} isChoice={true} text="CHOICE 1"/>
          <Card isBlack={false} isChoice={true} text="CHOICE 2"/>
          <Card isBlack={false} isChoice={true} text="CHOICE 3"/>
        </div>
        <div className="gameView choiceSection submit">
          {/* TODO submission is only possible when 3 choices are available*/}
          {/* TODO add chooseRoundWinner for the onClick event */}
          SUBMIT SECTION (FOR CARD CZAR)&nbsp;
          {/* TODO add the role to the disables as well (only visible for card czar) -> even more secure */}
          <button disabled={!chosenWinner}>SUBMIT</button>
        </div>
      </div>
      <div className="gameView whiteCardSection">
        {/* TODO iterate over player.whiteCards or just whiteCards (depends on
        what states are used) and set the texts accordingly */}
        <Card isBlack={false} isChoice={false} text="CARD 1"/>
        <Card isBlack={false} isChoice={false} text="CARD 2"/>
        <Card isBlack={false} isChoice={false} text="CARD 3"/>
        <Card isBlack={false} isChoice={false} text="CARD 4"/>
        <Card isBlack={false} isChoice={false} text="CARD 5"/>
        <Card isBlack={false} isChoice={false} text="CARD 6"/>
        <Card isBlack={false} isChoice={false} text="CARD 7"/>
        <Card isBlack={false} isChoice={false} text="CARD 8"/>
        <Card isBlack={false} isChoice={false} text="CARD 9"/>
        <Card isBlack={false} isChoice={false} text="CARD 10"/>
      </div>
      {/* TODO call playCard for the onClick event of the button */}
      <div className="gameView bottomSection">
        SUBMIT / LEAVE SECTION&nbsp;
        {/* TODO add the role to the disables as well (only for regular players) -> even more secure */}
        <button disabled={!chosenCard}>SUBMIT</button>
      </div>
    </BaseContainer>
  );

};

export default GameView;