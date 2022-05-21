import React, {useState, useEffect, useRef} from 'react';
import {useInterval, pickRandom, createText} from 'helpers/utils';
import {api, catchError} from 'helpers/api';
import Player from 'models/Player';
import {useHistory, useParams} from 'react-router-dom';
import {Confetti} from 'components/ui/Confetti';
import 'styles/views/GameView.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import EndGame from 'models/EndGame';
import { useSpeechSynthesis } from 'react-speech-kit';
import Countdown from 'components/ui/Countdown';
import {Button} from 'components/ui/Button';

const GameView = () => {
  const { gameId } = useParams();
  const history = useHistory();
  const didMount = useRef(false);

  // TEXT-TO-SPEECH
  const { speak, voices } = useSpeechSynthesis();

  // COMMENT Player data:
  const [player, setPlayer] = useState(null);
  const [wasCardPlayed, setWasCardPlayed] = useState(false); // used in connection to sessionStorage.getItem('cardsPlayed')
  const [cardsPlayed, setCardsPlayed] = useState(null); // used only to trigger re-rendering to disable buttons

  // COMMENT Round data: 
  const [blackCard, setBlackCard] = useState(null);
  const roundId = useRef(null);
  const [roundNr, setRoundNr] = useState(null);
  const [playersChoices, setPlayersChoices] = useState(null);  // cards that were played in this round
  const [roundWinner, setRoundWinner] = useState(null);
  const [roundWinningCardText, setRoundWinningCardText] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const isFinal = useRef(false); // if round is final then after countdown push to gameEndView screen
  const [isChoosing, setIsChoosing] = useState(sessionStorage.getItem('isChoosing') ?? false);
  
  // COMMENT Game data:
  // const [cardsPlayed, setCardsPlayed] = useState(0); // if this is > 0 then button is disabled till next round 
  const [opponentNames, setOpponentNames] = useState(null);
  const playersWhoPlayed= useRef(null);
  const isCardCzarMode = useRef(null);
  const [endGame, setEndGame] = useState(null); // leaderboard table during the game
  const totalRounds = useRef(null);

  // state to stop the polling when needed
  const [pollingActive, setPollingActive] = useState(true);

  // keep track of which card was selected - ID of the card
  // COMMENT they have to be reset to null when a new round starts! -> see "if (didMount.current) {...}"
  const [chosenCard, setChosenCard] = useState(null);     // id of the selected card
  const chosenCardText = useRef(null);
  const [chosenWinner, setChosenWinner] = useState(null); // id of the selected card

  // variables to temporarily store information of a new round
  const roundNumberVariable = useRef(roundNr);
  const blackCardVariable = useRef(blackCard);
  const playersChoicesVariable = useRef(playersChoices);

  // ------------------- Container for all cards ------------------------------
  const Card = props => {
    let className;
    if (props.cardId === chosenCard || props.cardId === chosenWinner) className = "card focused";
    // else if (props.cardId === chosenCard && playerAlreadyPlayed) {
        //  this card should stay makred as green 
        //  create a css which is marked as green 
    // }
    else className = props.isBlack ? "blackCard" : "card";

    let wrapperclass = props.parentClass+" child"

    let tts = props.tts && 
      <button onClick={() => {
        let speakingVoice;
        console.log(voices)
        for (let i=0; i < voices.length; i++) {
          if (voices[i].lang.includes('en')) {
            speakingVoice = voices[i];
          }
        }
        speak({text: createText(blackCard.cardText, props.text), voice: speakingVoice})
      }}>📢</button>

    // BLACK CARD
    if (props.isBlack) {
      return (
        <div className={className}>
          {props.text}
        </div>
      );
    }
    // WHITE CARD
    if(props.isChoice && props.role === true) {
      if (!props.choosable) {
        return(
          <div className={wrapperclass}>
          <button className="notActiveCard own" disabled>
            {props.text}
          </button>
          <div className="tts">{tts}</div>
          </div>
        );
      } else {
        return(
          <div className={wrapperclass}>
          <button className={className} onClick={() => setChosenWinner(props.cardId)}>
            {props.text}
          </button>
          <div className="tts">{tts}</div>
          </div>
        );
      }
    }
    else if(props.isChoice && props.role === false){
      return(
        <div className={wrapperclass}>
        <button className="notActiveCard" disabled>
          {props.text}
        </button>
        <div className="tts">{tts}</div>
        </div>
      );
    }
    else if(!props.isChoice && props.role === true){
      return(
        <div className={wrapperclass}>
        <button className="notActiveCard" disabled>
          {props.text}
        </button>
        <div className="tts">{tts}</div>
        </div>
      );
    }
    else if(!props.isChoice && props.role === false){
      return(
        <div className={wrapperclass}>
        <button className={className} onClick={() => {
          setChosenCard(props.cardId)
          chosenCardText.current = props.text}}>
          {props.text}
        </button>
        <div className="tts">{tts}</div>
        </div>
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

  // useEffect to set some sessionstorage and to initially get the round & player data - at the page load
  useEffect(() => {

    // initially, set winnerCountdown to 0
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
    fetchPlayerData();
  }, [roundNr, wasCardPlayed]);

  async function fetchPlayerData() {
    try {
      const response = await api.get('/player');
      const player = new Player(response.data);
      setPlayer(player);
      console.log("Player")
    } catch (error) {
      catchError(history, error, 'fetching the player data');
    }
  }

  // COMMENT - fetch LeaderBoard data when the roundNr changes
  useEffect(() => {
    fetchLeaderboardData();
  }, [roundNr]);

  // method to fetch the leaderboard data
  async function fetchLeaderboardData() {
    try {
      console.log("Leaderboard"); 
      const response = await api.get(`/${gameId}/gameEnd`);
      const endGame = new EndGame(response.data);
      setEndGame(endGame);
    } catch (error) {
      catchError(history, error, 'fetching the EndGame data');
    }
  }

  // COMMENT - display GAME SUMMARY based on EndGame data:
  const getSummary = (displayHeaders) => {
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
        {displayHeaders &&
        <tr>
          <th>Player name</th>
          <th>Rounds won</th>
        </tr>}
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
  }, pollingActive ? 1000 : null);


  // This useInterval is used to fetch the latest round winner, the opponent names and the roundNr
  useInterval(() => {
    fetchGameInformation();
  }, pollingActive ? 1000 : null);


  const fetchRoundData = async () => {
    try {
      console.log("Round");
      const response = await api.get(`/${gameId}/gameround`);
      // console.log(response.data);

      // in case a new round started, save the important things in useRefs for now.
      roundId.current = response.data.roundId;
      blackCardVariable.current = response.data.blackCard;
      isFinal.current = response.data.final;
      playersChoicesVariable.current = response.data.playedCards;
      if (blackCard == null) setBlackCard(blackCardVariable.current); // COMMENT - called only intially when the blackCard is still null
      if (playersChoices == null) setPlayersChoices(response.data.playedCards);
      // only re-render on actual change
      if (JSON.stringify(response.data.playedCards) != JSON.stringify(playersChoices)) {
        if (response.data.playedCards.length != 0)
          setPlayersChoices(response.data.playedCards);
      }
      playersWhoPlayed.current = ["ghsdrtxdf", "Egdgfgjhjfghe"]; // TODO delete dummy data when endpoint is ready
    } catch (error) {
      catchError(history, error, 'fetching the round data');
    }
  }

  const fetchGameInformation = async () => {
    try {
      console.log("Game")
      const response = await api.get(`/games/${gameId}`);
      roundNumberVariable.current = response.data.currentGameRoundIndex;
      if (roundNr == null) {
        setRoundNr(roundNumberVariable.current);
      }
      isCardCzarMode.current = response.data.cardCzarMode;
      totalRounds.current = response.data.numOfRounds;
      if (JSON.stringify(response.data.latestRoundWinner) != JSON.stringify(roundWinner))
        setRoundWinner(response.data.latestRoundWinner);
      if (JSON.stringify(response.data.latestWinningCardText) != JSON.stringify(roundWinningCardText))
        setRoundWinningCardText(response.data.latestWinningCardText);
      if (JSON.stringify(response.data.playerNames) != JSON.stringify(opponentNames))
        setOpponentNames(response.data.playerNames);
    } catch (error) {
      catchError(history, error, 'fetching the winner data');
    }
  }

  /*
  As soon as the roundWinner is determined (and therefore, roundWinningCardText changes),
  a countdown of 15 seconds will start. This value even changes for the community game mode!
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
      // the leaderboard data will to be updated before OR for the round overview
      fetchLeaderboardData();
      
      // if a countdown is still going, keep going where it was
      if (existingCountdown > 0) {
        setCountdown(existingCountdown);
      // if the countdown is at 0 or we are in first round, trigger the confetti
      } else if (existingCountdown == 0 || !firstRoundDone) {
        setCountdown(10);
      // if we re-rendered, don't show the countdown, but set it to 0 so it shows when it needs to
      } else {
        sessionStorage.setItem('winnerCountdown', 0);
      }
      setChosenCard(null);
      chosenCardText.current = null;
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
  useEffect for the countdown before new round starts.
  After that, the information of the new round will be rendered!
  */
  useEffect(() => {
    try {
      // as soon as the countdown somehow changes, reset choosingCountdown
      if (countdown > 0) {
        sessionStorage.setItem('firstRoundDone', true); // not first round anymore
        sessionStorage.setItem('playingCountdown', -1);
        // just count down
        setTimeout(() => {
          setCountdown(countdown - 1);
          sessionStorage.setItem('winnerCountdown', countdown - 1)
        }, 1000);
        sessionStorage.setItem('cardsPlayed', 0); // enable the submit button again
      } else {
        // after the countdown, check if the last round finished
        if (isFinal.current && playersChoicesVariable.current.length > 0) {
          console.log("Going to end game screen");
          history.push(`/endGame/${gameId}`);
          return;
        }
        // If not, update the states from the new round data
        setRoundNr(roundNumberVariable.current);  // this will also trigger the useEffect to fetch the new player data
        setBlackCard(blackCardVariable.current);
        setPlayersChoices(playersChoicesVariable.current);
        // and start the countdown for the next round
        if (opponentNames != null) {
          sessionStorage.setItem('playingCountdown', 60);
          setIsChoosing(false);
          sessionStorage.setItem('isChoosing', false);
        }
        setWasCardPlayed(false);
      }
    } catch (error) {
      catchError(history, error, 'updating the countdown');
    }
  }, [countdown])


  // ------------------------------ DIEGO: GAME COUNTDOWN ---------------------------------

  const handleTimerFinish = () => {
    // ----- PLAY card -----
    if (!isChoosing) {
      // if you have already played or don't need to play, then don't do anything
      if (player.cardCzar || (sessionStorage.getItem('cardsPlayed') == 1)) return;
      playCard();
      return;
    }
    // ----- CHOOSE card -----
    // if you are no card czar or have already submitted, don't submit again
    if ((isCardCzarMode.current && !player.cardCzar) ||
      (isCardCzarMode.current && player.cardCzar && sessionStorage.getItem('cardsPlayed') == 1) ||
      (!isCardCzarMode.current && (sessionStorage.getItem('cardsPlayed') == 2))) return;
    chooseRoundWinner(); // otherwise, automatically submit
  }


  // useEffect when the playerChoices change, in order to trigger the choosingCountdown
  useEffect(() => {
    if (playersChoices == null) return;
    if ((isCardCzarMode.current && playersChoices.length == 3) || (!isCardCzarMode.current && playersChoices.length == 4)) {
      if (isChoosing) return;
      setIsChoosing(true);
      sessionStorage.setItem('isChoosing', true);
      sessionStorage.setItem('playingCountdown', 45);
    }
  }, [playersChoices]);


  // method that is called when a player plays a white card
  const playCard = async () => {
    try {
      if (isCardCzarMode.current === false) {
        setChosenCard(null); // TODO not needed after we display only cards that were not played by the player
        chosenCardText.current = null;
      }
      // change cardsPlayed so that the useEffect is triggered to fetch the playerData (only 9 cards remaining)
      sessionStorage.setItem('cardsPlayed', 1);
      setCardsPlayed(cardsPlayed + 1);   // ensure re-render to disable button
      let requestBody;
      // automatically choose card (in case countdown end is reached)
      if (chosenCard == null) {
        let randomInt = pickRandom(10);
        let combination = createText(blackCard.cardText, player.cardsOnHands[randomInt].cardText)
        requestBody = JSON.stringify({'cardId' : player.cardsOnHands[randomInt].cardId, 'gameId': gameId, 'currentCombination' : combination});
      } else {
        let combination = createText(blackCard.cardText, chosenCardText.current)
        requestBody = JSON.stringify({'cardId' : chosenCard, 'gameId': gameId, 'currentCombination' : combination}); // chosenCard = id of the card 
      }
      await api.post(`/${roundId.current}/white`, requestBody);
      console.log("Player submitted a card: ", chosenCard);
      setWasCardPlayed(true);
      fetchRoundData(); // fetch round data to immediately display the own choice
    } catch (error) {
      catchError(history, error, 'playing a white card');
      sessionStorage.setItem('cardsPlayed', 0);
      setCardsPlayed(cardsPlayed - 1);
    }
  }


  // method that is used when the Card Czar chooses a round winner
  const chooseRoundWinner = async () => {
    try {
      if (isCardCzarMode.current) {
        sessionStorage.setItem('cardsPlayed', 1); // to make the submit button disabled after submission in CardCzar mode
      } else {
        sessionStorage.setItem('cardsPlayed', 2); // to make the submit button disabled after submission in Community mode
      }
      setCardsPlayed(cardsPlayed + 1);   // ensure re-render to disable button
      let requestBody;
      // automatically choose winner (in case countdown end is reached) - first or second card
      if (chosenWinner == null) {
        if (playersChoices[0].canBeChoosen) requestBody = JSON.stringify({'cardId' : playersChoices[0].cardId, 'gameId': gameId});
        else requestBody = JSON.stringify({'cardId' : playersChoices[1].cardId, 'gameId': gameId});
      } else {
        requestBody = JSON.stringify({'cardId' : chosenWinner, 'gameId': gameId}); // chosenWinner = id of the card 
      }
      await api.post(`/${roundId.current}/roundWinner`, requestBody);
      console.log("Card Czar picked a card: ", chosenWinner); 
    } catch (error) {
      catchError(history, error, 'choosing the winning card');
      if (isCardCzarMode.current) sessionStorage.setItem('cardsPlayed', 0); // to enable button again if error is encountered
      else sessionStorage.setItem('cardsPlayed', 1); // to enable button again if error is encountered
      setCardsPlayed(cardsPlayed - 1); // re-render to make button enabled again
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
      catchError(history, error, 'being kicked out of the game');
    }
  }

  const displayRoundSection = (roundNr, player, isCardCzarMode) => {
    if(isCardCzarMode.current === false){
      const container = (<div className="gameView roundSection">
                        {"Round "+roundNr+" / "+totalRounds.current}
                        {player.cardCzar === false && <p className = "vibrate">Submit a card from your hand, then pick your favourite from round's played cards!</p>}
                      </div>);
      return container;
    }
    else{
      const container = (<div className="gameView roundSection">
        {"Round "+roundNr+" / "+totalRounds.current}
        {player.cardCzar === false && <p className = "vibrate">You are a normal player this round - pick card from hand!</p>}
        {player.cardCzar === true && <p className = "vibrate" >You are a Card Czar this round - pick played card that you think is best!</p>}
      </div>);
      return container;
    }
  }

  const displayPlayedCards = (playersChoices, player, isCardCzarMode) => {
    if(isCardCzarMode.current === true) {
      if (sessionStorage.getItem('cardsPlayed') == 1) {
        return (
          <div className="gameView choiceSection cards">
            {playersChoices.map(choice => (
            <Card isBlack={false} isChoice={false} key={choice.cardId} text={choice.cardText} choosable={false} role={true} tts={true} parentClass="gameView choiceSection cards"/>
            ))}
          </div>
        );
      } else if (sessionStorage.getItem('cardsPlayed') == 0) {
        return (
          <div className="gameView choiceSection cards">
            {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} choosable={true} role={player.cardCzar} tts={true} parentClass="gameView choiceSection cards"/>}
            {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} choosable={true} role={player.cardCzar} tts={true} parentClass="gameView choiceSection cards"/>}
            {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} choosable={true} role={player.cardCzar} tts={true} parentClass="gameView choiceSection cards"/>}
          </div>
        );
      }
    } else {
      // it is not a CardCzar mode so normal player should be able to send CHOICE after he/she submitted a card
      if (sessionStorage.getItem('cardsPlayed') != 1) {
        return (
          <div className="gameView choiceSection cards">
            {playersChoices.map(choice => (
            <Card isBlack={false} isChoice={false} key={choice.cardId} text={choice.cardText} choosable={choice.canBeChoosen} role={true} tts={true} parentClass="gameView choiceSection cards"/>
            ))}
          </div>
        );
      } else if (sessionStorage.getItem('cardsPlayed') == 1) {
        return (
          <div className="gameView choiceSection cards">
            {Object.keys(playersChoices).length > 0 && <Card isBlack={false} isChoice={true} cardId={playersChoices[0].cardId} text={playersChoices[0].cardText} choosable={playersChoices[0].canBeChoosen} role={true} tts={true} parentClass="gameView choiceSection cards"/>}
            {Object.keys(playersChoices).length > 1 && <Card isBlack={false} isChoice={true} cardId={playersChoices[1].cardId} text={playersChoices[1].cardText} choosable={playersChoices[1].canBeChoosen} role={true} tts={true} parentClass="gameView choiceSection cards"/>}
            {Object.keys(playersChoices).length > 2 && <Card isBlack={false} isChoice={true} cardId={playersChoices[2].cardId} text={playersChoices[2].cardText} choosable={playersChoices[2].canBeChoosen} role={true} tts={true} parentClass="gameView choiceSection cards"/>}
            {Object.keys(playersChoices).length > 3 && <Card isBlack={false} isChoice={true} cardId={playersChoices[3].cardId} text={playersChoices[3].cardText} choosable={playersChoices[3].canBeChoosen} role={true} tts={true} parentClass="gameView choiceSection cards"/>}
          </div>
        );
      }
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
                    onClick={() => {
                      setChosenCard(null)
                      chosenCardText.current = null}}
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
              onClick={() => setChosenWinner(null)}
            >
            🔁 Reset choice
          </Button>
          <Button
              disabled = {!chosenWinner || (Object.keys(playersChoices).length < 4) || (sessionStorage.getItem('cardsPlayed') == 2)} //BUG - after Ege filters change "<3" to "!=3"
              width="100%"
              onClick={() => chooseRoundWinner()}
            >
            ✔️ Submit
          </Button>
        </div>);
    }
    
  }

  /* 
  Include countdown until new round starts 
  and display the roundWinner in a fancy way while countdown is active
  */
  const displayEndRoundView = () => {
    let text;
    if (isFinal.current && playersChoicesVariable.current.length > 0) {
      text = <p>The Game overview is displayed in: {countdown}</p>
    } else {
      text = <p>Next round starts in: {countdown}</p>
    }

    // countdownView is the same for both gamemodes
    let countdownView = (
      <div className="gameView countdownSection">
        {text}
      </div>
    );

    if (isCardCzarMode.current) {
      return (
        <div>
          {countdownView}
          <div className="gameView countdownSection roundWinner">
            <p>This round was won by "{roundWinner}" with the following card:<br/>
            {roundWinningCardText}</p> 
          </div>
          <Confetti/>
        </div>
      );
    } else {
      return (
        <div>
          {countdownView}
          <div className="gameView countdownSection roundLeaderboard">
            <p>The current status of the game is:<br/>{getSummary(false)}</p>
          </div>
          <Confetti/>
        </div>
      );
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
          <div className="gameView topSection leaderboard">
            {/* COUNTDOWN */}
            { !isChoosing &&
              <div><h3>Time left to play a card:</h3><br/><Countdown onFinish={handleTimerFinish} /></div>}
            { isChoosing &&
              <div><h3>Time left to pick a favourite:</h3><br/><Countdown onFinish={handleTimerFinish} /></div>}
          </div>
          <div className="gameView topSection center"> 
            <div className="gameView tile">
              {Object.keys(opponentNames).length > 0 && (!(playersWhoPlayed.current.includes(opponentNames[0]))) && <h2>{opponentNames[0]}</h2>}
              {Object.keys(opponentNames).length > 0 && (playersWhoPlayed.current.includes(opponentNames[0])) && <h2 style={{color: 'green'}}>{opponentNames[0]}</h2>}
            </div>
          </div>
          <div className="gameView topSection leaderboard">
            <h4>Leaderboard</h4>
            {getSummary(true)}
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
                    <Card isBlack={false} isChoice={true} key={card.cardId} cardId={card.cardId} text={card.cardText} role={false} parentClass="gameView whiteCardSection"/>
                  ))}
                </div> 
              }
              {(sessionStorage.getItem('cardsPlayed') == 0) && 
                <div className="gameView whiteCardSection">
                  {player.cardsOnHands.map(card => (
                    <Card isBlack={false} isChoice={false} key={card.cardId} cardId={card.cardId} text={card.cardText} role={player.cardCzar} parentClass="gameView whiteCardSection"/>
                  ))}
                </div>
              }
              {/* If player is a card czar, display a hint */}
              {player.cardCzar && <div className="gameView cardCzarHint"><h2>You are Card Czar this round!</h2></div> }
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ------------------------------- IF for Buttons -----------------------------
  let buttons = null;
  if (player != null && blackCard != null && playersChoices != null && roundNr != null && opponentNames != null && opponentNames != playersWhoPlayed) {
    buttons = displayButtons(player, isCardCzarMode, chosenCard, playersChoices);
  }

  // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="gameView container">
      {countdown != 0 && displayEndRoundView()}
      {content}
      {/* Have the buttons clickable (for leaving) also during the confetti phase */}
      {buttons}
    </BaseContainer>
  );
};

export default GameView;