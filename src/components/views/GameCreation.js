import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {api, handleError} from 'helpers/api';
import 'styles/views/GameCreation.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

const FormField = props => {
    return (
      <div className="gameCreation field">
        <label className="gameCreation label">
          {props.label}
        </label>
        <select
          className="gameCreation select"
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        >
          <option value={props.value1}>{props.option1}</option>
          <option value={props.value2}>{props.option2}</option>
          {props.value3 != null && <option value={props.value3}>{props.option3}</option>}
        </select>
      </div>
    );
  };

  FormField.propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.func
  };


const GameCreation = () => {

    const history = useHistory();
    const [cardDeck, setCardDeck] = useState("regular");
    const [gameMode, setGameMode] = useState("cardczar");
    const [numberOfRounds, setNumberOfRounds] = useState(8);

    const createGame = async () => {

      try {

        const requestBody = JSON.stringify({cardDeck, gameMode, numberOfRounds: Number(numberOfRounds)});
        console.log(requestBody);
        const response = await api.post('/games', requestBody);

      } catch (error) {
        alert(`Something went wrong during the game creation: \n${handleError(error)}`);
      }
    }
  
    return (
      <BaseContainer>
        <div className="gameCreation container">
          <div className="gameCreation form">
            <h2>Create a new game</h2>
            <FormField
              label="1) Choose Card Type"
              option1="Regular Edition"
              value1="regular"
              option2="Family Edition"
              value2="family"
              value={cardDeck}
              onChange={cd => setCardDeck(cd)}
            />
            <FormField
              label="2) Choose Game Mode"
              option1="Card Czar Mode"
              value1="cardczar"
              option2="Community Mode"
              value2="nocardczar"
              value={gameMode}
              onChange={gm => setGameMode(gm)}
            />
            <FormField
              label="3) Choose Number of Rounds"
              option1="8"
              value1={8}
              option2="12"
              value2={12}
              option3="16"
              value3={16}
              value={numberOfRounds}
              onChange={ro => setNumberOfRounds(ro)}
            />
            <div className="gameCreation button-container">
              <Button
                width="50%"
                onClick={() => history.push("/lobby")}
              >
                Back
              </Button>
  
              <Button
                width="50%"
                onClick={() => createGame()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </BaseContainer>
    );
  
  };
  
  export default GameCreation;