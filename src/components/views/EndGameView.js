import React, {useState, useEffect, useRef} from 'react';
import {api, catchError} from 'helpers/api';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/EndGameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import EndGame from 'models/EndGame';
import PropTypes from "prop-types";

const EndGameView = () => {
  const { gameId } = useParams(); // history.push(`/endGame/${gameId}`);
  const history = useHistory();
  const [endGame, setEndGame] = useState(null);
  const [playedCombinations, setPlayedCombinations] = useState(null);
  const [chosenCombination, setChosenCombination] = useState(null);
  const [displayChoices, setDisplayChoices] = useState(false); 
  const [isPending, setIsPending] = useState(false);

  // COMMENT - Container for each combination instance 
  const Combination = ({combination}) => {
    let divClassName;
    if(combination.combinationText === chosenCombination) divClassName = "combination chosenCombination";
    else divClassName = "combination nothosenCombination"
    return(    
      <div className={divClassName} onClick={() => setChosenCombination(combination.combinationText)}>    
          <div className="combination text">{combination.combinationText}</div>
      </div>)
  }
  Combination.propTypes = {
    combination: PropTypes.object
  };

  // COMMENT - fetch EndGame data:
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/${gameId}/gameEnd`);
        const endGame = new EndGame(response.data);
        setEndGame(endGame);
        console.log("EndGame data received"); 
      } catch (error) {
        catchError(history, error, 'fetching the EndGame data');
      }
    }
    async function fetchPlayedCombinations() {
      try {
        // const response = await api.get(`/combinations`); // TODO - request to get the combinations played 
        const combinations = [
            {combinationText: "SuperCrazyFreackingFancyMysteriousGreatAndAwesomeAsWellAsLegendaryAndStupidOrWellThoughtStringJustToTestThingsOut"},
            {combinationText: "Chupapi Muñañyo"},
            {combinationText: "Oh yes daddy"},
            {combinationText: "Oh wow this design is super ugly"},
            {combinationText: "You know what also is ugly? Yo mama!"},
            {combinationText: "Why is life so hard guys?"}]
        setPlayedCombinations(combinations);
        console.log("Played combinations received"); 
      } catch (error) {
        catchError(history, error, 'fetching played combinations');
      }
    }
    fetchData();
    fetchPlayedCombinations();
  }, []);

  const leaveGame = async () => {
    try { 
      if(chosenCombination !== null) {
        setIsPending(true);
        // TODO - request to save the combination on the profile 
        const requestBody = JSON.stringify({chosenCombination}); 
        console.log(requestBody);
        // const response = await api.post(`...`, requestBody);
      }
      await api.put('/leave/'+gameId);
      history.push('/lobby'); 
    } catch (error) {
      setIsPending(false);
      catchError(history, error, 'leaving the game');
    }
  }
  // COMMENT - display personalised messaged based on EndGame data:
  const displayPersonalisedMessage = () => {
    const userId = localStorage.getItem('loggedInUserID');
    // check if userId is in the list of winners
    if(endGame.winnersIds.includes((parseInt(userId)))){
      // now we need to check whether palyer is the only winner or it is a draw 
      if(endGame.winnersIds.length === 1){
        // you are the only winner
        return "You won the game! Congrats 🎉!";
      }
      else{
        // it is a draw
        return "It's a draw 😑!";
      }
    }
    else{ 
      // user LOST the game
      return "You lost 👎!";
    }
  }

  // COMMENT - display GAME SUMMARY based on EndGame data:
  const getSummary = () => {
    // create a dict out of two lists and sort it - most round wins at the top
    const dict_players = endGame.playersNames.map((userName, i) => ({
      userName,
      roundsWon: endGame.playersNumbersOfPicked[i]
    }));
    dict_players.sort((a, b) => b.roundsWon - a.roundsWon);
    // console.log(dict_players[0]["userName"]);

    const element = dict_players.map(player => (
        <tr key = {player["userName"]} className = "endGameView gameSummary playerStats">
            <td>{player["userName"]}</td>
            <td>{player["roundsWon"]}</td>
        </tr>));

    const summaryTable = (   
    <table className = "endGameView gameSummary table">
      <tbody>
        <tr>
          <th>Player name</th>
          <th>Rounds won</th>
        </tr>
        {element}
      </tbody>
    </table>);
    
    return summaryTable;
  }

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (endGame != null && playedCombinations != null) {
    content = (
      <div className = "endGameView main">
        <div className = "endGameView personalisedMessage">
          <h2 className = "endGameView personalisedMessage header">{displayPersonalisedMessage()}</h2>
          <div className = "endGameView personalisedMessage winners"> 
            <h1>🏆 Winners 🏆</h1> 
            {endGame.winnersNames.map(name => (
              <h2 key = {name}>{name}</h2>
            ))}
          </div>
        </div>
        <div className = "endGameView gameSummary">
          <h2>Game Summary</h2>
          {getSummary()}
        </div>
        {displayChoices &&
        <div className = "endGameView combinationsContainer">
          <h2>Played combinations</h2>
          <h4>Pick a combination and press continue to save it on your profile!</h4>
          <ul className="endGameView combinations-list"> 
              {playedCombinations.map(combination => (
                <Combination combination={combination} key={combination.combinationText}/>
              ))}
          </ul>
        </div>}
        <div className = "endGameView buttonsSection">
            {!displayChoices &&
                            <Button
                                width="100%"
                                onClick={() => setDisplayChoices(true)}
                              >
                              Display combinations you played
                            </Button>}
            {displayChoices &&
                            <Button
                                width="100%"
                                onClick={() => setChosenCombination(null)}
                              >
                              Reset choice 
                            </Button>}
            {!isPending &&
                      <Button
                          width="100%"
                          onClick={() => leaveGame()}
                        >
                        Continue...
                      </Button>}

            {isPending &&
                        <Button
                            width="100%"
                            disabled
                            onClick={() => leaveGame()}
                          >
                          Saving changes & leaving ...  
                        </Button>}
        </div>
      </div>
    );
  } 
  // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="endGameView container">
      {content}
    </BaseContainer>
  );
};

export default EndGameView;