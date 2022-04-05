import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {WaitingLogo} from "components/ui/WaitingLogo";
import {api, handleError} from 'helpers/api';
import 'styles/views/WaitingArea.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {useInterval} from 'helpers/utils';

const WaitingArea = () => {

  const history = useHistory();
  const [playerCount, setPlayerCount] = useState(1);

  useInterval( async () => {

    // TODO implement polling to update


    // when playerCount is reached -> redirect to game after 1.5sec
    if (playerCount === 4) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      history.push('/lobby/create'); // TODO change to game view
    }
  }, 1000)

  const leaveGame = async () => {
    // TODO send leave request to backend
    history.push('/lobby'); // TODO change to game view
  }

  // define css based on the playerCount
  const hname = "waitingArea h2_" + playerCount;
  const bname = "waitingArea bar b" + playerCount;

  return (
    <BaseContainer>
      <WaitingLogo/>
      <div className="waitingArea">
        <h2>Waiting for players...</h2>
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