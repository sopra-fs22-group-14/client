import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {api, catchError} from 'helpers/api';
import Game from 'models/Game';
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

const FormFieldInput = props => {
  return (
    <div>
      <label className="gameCreation label">
        {props.label}
      </label>
      <input
        className="gameCreation inputName"
        placeholder="Name the game"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

  FormField.propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.func
  };


const GameCreation = () => {

    const history = useHistory();
    const [gameEdition, setGameEdition] = useState("regular");
    const [cardCzarMode, setCardCzarMode] = useState("true");
    const [numOfRounds, setNumOfRounds] = useState(8);
    const [gameName, setGameName] = useState("");
    const [isPending, setIsPending] = useState(false);

    const createGame = async () => {

      try {
        setIsPending(true);
        const requestBody = JSON.stringify({gameName, gameEdition, cardCzarMode, numOfRounds: Number(numOfRounds)});
        // console.log(requestBody);
        const response = await api.post('/games', requestBody); 

        // game was successfully created (and joined)
        const game = new Game(response.data);

        history.push(`/lobby/wait/${game.gameId}`);

      } catch (error) {
        setIsPending(false);
        catchError(history, error, 'creating the game');
      }
    }
  
    return (
      <BaseContainer>
        <div className="gameCreation container">
          <div className="gameCreation form">
            <h2>Create a new game</h2>
            <FormFieldInput
              // label="1) Choose a name"
              value={gameName}
              onChange={gn => setGameName(gn)}
            />
            <FormField
              label="1) Choose Card Type"
              option1="Regular Edition"
              value1="regular"
              option2="Family Edition"
              value2="family"
              value={gameEdition}
              onChange={ge => setGameEdition(ge)}
            />
            <FormField
              label="2) Choose Game Mode"
              option1="Card Czar Mode"
              value1="true"
              option2="Community Mode"
              value2="false"
              value={cardCzarMode}
              onChange={czm => setCardCzarMode(czm)}
            />
            <FormField
              label="3) Choose Number of Rounds"
              option1="8"
              value1={8}
              option2="12"
              value2={12}
              option3="16"
              value3={16}
              value={numOfRounds}
              onChange={ro => setNumOfRounds(ro)}
            />
            <div className="gameCreation button-container">
              <Button
                width="50%"
                onClick={() => history.push("/lobby")}
              >
                Back
              </Button>&nbsp;&nbsp;
              {!isPending && 
                <Button
                  disabled = {!gameName}
                  width="50%"
                  onClick={() => createGame()}
                >
                  Create
                </Button>}

              {isPending && 
                <Button
                  disabled
                  width="100%"
                >
                  Creating...
                </Button>}
            </div>
          </div>
        </div>
      </BaseContainer>
    );
  
  };
  
  export default GameCreation;