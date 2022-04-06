import {useEffect, useState} from 'react';
import {api, handleError} from 'helpers/api';
import {Spinner} from 'components/ui/Spinner';
import {Button} from 'components/ui/Button';
import {useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Lobby.scss";
import {useInterval} from 'helpers/utils';

// -------------------------------- LOBBY --------------------------------
const Lobby = () => {
  const history = useHistory();
  const [games, setGames] = useState(null);

  // Container for each GAME instance 
  const Game = ({game}) => (
    <div className="game container" 
         onClick={() => history.push('/lobby/wait')}>
           {/* TODO join game on click and redirect to the waiting area */}
      <div className="game id">{game.id}</div>
      {/* <div className="game name">{game.name}</div> */}
      <div className="game numberOfPlayers">{game.numberOfPlayers} / 4</div>
      <div className="game cardsType">{game.cardsType}</div>
      <div className="game gameMode">{game.gameMode ? "Card Czar" : "Points"}</div>
      {/* <div>
        <Button
          width="100%"
          onClick={() => history.push('/lobby/wait')}
        >
          JOIN
        </Button>
      </div> */}
    </div>
  );
  Game.propTypes = {
    game: PropTypes.object
  };


  // POOLING
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
        console.error(`Something went wrong while fetching the games list: \n${handleError(error)}`);
        console.error("Details:", error);
        alert("Something went wrong while fetching the games list! See the console for details.");
        // NOT AUTHORIZED 
        error.response.data.status == 401 && history.push('/login') && localStorage.removeItem('token'); 
      }
    }
    fetchData();
  }, 1000);

  // -------------------------------- LOGOUT --------------------------------
  const logout = async () => {
    try {
      // prepare logout API call
      // await api.post('/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUserID');
      history.push('/login');

    } catch (error) {
      alert(`Something went wrong during the logout: \n${handleError(error)}`);
    }
  }
  // -------------------------------- SPINNER --------------------------------
  let content = <Spinner/>;
  // -------------------------------- IF --------------------------------
  if (games) {
    content = (
      <div  className="lobby">
        <h2>Games</h2>
        <h5>Join by clicking on the game!</h5>
        <div className="tableHeader container">
          <div>ID</div>
          {/* <div>Name</div> */}
          <div>Players</div>
          <div>Cards</div>
          <div>Game Mode</div>
          {/* <div></div> */}
        </div>
        <ul className="lobby games-list">
          {games.map(game => (
            <Game game={game} key={game.id}/>
          ))}
        </ul>

        {/* GAME CREATION BUTTON  */}
        <Button
          width="100%"
          onClick={() => history.push('lobby/create')}
        >
          Create a new game
        </Button>

        {/* LOGOUT BUTTON  */}
        {/* <Button
          width="100%"
          onClick={() => logout()}
        >
          Logout
        </Button> */}
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
