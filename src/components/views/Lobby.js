import {useState} from 'react';
import {api, catchError} from 'helpers/api';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {Button} from 'components/ui/Button';
import {useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {useInterval} from 'helpers/utils';
import SideBar from "components/views/SideBar";
import "styles/views/Lobby.scss";
import "styles/views/ProfileLobbyCommon.scss";


// -------------------------------- LOBBY --------------------------------
const Lobby = () => {
  const history = useHistory();
  const [games, setGames] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [chosenGame, setChosenGame] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  sessionStorage.clear();

  // -------------------------------- Joining game --------------------------------
  const joinGame = async (gameId) => {
    try {
      if(isPending === false){
        setIsPending(true);
        setChosenGame(gameId);
        const requestBody = JSON.stringify({gameId});
        console.log(gameId);
        const response = await api.put('/games', requestBody);
        history.push(`/lobby/wait/${gameId}`);
      }
    } catch (error) {
      setIsPending(false);
      setChosenGame(null);
      catchError(history, error, 'joining the game');
    }
  }

  // Container for each GAME instance 
  const Game = ({game}) => (
      <div
           onClick={() => joinGame(game.gameId)}>   
        {chosenGame!=game.gameId &&
        <div className="game container">
          <div className="game name">{game.gameName}</div>
          <div className="game numberOfRounds">{game.numOfRounds}</div>
          <div className="game numberOfPlayers">{game.numOfPlayersJoined} / 4</div>
          <div className="game cardsType">{game.gameEdition}</div>
          <div className="game gameMode">{game.cardCzarMode ? "Card Czar" : "Community"}</div>
        </div>}
        {chosenGame==game.gameId &&
        <div className="game container">
          <div className="game name"></div>
          <div className="game numberOfRounds"></div>
          <div className="game numberOfPlayers">Joining...</div>
          <div className="game cardsType"></div>
          <div className="game gameMode"></div>
        </div>}
      </div>
  );
  Game.propTypes = {
    game: PropTypes.object
  };

  // -------------------------------- POLLING - getting list of games --------------------------------
  useInterval(() => {
    async function fetchData() {
      try {
        // updating the current game list
        const response = await api.get('/games');
        // Get the returned games and update the state (only if it actually changed)
        if (JSON.stringify(response.data) != JSON.stringify(games)) 
          setGames(response.data);
      } catch (error) {
        catchError(history, error, 'fetching the games list');
      }
    }
    fetchData();
  }, isPolling ? 1000 : null);

  const stopPolling = () => {
    setIsPolling(false);
  }

  const startPolling = () => {
    setIsPolling(true);
  }

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (games) {
    content = (
      <div className = "lobby main">
        <SideBar stopPolling={stopPolling} startPolling={startPolling}/>
        <div  className="lobby games">
          <h2>Games</h2>
          <h5>Join by clicking on the game!</h5>
          <div className="tableHeader container">
            <div className = "tableHeader name">Name</div>
            <div>Number of rounds</div>
            <div>Players</div>
            <div>Cards</div>
            <div>Game Mode</div>
          </div>
          <ul className="lobby games-list">
            {games.map(game => (
              <Game game={game} key={game.gameId}/>
            ))}
          </ul>

          {/* {isPending && <h3>Joining...</h3>}
          {!isPending &&           <ul className="lobby games-list">
            {games.map(game => (
              <Game game={game} key={game.gameId}/>
            ))}
          </ul>} */}

          <div className = "buttons">
            {/* GAME CREATION BUTTON  */}
            <Button
              width="100%"
              onClick={() => history.push('lobby/create')}
              className = "button"
            >
              Create a new game
            </Button>
          </div>
        </div>
      </div>
     
    );
  }
   // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="lobby container">
      {content}
    </BaseContainer>
  );
}

export default Lobby;
