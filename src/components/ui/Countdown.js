import {catchError} from 'helpers/api';
import {useInterval} from 'helpers/utils';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

const Countdown = props => {

    const history = useHistory();
    const [playingCountdown, setPlayingCountdown] = useState(sessionStorage.getItem('playingCountdown') ?? 60);

    useInterval(() => {
        try {
          if ((sessionStorage.getItem('playingCountdown') ?? playingCountdown) > 0) {

            // just update the counter
            let newTime = (sessionStorage.getItem('playingCountdown') ?? playingCountdown) - 1;
            setPlayingCountdown(newTime);
            sessionStorage.setItem('playingCountdown', newTime);

          } else if (sessionStorage.getItem('playingCountdown' ?? playingCountdown) == 0) {

            // IF the countdown reached 0, let the GameView know to wrap up
            if (props.onFinish) props.onFinish();

          }
        } catch (error) {
          catchError(history, error, 'updating the playingCountdown');
        }
      }, 1000);

      if (playingCountdown === 0) return <h2>submitting...</h2>
      else if (playingCountdown === -1) return <div></div>
      else return <h2>{playingCountdown}</h2>;

}

export default Countdown;