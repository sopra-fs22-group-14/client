import React, {useState, useEffect, useRef} from 'react';
import {api, catchError} from 'helpers/api';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/EndGameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import EndGame from 'models/EndGame';
/*
Upon completion of the game, the each player is forwarded to the EndGameView page and the {gameId}/gamewinner is called. 
*When the game is deleted?*
    ---> When last player leaves the game 
*What button should be avaialable in the EndGameView?*
    ---> [Continue] = brings back to the lobby
    FOR M4: 
    ---> [Display your choices] = calls for respective Player played combinations in the game 
            ---> Click on the one you want to save and send POST request to the backend 
*/ 
const EndGameView = () => {
  const { gameId } = useParams(); // history.push(`/endGame/${gameId}`);
  const history = useHistory();
  const [endGame, setEndGame] = useState(null);

  // COMMENT - fetch EndGame data:
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/${gameId}/gameEnd`);
        const endGame = new EndGame(response.data);
        setEndGame(endGame);
        console.log("EndGame data received"); 
        // ------------ just for testing:
        // var dict = {
        //   playersNames: ["Alex", "Diego", "Szymek", "Ege"],
        //   playersNumbersOfPicked: [2,3,15,10],
        //   winnersNames: ["Diego", "Alex"],
        //   winnersIds: [2]
        // };
        // const endGame = new EndGame(dict);
        // setEndGame(dict);
        // console.log(endGame);
      } catch (error) {
        catchError(history, error, 'fetching the EndGame data');
      }
    }
    fetchData();
  }, []);

  const leaveGame = async () => {
    try { 
      await api.put('/leave/'+gameId);
      history.push('/lobby'); 
    } catch (error) {
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
  if (endGame != null) {
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
          <h1>Game Summary</h1>
          {getSummary()}
        </div>
        <div className = "endGameView buttonsSection">
            <Button
              disabled
                width="100%"
                // onClick={() => displayChoices()} // TODO - displayChoices()
              >
              Display your choices
            </Button>
            <Button
                width="100%"
                onClick={() => leaveGame()}
              >
              Continue...
            </Button>
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