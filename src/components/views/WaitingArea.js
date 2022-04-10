import React, {useState, useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {WaitingLogo} from "components/ui/WaitingLogo";
import {api, catchError, handleError} from 'helpers/api';
import 'styles/views/WaitingArea.scss';
import BaseContainer from "components/ui/BaseContainer";
import {useInterval} from 'helpers/utils';

const WaitingArea = () => {
  const { gameId } = useParams(); // in case we want to pass it as param
  // console.log(id);

  const history = useHistory();
  const [playerCount, setPlayerCount] = useState(1);
  const [gameName, setGameName] = useState(0)

  const getPlayerCount = async () => {
    try {
      const response = await api.get('/games/waitingArea/'+gameId);
      //console.log(response);
      setPlayerCount(response.data.numOfPlayersJoined);
      setGameName(response.data.gameName);

      // when playerCount is reached -> redirect to game after 1.5sec
      if (playerCount === 4) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        history.push('/lobby/create'); // TODO change to game view
      }
    } catch (error) {
      catchError(history, error, 'polling the userCount');
    }
  }

  // useEffect to initially display the correct player count
  useEffect(() => {
    getPlayerCount();
  }, []);

  useInterval( async () => {
    getPlayerCount();
  }, 1000)

  const leaveGame = async () => {
    try {
      // send leave request to backend
      await api.put('/games/waitingArea/'+gameId);

      history.push('/lobby'); // TODO change to game view
    } catch (error) {
      catchError(history, error, 'leaving the game');
    }

  }

  // define css based on the playerCount
  const hname = "waitingArea h2_" + playerCount;
  const bname = "waitingArea bar b" + playerCount;

  return (
    <BaseContainer>
      <div className="waitingArea">
        <h2>{gameName}</h2>
        <WaitingLogo/>
        <h3>Waiting for players...</h3>
        <h2 className={hname}>{playerCount}/4</h2>
        <div className="waitingArea progress">
          <div className={bname} />
        </div>
      </div>
      {playerCount === 4 ?
      <div className="waitingArea join">
        <h2>Joining Game...</h2>
      </div> :
      <div className="waitingArea button-container">
        <Button
          disabled = {playerCount === 4}
          width="50%"
          onClick={() => leaveGame()}
        >
          Leave
        </Button>
      </div>}

    </BaseContainer>
  );
}

export default WaitingArea;