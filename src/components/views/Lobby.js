import {useState} from 'react';
import {api,catchError, updateApi, handleError} from 'helpers/api';
import {Spinner} from 'components/ui/Spinner';
import {SpinnerSquares} from 'components/ui/SpinnerSquares';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {Button} from 'components/ui/Button';
import {useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {useInterval} from 'helpers/utils';
import "styles/views/Lobby.scss";
import SideBar from "components/views/SideBar";



// -------------------------------- LOBBY --------------------------------
const Lobby = () => {
  const history = useHistory();
  const [games, setGames] = useState(null);

  // -------------------------------- Joining game --------------------------------
  const joinGame = async (gameId) => {
    try {
      const requestBody = JSON.stringify({gameId});
      console.log(gameId);
      // const response = await api.put('/games', requestBody);
      //TODO make request to join the game
      //TODO if response was correct then push 
      const status = 200; //COMMENT just for now
      // if(response.status == 200){
      if(status == 200){
        history.push('/lobby/wait'); 
      }
    } catch (error) {
      catchError(history, error, 'joining the game');
    }
  }

  // Container for each GAME instance 
  const Game = ({game}) => (
      <div className="game container"
           onClick={() => joinGame(game.gameId)}>    
        <div className="game id">{game.gameId}</div>
        {/* <div className="game name">{game.gameName}</div> */}
        <div className="game numberOfPlayers">{game.numOfPlayersJoined} / 4</div>
        <div className="game cardsType">{game.gameEdition}</div>
        <div className="game gameMode">{game.cardCzarMode ? "Card Czar" : "Points"}</div>
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
        // Get the returned users and update the state.
        setGames(response.data);

        // See here to get more data.
        console.log(response);
      } catch (error) {
        catchError(history, error, 'fetching the games list');
      }
    }
    fetchData();
  }, 1000);

  // -------------------------------- LOGOUT --------------------------------
  const logout = async () => {
    try {
      // prepare logout API call
      await api.post('/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUserID');
      // and update the API, to NOT include Authorization for future requests
      updateApi();

      history.push('/login');

    } catch (error) {
      alert(`Something went wrong during the logout: \n${handleError(error)}`);
    }
  }
  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (games) {
    content = (
      <div className = "lobby main">
        <SideBar height="100"/>
        <div  className="lobby games">
          <h2>Games</h2>
          <h5>Join by clicking on the game!</h5>
          <div className="tableHeader container">
            <div>ID</div>
            {/* <div>Name</div> */}
            <div>Players</div>
            <div>Cards</div>
            <div>Game Mode</div>
          </div>
          <ul className="lobby games-list">
            {games.map(game => (
              <Game game={game} key={game.gameId}/>
            ))}
          </ul>


          <div className = "buttons">
            {/* GAME CREATION BUTTON  */}
            <Button
              width="100%"
              onClick={() => history.push('lobby/create')}
              className = "button"
            >
              Create a new game
            </Button>

            {/* LOGOUT BUTTON  */}
            <Button
              width="100%"
              onClick={() => logout()}
            >
              Logout
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
