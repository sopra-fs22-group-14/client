import {Redirect, Route, Switch} from "react-router-dom";
import Lobby from "components/views/Lobby";
import GameCreation from "components/views/GameCreation";
import WaitingArea from "components/views/WaitingArea";
import PropTypes from 'prop-types';
import NotFound from "components/views/NotFound";

const GameRouter = props => {
  /**
   * "this.props.base" is "/app" because as been passed as a prop in the parent of GameRouter, i.e., App.js
   */
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Switch>
        <Route exact path={`${props.base}`}>
          <Lobby/>
        </Route>
        <Route path={`${props.base}/create`}>
          <GameCreation/>
        </Route>
        <Route path={`${props.base}/wait`}>
          <WaitingArea/>
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
};
/*
* Don't forget to export your component!
 */

GameRouter.propTypes = {
  base: PropTypes.string
}

export default GameRouter;
