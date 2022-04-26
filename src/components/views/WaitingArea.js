import React, {useState, useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {WaitingLogo} from "components/ui/WaitingLogo";
import {api, catchError} from 'helpers/api';
import 'styles/views/WaitingArea.scss';
import BaseContainer from "components/ui/BaseContainer";
import {useInterval} from 'helpers/utils';

const WaitingArea = () => {
  const { gameId } = useParams(); // in case we want to pass it as param
  // console.log(id);

  const history = useHistory();
  const [playerCount, setPlayerCount] = useState(1);
  const [gameName, setGameName] = useState(0);
  const [delay, setDelay] = useState(1000); //NOTE - for pausing the polling 
  const [isLastPlayerLeaving, setIsLastPlayerLeaving] = useState(false); //NOTE - for pausing the polling 

  const getPlayerCount = async () => {
    try {
      const response = await api.get('/games/waitingArea/'+gameId);
      //console.log(response);
      setPlayerCount(response.data.numOfPlayersJoined);
      setGameName(response.data.gameName);

      // when playerCount is reached -> redirect to game after 3sec
      if (playerCount === 4) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        history.push(`/game/${gameId}`);
      }
    } catch (error) {
      catchError(history, error, 'polling the userCount');
      history.push('/lobby');   // redirect back to lobby
    }
  }

  // useEffect to initially display the correct player count
  useEffect(() => {
    getPlayerCount();
  }, []);

  useInterval( async () => {
    getPlayerCount();
  }, isLastPlayerLeaving ? null : delay) //NOTE - for pausing the polling 


  const leaveGame = async () => {
    try { 
      if (playerCount === 1)
        setIsLastPlayerLeaving(true); //NOTE - for pausing the polling 
      await api.put('/games/waitingArea/'+gameId);
      history.push('/lobby'); 
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