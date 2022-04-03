import React, {useState} from 'react';
import {useHistory, Link} from 'react-router-dom';
import {Button} from 'components/ui/Button';
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
        </select>
      </div>
    );
  };

  FormField.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func
  };


const GameCreation = () => {

    const history = useHistory();
    const [cards, setCards] = useState("regular");
    const [gamemode, setGamemode] = useState("cz");

    const createGame = async () => {
      // TODO
      console.log({cards});
      console.log({gamemode})
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
              value={cards}
              onChange={cs => setCards(cs)}
            />
            <FormField
              label="2) Choose Game Mode"
              option1="Card Czar Mode"
              value1="cz"
              option2="Community Mode"
              value2="nocz"
              value={gamemode}
              onChange={gm => setGamemode(gm)}
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