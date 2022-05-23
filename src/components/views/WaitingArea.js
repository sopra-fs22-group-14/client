import React, {useState, useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
// import {WaitingLogo} from "components/ui/WaitingLogo";
import {api, catchError} from 'helpers/api';
import 'styles/views/WaitingArea.scss';
import BaseContainer from "components/ui/BaseContainer";
import {useInterval} from 'helpers/utils';
import {SpinnerSquares} from 'components/ui/SpinnerSquares';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';

const WaitingArea = () => {
  const { gameId } = useParams(); // in case we want to pass it as param
  // console.log(id);

  const history = useHistory();
  const [playerCount, setPlayerCount] = useState(1);
  const [gameName, setGameName] = useState("");
  const [isPolling, setIsPolling] = useState(true); //NOTE - for pausing the polling 

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
  }, isPolling ? 1000 : null) //NOTE - for pausing the polling 


  const leaveGame = async () => {
    try {
      setIsPolling(false);
      await api.put('/leave/'+gameId);
      history.push('/lobby');
    } catch (error) {
      catchError(history, error, 'leaving the game');
      setIsPolling(true);
    }
  }
  

  // define css based on the playerCount
  const hname = "waitingArea h2_" + playerCount;
  const bname = "waitingArea bar b" + playerCount;

  let content = <SpinnerBalls/>;
  let joining = null;

  if (gameName != "") {
    content = (
      <div className="waitingArea base">
        <h2>{gameName}</h2>
        <SpinnerSquares/> {/* <WaitingLogo/> */}
        <h2 className={hname}>{playerCount}/4</h2>
        <div className="waitingArea progress">
          <div className={bname} />
        </div>
      </div>
    )
    joining = (playerCount === 4 ?
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
      </div>);
  }

  return (
    <BaseContainer>
      {content}
      {joining}
    </BaseContainer>
  );
}

export default WaitingArea;