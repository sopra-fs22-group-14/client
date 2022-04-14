import React, {useState, useEffect} from 'react';
import {useInterval} from 'helpers/utils';
import {api, catchError} from 'helpers/api';
import Player from 'models/Player';
import Round from 'models/Round';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/GameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

// Container for all cards
const Card = props => {
  let className = props.isBlack ? "blackCard" : "card";
  return (
    <div className={className}>
      {props.text}
    </div>
  );
};

Card.propTypes = {
  isBlack: PropTypes.bool,
  text: PropTypes.string
};


const GameView = () => {

  const { gameId } = useParams();
  const history = useHistory();

  // TODO maybe role & whiteCards can be combined in a Player
  // const [role, setRole] = useState(null);
  // const [whiteCards, setWhiteCards] = useState(null);
  const [player, setPlayer] = useState(null);

  // TODO maybe blackCard, roundNum & choices can be combined in a Round
  const [blackCard, setBlackCard] = useState(null);
  const [roundNr, setRoundNr] = useState(1);
  const [choices, setChoices] = useState(null);
  // const [round, setRound] = useState(null);

  // TODO update this counter whenever a player successfully played a card
  const [cardsPlayed, setCardsPlayed] = useState(0);

  // const [scores, setScores] = useState(null);

  const [winner, setWinner] = useState(null);

  /*
   useEffect is used to always fetch new Player-data (white cards & role) 
   whenever a new round starts (so when roundNr changes!) OR when
   a card was played (to only display 9 white cards)
  */
  useEffect(async () => {
    try {
      // TODO fetch the player data
      // const response = await api.get('/player');
      // const player = new Player(response.data);
      // setPlayer(player);
    } catch (error) {
      catchError(history, error, 'fetching the player data');
    }
  }, [roundNr, cardsPlayed]);


  // it might also be used to show the winner when this state changes
  useEffect(() => {
    /*
    TODO add a 10 second countdown until the round and blackCard are set and therefore updated
    This is for the players to actually see the winner!
    */


    // TODO setRoundNr & setBlackCard
    // setRoundNr(response.data.roundNr);
  }, [winner]);


  /*
  useIntervall is used to periodically fetch data regarding the rounds
  of the game. This includes things such as the played cards, (so that 
  the played cards from all players are shown), the black card as well
  as the current round number
  */
  useInterval(async () => {

    // if new round data is available, display the new data
    fetchRoundData();

    // if a winner was decided, display the winner! (INCLUDED IN THE ROUND!)
    // fetchWinner();

  }, 5000);

  const fetchRoundData = async () => {
    try {
      // console.log("FETCH ROUND DATA");
      // const response = await api.get(`/${gameId}/gameround`);
      setRoundNr(roundNr + 1); //TODO delete

      // TODO setChoices (played Cards) - always update the choices when they change

      // TODO setWinner - always update the winner (will trigger useEffect when actually changing)
      
    } catch (error) {
      catchError(history, error, 'fetching the round data');
    }
  }

  // const fetchWinner = async () => {
  //   try {
  //     // TODO
  //     // const response = await api.get(`/${gameId}/roundwinner`);
  //     // setWinner() ...
  //     // console.log("FETCH WINNER DATA");
  //   } catch (error) {
  //     catchError(history, error, 'fetching the winner');
  //   }
  // }


  return (
    <BaseContainer className="gameView mainContainer">
      {/* <div className="gameView topSection"> */}
      <div className="gameView roundSection">
        {"Round "+roundNr}
      </div>
      {/* TODO display a hidden card tile maybe together with the opponents name */}
      <div className="gameView opponentSection center"> OPPONENT </div>
        {/* <div className="gameView scoreSection"> (SCORE) </div> */}
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView blackCardSection">
        {/* TODO display the black card fetched from the backend here */}
        <Card isBlack={true} text="BLACK CARD"/>
      </div>
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView choiceSection">
        <div className="gameView choiceSection cards">
          {/* TODO iterate over the choices and display the ones that are available */}
          <Card isBlack={false} text="CHOICE 1"/>
          <Card isBlack={false} text="CHOICE 2"/>
          <Card isBlack={false} text="CHOICE 3"/>
        </div>
        <div className="gameView choiceSection submit">
          {/* TODO dependent on the role of the player, don't allow any submission 
          here (either don't include any buttons or don't make them clickable) 
          Also, submission is only possible when 3 choices are available*/}
          <div> SUBMIT SECTION (FOR CARD CZAR) </div>
        </div>
      </div>
      <div className="gameView whiteCardSection">
        {/* TODO iterate over player.whiteCards or just whiteCards (depends on
        what states are used) and set the texts accordingly */}
        <Card isBlack={false} text="CARD 1"/>
        <Card isBlack={false} text="CARD 2"/>
        <Card isBlack={false} text="CARD 3"/>
        <Card isBlack={false} text="CARD 4"/>
        <Card isBlack={false} text="CARD 5"/>
        <Card isBlack={false} text="CARD 6"/>
        <Card isBlack={false} text="CARD 7"/>
        <Card isBlack={false} text="CARD 8"/>
        <Card isBlack={false} text="CARD 9"/>
        <Card isBlack={false} text="CARD 10"/>
      </div>
      <div className="gameView bottomSection"> SUBMIT / LEAVE SECTION </div>
      {/* </div> */}
    </BaseContainer>
  );

};

export default GameView;