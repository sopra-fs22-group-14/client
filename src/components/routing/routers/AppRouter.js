import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {LobbyGuard} from "components/routing/routeProtectors/LobbyGuard";
import LobbyRouter from "components/routing/routers/LobbyRouter";
import {LoginGuard} from "components/routing/routeProtectors/LoginGuard";
import Header from "components/views/Header";
import Login from "components/views/Login";
import Register from "components/views/Register";
import Home from "components/views/Home";
import About from "components/views/About";
import NotFound from "components/views/NotFound";
import WaitingArea from "components/views/WaitingArea";
import SideBar from "components/views/SideBar";
import GameView from "components/views/GameView";
import { GameGuard } from "../routeProtectors/GameGuard";
import EndGameView from "components/views/EndGameView";
import { EndGameGuard } from "../routeProtectors/EndGameGuard";

/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reacttraining.com/react-router/web/guides/quick-start
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Header height="100"/>
      <Switch>
        <Route path="/lobby">
          <LobbyGuard>
            <LobbyRouter base="/lobby"/>
          </LobbyGuard>
        </Route>
        <Route exact path="/login">
          <LoginGuard>
            <Login/>
          </LoginGuard>
        </Route>
        <Route exact path="/register">
          <Register/>
        </Route>
        <Route exact path="/home">
          <Home/>
        </Route>
        <Route exact path="/about">
          <About/>
        </Route>
        <Route path="/game/:gameId">
          <GameGuard>
            <GameView/>
          </GameGuard>
        </Route>
        <Route path="/endGame/:gameId">
          <EndGameGuard>
            <EndGameView/>
          </EndGameGuard>
        </Route>
        <Route exact path="/">
          <Redirect to="/home"/>
        </Route>
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
