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
import EndGame from 'models/EndGame';

const GameView = () => {
  const { gameId } = useParams();
  const history = useHistory();
  const didMount = useRef(false);

  // COMMENT Player data:
  const [player, setPlayer] = useState(null);
  const [wasCardPlayed, SetWasCardPlayed] = useState(false); // used in connection to sessionStorage.getItem('cardsPlayed')

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
  // const [cardsPlayed, setCardsPlayed] = useState(0); // if this is > 0 then button is disabled till next round 
  const [opponentNames, setOpponentNames] = useState(null);
  const playersWhoPlayed= useRef(null);
  const isCardCzarMode= useRef(null);
  const [endGame, setEndGame] = useState(null); // leaderboard table during the game
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

    // initially, set cardsPlayed to 0
    if (!sessionStorage.getItem('cardsPlayed')) {
      sessionStorage.setItem('cardsPlayed', 0);
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
  }, [roundNr, wasCardPlayed]);

  // COMMENT - fetch EndGame data:
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/${gameId}/gameEnd`);
        const endGame = new EndGame(response.data);
        setEndGame(endGame);
        console.log("EndGame data received"); 
      } catch (error) {
        catchError(history, error, 'fetching the EndGame data');
      }
    }
    fetchData();
  }, [roundNr]);
  // COMMENT - display GAME SUMMARY based on EndGame data:
  const getSummary = () => {
    // create a dict out of two lists and sort it - most round wins at the top
    const dict_players = endGame.playersNames.map((userName, i) => ({
      userName,
      roundsWon: endGame.playersNumbersOfPicked[i]
    }));
    dict_players.sort((a, b) => b.roundsWon - a.roundsWon);
    const element = dict_players.map(player => (
        <tr key = {player["userName"]} className = "gameView gameSummary playerStats">
            <td>{player["userName"]}</td>
            <td>{player["roundsWon"]}</td>
        </tr>));
    const summaryTable = (   
    <table className = "gameView leaderboardtable">
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
      isCardCzarMode.current = response.data.cardCzarMode; 
      setRoundWinner(response.data.latestRoundWinner);
      setRoundWinningCardText(response.data.latestWinningCardText);
      setOpponentNames(response.data.playerNames);
      // console.log(sessionStorage.getItem('cardsPlayed', 0));
      // console.log(isCardCzarMode.current);
      // console.log(response.data);
      // console.log('chosenCard', chosenCard);
      // console.log('chosenWinner', chosenWinner);
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
    } else {
      // this will trigger the useEffect for the countdown
      let existingCountdown = sessionStorage.getItem('winnerCountdown');
      let firstRoundDone = sessionStorage.getItem('firstRoundDone');
      
      // if a countdown is still going, keep going where it was
      if (existingCountdown > 0) {
        setCountdown(existingCountdown);
      // if the countdown is at 0 or we are in first round, trigger the confetti
      } else if (existingCountdown == 0 || !firstRoundDone) {
        setCountdown(5);
      // if we re-rendered, don't show the countdown
      } else {
        sessionStorage.setItem('winnerCountdown', 0);
      }
      setChosenCard(null);
      setChosenWinner(null);
      // TODO set session storage to 0 after the round is over, maybe also wasCardPlayed to null
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
      sessionStorage.setItem('cardsPlayed', 0); // enable the submit button again
    } else {
      // after 15 seconds, update the states from the new round data
      setRoundNr(roundNumberVariable.current);  // this will also trigger the useEffect to fetch the new player data
      setBlackCard(blackCardVariable.current);
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
      const requestBody = JSON.stringify({'cardId' : chosenCard, 'gameId': gameId}); // chosenCard = id of the card 
      await api.post(`/${roundId.current}/white`, requestBody);
      console.log("Player submitted a card: ", chosenCard);
      if(isCardCzarMode.current === false){
        setChosenCard(null); // TODO not needed after we display only cards that were not played by the player
      }
      /*
      after successfully playing a card, change cardsPlayed so that the useEffect is triggered
      to fetch the playerData. This will then update the white cards (only 9 left)
      */
      sessionStorage.setItem('cardsPlayed', 1);
      SetWasCardPlayed(true);
     // TODO Diego: setPlayingCountdown(-1);
     // TODO Diego: sessionStorage.setItem('playingCountdown', -1);
    } catch (error) {
      catchError(history, error, 'playing a white card');
    }
  }


  // method that is used when the Card Czar chooses a round winner
  const chooseRoundWinner = async () => {
    try {
      const requestBody = JSON.stringify({'cardId' : chosenWinner, 'gameId': gameId});// chosenWinner = id of the card 
      await api.post(`/${roundId.current}/roundWinner`, requestBody);
      console.log("Card Czar picked a card: ", chosenWinner); 
      if(isCardCzarMode.current){
        sessionStorage.setItem('cardsPlayed', 1); // to make the submit button disabled after submission in CardCzar mode
      }
      else{
        sessionStorage.setItem('cardsPlayed', 2); // to make the submit button disabled after submission in Community mode
      }
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

  const displayRoundSection = (roundNr, player, isCardCzarMode) => {
    if(isCardCzarMode.current === false){
      const container = (<div className="gameView roundSection">
                        {"Round "+roundNr}
                        {player.cardCzar === false && <p className = "vibrate">Submit a card from your hand, then pick your favourite from round's played cards!</p>}
                      </div>);
      return container;
    }
    else{
      const container = (<div className="gameView roundSection">
        {"Round "+roundNr}
        {player.cardCzar === false && <p className = "vibrate">You are a normal player this round - pick card from hand!</p>}
        {player.cardCzar === true && <p className = "vibrate" >You are a Card Czar this round - pick played card that you think is best!</p>}
      </div>);
      return container;
    }
  }

  const displayPlayedCards = (playersChoices, player, isCardCzarMode) => {
    if(isCardCzarMode.current === true){
      return (
        <div className="gameView choiceSection cards">
          <div className="gameView choiceSection cards">
            {(sessionStorage.getItem('cardsPlayed') == 1) && 
              playersChoices.map(choice => (
              <Card isBlack={false} isChoice={false} key={choice.cardId} text={choice.cardText} role={true}/>
            ))}
          </div> 
          {(sessionStorage.getItem('cardsPlayed') == 0) && 
            <div className="gameView choiceSection cards">
              {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} role={player.cardCzar}/>}
              {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} role={player.cardCzar}/>}
              {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} role={player.cardCzar}/>}
            </div> 
          }
      </div>
      );
    }else{
      // it is not a CardCzar mode so normal player should be able to send CHOICE after he/she submitted a card
      return (
        <div className="gameView choiceSection cards">
          <div className="gameView choiceSection cards">
            {(sessionStorage.getItem('cardsPlayed') != 1) && 
              playersChoices.map(choice => (
              <Card isBlack={false} isChoice={false} key={choice.cardId} text={choice.cardText} role={true}/>
            ))}
          </div> 
          {/* Played cards are clickable only when player already submitted a choice */}
          {(sessionStorage.getItem('cardsPlayed') == 1) && 
            <div className="gameView choiceSection cards">
              {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} role={true}/>}
              {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} role={true}/>}
              {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} role={true}/>}
            </div> 
          }
      </div>
      );
    }
  }


  const displayButtons = (player, isCardCzarMode, chosenCard, playersChoices) => {
    if((isCardCzarMode.current === true && player.cardCzar === false) || (isCardCzarMode.current === false && sessionStorage.getItem('cardsPlayed') == 0)){
      // We are a normal player - works for submission of cards from hand in both game modes:
      return (
              <div className="gameView bottomSection">
                <Button
                    width="100%"
                    onClick={() => leaveGame()}
                  >
                  🥺 Leave game...
                </Button>
                <Button
                    disabled = {!chosenCard || (sessionStorage.getItem('cardsPlayed') > 0)}
                    width="100%"
                    // onClick={() => window.location.reload(false)}
                    onClick={() => setChosenCard(null)}
                  >
                  🔁 Reset choice
                </Button>
                <Button
                    disabled = {!chosenCard || (sessionStorage.getItem('cardsPlayed') > 0)}
                    width="100%"
                    onClick={() => playCard()}
                  >
                  ✔️ Submit
                </Button>
              </div>);
    }

    if(player.cardCzar === true){
        // We are a Card Czar:
        return (
                <div className="gameView bottomSection">
                  <Button
                      width="100%"
                      onClick={() => leaveGame()}
                    >
                    🥺 Leave game...
                  </Button>
                  <Button
                      disabled = {!chosenWinner || (sessionStorage.getItem('cardsPlayed') > 0)}
                      width="100%"
                      // onClick={() => window.location.reload(false)}
                      onClick={() => setChosenWinner(null)}
                    >
                    🔁 Reset choice
                  </Button>
                  <Button
                      disabled = {!chosenWinner || (Object.keys(playersChoices).length != 3) || (sessionStorage.getItem('cardsPlayed') > 0)}
                      width="100%"
                      onClick={() => chooseRoundWinner()}
                    >
                    ✔️ Submit
                  </Button>
                </div>);
    }

    if((isCardCzarMode.current === false && sessionStorage.getItem('cardsPlayed') > 0)){
      // Player in second game mode, when he/she submitted a card from hand - now needs to choose a winner:
      return (
        <div className="gameView bottomSection">
          <Button
              width="100%"
              onClick={() => leaveGame()}
            >
            🥺 Leave game...
          </Button>
          <Button
              disabled = {!chosenWinner || (sessionStorage.getItem('cardsPlayed') == 2)}
              width="100%"
              // onClick={() => window.location.reload(false)}
              onClick={() => setChosenWinner(null)}
            >
            🔁 Reset choice
          </Button>
          <Button
              disabled = {!chosenWinner || (Object.keys(playersChoices).length < 3) || (sessionStorage.getItem('cardsPlayed') == 2)} //BUG - after Ege filters change "<3" to "!=3"
              width="100%"
              onClick={() => chooseRoundWinner()}
            >
            ✔️ Submit
          </Button>
        </div>);
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
        {displayRoundSection(roundNr, player, isCardCzarMode)}
        
        {/* // COMMENT - displaying which Player has already made a choice
        // TESTME - should be tested once the endpoint is ready  */}
        <div className="gameView topSection">
          <div className="gameView topSection leaderboard"></div>
          <div className="gameView topSection center"> 
            <div className="gameView tile">
              {Object.keys(opponentNames).length > 0 && (!(playersWhoPlayed.current.includes(opponentNames[0]))) && <h2>{opponentNames[0]}</h2>}
              {Object.keys(opponentNames).length > 0 && (playersWhoPlayed.current.includes(opponentNames[0])) && <h2 style={{color: 'green'}}>{opponentNames[0]}</h2>}
            </div>
          </div>
          <div className="gameView topSection leaderboard">
            <h4>Leaderboard</h4>
            {getSummary()} 
          </div>
        </div>

        <div className="gameView middleSection">
          <div className="gameView middleSection opponentSection"> 
            <div className="gameView tile">
              {Object.keys(opponentNames).length > 1 && (!(playersWhoPlayed.current.includes(opponentNames[1]))) && <h2>{opponentNames[1]}</h2>}
              {Object.keys(opponentNames).length > 1 && (playersWhoPlayed.current.includes(opponentNames[1])) && <h2 style={{color: 'green'}}>{opponentNames[1]}</h2>}
            </div>
          </div>
          <div className="gameView middleSection blackCardSection">
            <Card isBlack={true} isChoice={false} key={blackCard.cardId} text={blackCard.cardText} role={player.cardCzar}/>
          </div>
          <div className="gameView middleSection opponentSection"> 
            <div className="gameView tile">
              {Object.keys(opponentNames).length > 2 && (!(playersWhoPlayed.current.includes(opponentNames[2]))) && <h2>{opponentNames[2]}</h2>}
              {Object.keys(opponentNames).length > 2 && (playersWhoPlayed.current.includes(opponentNames[2])) && <h2 style={{color: 'green'}}>{opponentNames[2]}</h2>}
            </div>
          </div>
        </div>

        {/* Displaying of the roundWinner (small and all the time)*/}
        {/* <div className="gameView roundWinnerSection">
          {roundWinner == null && <h3>Last round was won by: {roundWinner}</h3>}
        </div> */}


        <div className="gameView cardsSection">
          {/* COMMENT - choice section for PLAYED CARDS */}
          <div className="gameView choiceSection">
            <h2>Round's played cards:</h2>
            {displayPlayedCards(playersChoices, player, isCardCzarMode)}
          </div>

          {/* COMMENT - choice section for normal players */}
          <div className="gameView handSection">
            <h2>Your hand:</h2>
            <div className="gameView whiteCardSection">
              {/* COMMENT - cardsPlayed makes the card not clickable after submitting */}
              {(sessionStorage.getItem('cardsPlayed') > 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={true} key={card.cardId} cardId={card.cardId} text={card.cardText} role={false}/>
                  ))}
                </div> 
              }
              {(sessionStorage.getItem('cardsPlayed') == 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={false} key={card.cardId} cardId={card.cardId} text={card.cardText} role={player.cardCzar}/>
                  ))}
                </div> 
              }
            </div>
          </div>
        </div>
        {/* BUTTONS SECTION */}
        {displayButtons(player, isCardCzarMode, chosenCard, playersChoices)}
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