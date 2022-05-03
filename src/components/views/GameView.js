import React, {useState, useEffect, useRef} from 'react';
import {useInterval} from 'helpers/utils';
import {api, catchError} from 'helpers/api';
import Player from 'models/Player';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import {Confetti} from 'components/ui/Confetti';
import 'styles/views/GameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';

const GameView = () => {
  const { gameId } = useParams();
  const history = useHistory();
  const didMount = useRef(false);

  // COMMENT Player data:
  const [player, setPlayer] = useState(null);

  // COMMENT Round data: 
  const [blackCard, setBlackCard] = useState(null);
  const roundId = useRef(null);
  const [roundNr, setRoundNr] = useState(null);
  const [playersChoices, setPlayersChoices] = useState(null);  // cards that were played in this round
  const [roundWinner, setRoundWinner] = useState(null);
  const [roundWinningCardText, setRoundWinningCardText] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const isFinal = useRef(false); // if round is final then after countdown push to gameEndView screen
  const [playingCountdown, setPlayingCountdown] = useState(null);
  const [choosingCountdown, setChoosingCountdown] = useState(null);
  
  // COMMENT Game data:
  const [cardsPlayed, setCardsPlayed] = useState(0); // if this is > 0 then button is disabled till next round 
  const [opponentNames, setOpponentNames] = useState(null);
  const playersWhoPlayed= useRef(null);
  // const [scores, setScores] = useState(null); 

  // state to stop the polling when needed
  const [pollingActive, setPollingActive] = useState(true);

  // keep track of which card was selected - ID of the card
  // COMMENT they have to be reset to null when a new round starts! -> see "if (didMount.current) {...}"
  const [chosenCard, setChosenCard] = useState(null);     // id of the selected card
  const [chosenWinner, setChosenWinner] = useState(null); // id of the selected card

  // variables to temporarily store information of a new round
  const roundNumberVariable = useRef(roundNr);
  const blackCardVariable = useRef(blackCard);

  // ------------------- Container for all cards ------------------------------
  const Card = props => {
    let className;
    if (props.cardId === chosenCard || props.cardId === chosenWinner) className = "card focused";
    // else if (props.cardId === chosenCard && playerAlreadyPlayed) {
        //  this card should stay makred as green 
        //  create a css which is marked as green 
    // }
    else className = props.isBlack ? "blackCard" : "card";
    // BLACK CARD
    if (props.isBlack) {
      return (
        <div className={className}>
          {props.text}
        </div>
      );
    }
    // WHITE CARD
    if(props.isChoice && props.role === true){
      return(
        <button className={className} onClick={() => setChosenWinner(props.cardId)}>
        {props.text}
        </button>
      );
    }
    else if(props.isChoice && props.role === false){
      return(
        <button className="notActiveCard" disabled>
        {props.text}
        </button>
      );
    }
    else if(!props.isChoice && props.role === true){
      return(
        <button className="notActiveCard" disabled>
        {props.text}
        </button>
      );
    }
    else if(!props.isChoice && props.role === false){
      return(
        <button className={className} onClick={() => setChosenCard(props.cardId)}>
        {props.text}
        </button>
      );
    }
  };

  Card.propTypes = {
    isBlack: PropTypes.bool,
    isChoice: PropTypes.bool, 
    text: PropTypes.string,
    role: PropTypes.bool
  };
  // ---------------------------------------------------------------------------
  
  // TODO handle the case of leaving page
  // useEffect(() => {
  //   window.addEventListener('beforeunload', alertUser)
  //   window.addEventListener('unload', leaveGame())
  //   return () => {
  //     window.removeEventListener('beforeunload', alertUser)
  //     window.addEventListener('unload', leaveGame())
  //   }
  // }, [])

  // const alertUser = event => {
  //   event.preventDefault()
  //   event.returnValue = ''
  // }
  
  // useEffects to initially get the round data - at the page load, so that we can display blackCard
  // fist this one is called then fetchData for player then other fetchData with didMount
  useEffect(() => {

    // initially, set countdown to 0
    if (!sessionStorage.getItem('winnerCountdown')) {
      sessionStorage.setItem('winnerCountdown', 0);
    // or to -1 on page-refreshing
    } else if (sessionStorage.getItem('winnerCountdown') == 0) {
      sessionStorage.setItem('winnerCountdown', -1);
    }

    fetchRoundData();
    
  }, []);

  /*
   useEffect used to always fetch new Player-data (white cards & role) whenever a new round starts 
   (so when roundNr changes!) OR when a card was played (to only display 9 white cards)
  */
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/player');
        const player = new Player(response.data);
        setPlayer(player);
      } catch (error) {
        catchError(history, error, 'fetching the player data');
      }
    }
    fetchData();
  }, [roundNr, cardsPlayed]);


  /*
  This useInterval is used to periodically fetch data regarding the rounds of the game. 
  This includes things such as the played cards, (so that the played cards from all 
  players are shown), the black card as well as the current round number
  */
  useInterval(() => {
    // if new round data is available, display the new data
    fetchRoundData();
  }, pollingActive ? 1500 : null);


  /*
  This useInterval is used to fetch the latest round winner, the opponent names and the roundNr
  */
  useInterval(() => {
    fetchGameInformation();
  }, pollingActive ? 1500 : null);


  const fetchRoundData = async () => {
    try {
      console.log("Fetch round data");
      const response = await api.get(`/${gameId}/gameround`);
      // console.log(response.data);
      /*
      in case a new round started, save the important things in variables for now.
      The corresponding states will only be updated after a countdown (see useEffect of the roundWinner)
      */

      // will look something like this:
      roundId.current = response.data.roundId;
      blackCardVariable.current = response.data.blackCard;
      if (blackCard == null) { 
        setBlackCard(blackCardVariable.current); // COMMENT - called only intially when the blackCard is still null
      }
      setPlayersChoices(response.data.playedCards);
      // isFinal.current = response.data.isFinal; //TODO - uncomment after endpoint is there
      playersWhoPlayed.current = ["ghsdrtxdf", "Egdgfgjhjfghe"]; // TODO delete dummy data when endpoint is ready
    } catch (error) {
      catchError(history, error, 'fetching the round data');
    }
  }

  const fetchGameInformation = async () => {
    try {
      const response = await api.get(`/games/${gameId}`);
      roundNumberVariable.current = response.data.currentGameRoundIndex;
      if (roundNr == null) {
        setRoundNr(roundNumberVariable.current);
      }
      setRoundWinner(response.data.latestRoundWinner);
      setRoundWinningCardText(response.data.latestWinningCardText);
      setOpponentNames(response.data.playerNames)
    } catch (error) {
      catchError(history, error, 'fetching the winner data');
    }
  }


  /*
  As soon as the roundWinner is determined (and therefore, roundWinningCardText changes),
  a countdown of 15 seconds will start
  */
  useEffect(() => {
    // DO NOT include 15 second countown when mounting (render immediately)
    if (!didMount.current) {
      didMount.current = true;
      setRoundNr(roundNumberVariable.current);  // this will also trigger the useEffect to fetch the player data
      setBlackCard(blackCardVariable.current);
      setCardsPlayed(0); //enable the submit button again
    } else {
      // this will trigger the useEffect for the countdown
      let existingCountdown = sessionStorage.getItem('winnerCountdown');
      let firstRoundDone = sessionStorage.getItem('firstRoundDone');
      
      // if a countdown is still going, keep going where it was
      if (existingCountdown > 0) {
        setCountdown(existingCountdown);
      // if the countdown is at 0 or we are in first round, trigger the confetti
      } else if (existingCountdown == 0 || !firstRoundDone) {
        setCountdown(15);
      // if we re-rendered, don't show the countdown
      } else {
        sessionStorage.setItem('winnerCountdown', 0);
      }
      setChosenCard(null);
      setChosenWinner(null);
    }
  }, [roundWinningCardText]); // use roundWinningCardText to ensure change


  /*
  This useEffect is used to check whether the amount of opponents decreased
  If this happened (meaning: someone left), every player will be forced to
  leave as well
  */
  useEffect(() => {
    if (opponentNames == null) return;
    if (opponentNames.length != 3) {
      kick();
    }
  }, [opponentNames])


  /*
  useEffect for the 15 second countdown before new round starts.
  After that, the information of the new round will be rendered!
  */
  useEffect(() => {
    if (countdown > 0) {
      // for 15 seconds, just count down
      setTimeout(() => {
        sessionStorage.setItem('firstRoundDone', true); // not first round anymore
        setCountdown(countdown - 1);
        sessionStorage.setItem('winnerCountdown', countdown - 1)
      }, 1000);
    } else {
      // after 15 seconds, update the states from the new round data
      setRoundNr(roundNumberVariable.current);  // this will also trigger the useEffect to fetch the new player data
      setBlackCard(blackCardVariable.current);
      setCardsPlayed(0); //enable the submit button again
      // startPlayingCountdown(); TODO Diego: start the countdown for the next round
      
      if (isFinal.current) {
        console.log("Going to end game screen");
        history.push(`/endGame/${gameId}`);
      }
    }
  }, [countdown])


  // ------------------------------ DIEGO: WORK IN PROGRESS ---------------------------------

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ PLAYING COUNTDOWN ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Method to start the playingCountdown
  // const startPlayingCountdown = async () => {
  //   return;
  //   // TODO if (cardczarmode AND normal player) OR (communitymode)
  //   // setPlayingCountdown(45); // start the playingCountdown for the next round
  // }

  // useEffect that is used for the playingCountdown
  // useEffect(() => {
  //   try {
  //     // just update the counter
  //     if (playingCountdown > 0) {
  //       setTimeout(() => {
  //         setPlayingCountdown(playingCountdown - 1);
  //         sessionStorage.setItem('playingCountdown', playingCountdown - 1);
  //       }, 1000);
  //     } else if (playingCountdown == 0) {
  //       // only reached if playingCountdown ends
  //       if (chosenCard == null) return; // TODO submit random card
  //       else return; // TODO submit chosenCard
  //     }
  //   } catch (error) {
  //     catchError(history, error, 'updating the playingCountdown');
  //   }
  // }, [playingCountdown]);

  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ CHOOSING COUNTDOWN ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // useEffect when the playerChoices change, in order to trigger the choosingCountdown
  // useEffect(() => {
  //   if (playersChoices.length == 3 && player.cardCzar) {
  //     startChoosingCountdown();
  //   }
  //   // TODO for community game mode, if it is 4
  // }, [playersChoices]);

  // Method to start the choosingCountdown
  // const startChoosingCountdown = async () => {
  //   return;
  //   // TODO if (cardczarmode AND normal player) OR (communitymode)
  //   // setPlayingCountdown(45); // start the countdown for the next round
  // }

  // useEffect that is used for the choosingCountdown
  // useEffect(() => {
  //   try {
  //     if (choosingCountdown > 0) {
  //       setTimeout(() => {
  //         setChoosingCountdown(choosingCountdown - 1);
  //         sessionStorage.setItem('choosingCountdown', choosingCountdown - 1);
  //       }, 1000);
  //     } else if (choosingCountdown == 0) {
  //       // only reached if choosingCountdown ends
  //       if (chosenWinner == null) return; // TODO submit random winningCard
  //       else return; // TODO submit chosenWinner
  //     }
  //   } catch (error) {
  //     catchError(history, error, 'updating the choosingCountdown');
  //   }
  // }, [choosingCountdown]);

  // ------------------------------ DIEGO: WORK IN PROGRESS ---------------------------------

  // method that is called when a player plays a white card
  const playCard = async () => {
    try {
      const requestBody = JSON.stringify({'cardId' : chosenCard}); // chosenCard = id of the card 
      await api.post(`/${roundId.current}/white`, requestBody);
      console.log("Player submitted a card: ", chosenCard);
      /*
      after successfully playing a card, change cardsPlayed so that the useEffect is triggered
      to fetch the playerData. This will then update the white cards (only 9 left)
      */
     setCardsPlayed(cardsPlayed + 1);
     // TODO Diego: setPlayingCountdown(-1);
     // TODO Diego: sessionStorage.setItem('playingCountdown', -1);
    } catch (error) {
      catchError(history, error, 'playing a white card');
    }
  }


  // method that is used when the Card Czar chooses a round winner
  const chooseRoundWinner = async () => {
    try {
      const requestBody = JSON.stringify({'cardId' : chosenWinner});// chosenWinner = id of the card 
      await api.post(`/${roundId.current}/roundWinner`, requestBody);
      console.log("Card Czar picked a card: ", chosenWinner); 
      setCardsPlayed(cardsPlayed + 1); // to make the submit button disabled after submission
      // TODO Diego: setChoosingCountdown(-1);
      // TODO Diego: sessionStorage.setItem('choosingCountdown', -1);
    } catch (error) {
      catchError(history, error, 'choosing the winning card');
    }
  }

  // method for players to leave an ongoing game
  const leaveGame = async () => {
    try {
      // TODO give player a choice to not leave (alert-style)
      setPollingActive(false);
      await api.put('/leave/'+gameId);
      sessionStorage.clear();
      history.push('/lobby');
    } catch (error) {
      catchError(history, error, 'leaving the game');
    }
  }

  // method for players to be kicked out
  const kick = async () => {
    try {
      setPollingActive(false);
      alert("Someone left the game, therefore you can not keep playing :-(")
      await api.put('/leave/'+gameId);
      sessionStorage.clear();
      history.push('/lobby');
    } catch (error) {
      catchError(history, error, 'being kicket out of the game');
    }
  }

  // blurr background if countdown is active 
  const mainClass = countdown === 0 ? 'gameView main' : 'gameView blurryMain';

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (player != null && blackCard != null && playersChoices != null && roundNr != null && opponentNames != null && opponentNames != playersWhoPlayed) {
    content = (
      <div className = {mainClass}>

        <div className="gameView roundSection">
          {"Round "+roundNr}
          {player.cardCzar === false && <p>You are a normal player this round - pick card from hand!</p>}
          {player.cardCzar === true && <p>You are a Card Czar this round - pick played card that you think is best!</p>}
        </div>
        
        {/* // COMMENT - displaying which Player has already made a choice
        // TESTME - should be tested once the endpoint is ready  */}
        <div className="gameView opponentSection center"> 
          {Object.keys(opponentNames).length > 0 && (!(playersWhoPlayed.current.includes(opponentNames[0]))) && <h2>{opponentNames[0]}</h2>}
          {Object.keys(opponentNames).length > 0 && (playersWhoPlayed.current.includes(opponentNames[0])) && <h2 style={{color: 'green'}}>{opponentNames[0]}</h2>}
          <div className="gameView opponentSection tile"></div>
        </div>
        <div className="gameView opponentSection"> 
          {Object.keys(opponentNames).length > 1 && (!(playersWhoPlayed.current.includes(opponentNames[1]))) && <h2>{opponentNames[1]}</h2>}
          {Object.keys(opponentNames).length > 1 && (playersWhoPlayed.current.includes(opponentNames[1])) && <h2 style={{color: 'green'}}>{opponentNames[1]}</h2>}
          <div className="gameView opponentSection tile"></div>
        </div>
        <div className="gameView blackCardSection">
          <Card isBlack={true} isChoice={false} key={blackCard.cardId} text={blackCard.cardText} role={player.cardCzar}/>
        </div>
        <div className="gameView opponentSection"> 
          {Object.keys(opponentNames).length > 2 && (!(playersWhoPlayed.current.includes(opponentNames[2]))) && <h2>{opponentNames[2]}</h2>}
          {Object.keys(opponentNames).length > 2 && (playersWhoPlayed.current.includes(opponentNames[2])) && <h2 style={{color: 'green'}}>{opponentNames[2]}</h2>}
          <div className="gameView opponentSection tile"></div>
        </div>

        {/* Displaying of the roundWinner (small and all the time)*/}
        {/* <div className="gameView roundWinnerSection">
          {roundWinner == null && <h3>Last round was won by: {roundWinner}</h3>}
        </div> */}

        <div className="gameView cardsSection">
          {/* COMMENT - choice section for Card Czar */}
          <div className="gameView choiceSection">
            <h2>Round's played cards:</h2>
            <div className="gameView choiceSection cards">
              {/* COMMENT - makes the card not clickable after submitting */}
              <div className="gameView choiceSection cards">
                {(cardsPlayed > 0) && 
                  playersChoices.map(choice => (
                  <Card isBlack={false} isChoice={false} key={choice.cardId} text={choice.cardText} role={true}/>
                ))}
              </div> 
              {(cardsPlayed == 0) && 
                <div className="gameView choiceSection cards">
                  {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} role={player.cardCzar}/>}
                  {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} role={player.cardCzar}/>}
                  {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} role={player.cardCzar}/>}
                </div> 
              }
              </div>
          </div>


          {/* COMMENT - choice section for normal players */}
          <div className="gameView handSection">
            <h2>Your hand:</h2>
            <div className="gameView whiteCardSection">
              {/* COMMENT - makes the card not clickable after submitting */}
              {(cardsPlayed > 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={true} key={card.cardId} cardId={card.cardId} text={card.cardText} role={false}/>
                  ))}
                </div> 
              }
              {(cardsPlayed == 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={false} key={card.cardId} cardId={card.cardId} text={card.cardText} role={player.cardCzar}/>
                  ))}
                </div> 
              }
            </div>
          </div>
        </div>


        {/* COMMENT - SECTION - if you are normal Player */}
        {player.cardCzar == false && 
          <div className="gameView bottomSection">
            <Button
                width="100%"
                onClick={() => leaveGame()}
              >
              🥺 Leave game...
            </Button>
            <Button
                disabled = {!chosenCard || (cardsPlayed > 0)}
                width="100%"
                // onClick={() => window.location.reload(false)}
                onClick={() => setChosenCard(null)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenCard || (cardsPlayed > 0)}
                width="100%"
                onClick={() => playCard()}
              >
              ✔️ Submit
            </Button>
          </div>
        } 

        {/*COMMENT - SECTION - if you are Card Czar */}
        {player.cardCzar == true && 
          <div className="gameView bottomSection">
            <Button
                width="100%"
                onClick={() => leaveGame()}
              >
              🥺 Leave game...
            </Button>
            <Button
                disabled = {!chosenWinner || (cardsPlayed > 0)}
                width="100%"
                // onClick={() => window.location.reload(false)}
                onClick={() => setChosenWinner(null)}
              >
              🔁 Reset choice
            </Button>
            <Button
                disabled = {!chosenWinner || (Object.keys(playersChoices).length != 3) || (cardsPlayed > 0)}
                width="100%"
                onClick={() => chooseRoundWinner()}
              >
              ✔️ Submit
            </Button>
          </div>
        } 
      </div>
    );
  } 
  // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="gameView container">
      {/* Include countdown until new round starts 
      and display the roundWinner in a fancy way while countdown is active*/}
      {countdown != 0 && 
      <div>
        <div className="gameView countdownSection">
          {isFinal.current && <p>Game end screen displayed in: {countdown}</p>}
          {!isFinal.current && <p>Next round starts in: {countdown}</p>}
          {/* <p>Next round starts in: {countdown}</p> */}
        </div>
        <div className="gameView countdownSection roundWinner">
          <p>
            This round was won by: {roundWinner} with the following card:<br/>
            " {roundWinningCardText} "
          </p> 
        </div>
        <Confetti/>
      </div>}
      {content}
    </BaseContainer>
  );
};

export default GameView;