import React, {useState, useEffect} from 'react';
import {useInterval} from 'helpers/utils';
import {api, updateApi, handleError} from 'helpers/api';
import User from 'models/User';
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
  const [role, setRole] = useState(null);
  const [whiteCards, setWhiteCards] = useState(null);
  // TODO maybe blackCard, roundNum & choices can be combined in a Round
  const [blackCard, setBlackCard] = useState(null);
  const [roundNr, setRoundNr] = useState(1);
  const [choices, setChoices] = useState(null);
  // const [scores, setScores] = useState(null);


  return (
    <BaseContainer className="gameView mainContainer">
      {/* <div className="gameView topSection"> */}
      <div className="gameView roundSection">
        {"Round "+roundNr}
      </div>
      <div className="gameView opponentSection center"> OPPONENT </div>
        {/* <div className="gameView scoreSection"> (SCORE) </div> */}
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView blackCardSection">
        <Card isBlack={true} text="BLACK CARD"/>
      </div>
      <div className="gameView opponentSection"> OPPONENT </div>
      <div className="gameView choiceSection">
        <div className="gameView choiceSection cards">
          <Card isBlack={false} text="CHOICE 1"/>
          <Card isBlack={false} text="CHOICE 2"/>
          <Card isBlack={false} text="CHOICE 3"/>
        </div>
        <div className="gameView choiceSection submit">
          <div> SUBMIT SECTION (FOR CARD CZAR) </div>
        </div>
      </div>
      <div className="gameView whiteCardSection">
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