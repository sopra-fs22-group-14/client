import {BrowserRouter, Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import React, { Fragment } from 'react'
import LobbyRouter from "components/routing/routers/LobbyRouter";
import Header from "components/views/Header";
import Login from "components/views/Login";
import Register from "components/views/Register";
import Home from "components/views/Home";
import About from "components/views/About";
import NotFound from "components/views/NotFound";
import GameView from "components/views/GameView";
import EndGameView from "components/views/EndGameView";
import ProfileOverview from "components/views/ProfileOverview";
import ProfileRecords from "components/views/ProfileRecords";
import ProfileUsers from "components/views/ProfileUsers";
import {LoginGuard} from "components/routing/routeProtectors/LoginGuard";
import {LobbyGuard} from "components/routing/routeProtectors/LobbyGuard";
import { GameGuard } from "../routeProtectors/GameGuard";
import { ProfileGuard } from "../routeProtectors/ProfileGuard";
import { ProfileOverviewGuard } from "../routeProtectors/ProfileOverviewGuard";
// import { FitToViewport } from "react-fit-to-viewport";
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
      {/* <FitToViewport width={window.innerWidth-10} height={window.innerHeight-110} minZoom={0} maxZoom={0.8}> */}
      <Route path={["/login", "/register", "/home", "/about", "/profile/:loggedInUserID","/users"]}>
        <Header height="100"/>
      </Route>
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
        <Route exact path="/profile/:userId" children = {<ProfileOverviewGuard/>}>
          <ProfileOverviewGuard>
            <ProfileOverview/>
          </ProfileOverviewGuard>
        </Route>
        <Route exact path="/profile/:userId/records">
          <ProfileGuard> 
            <ProfileRecords/>
          </ProfileGuard>
        </Route>
        <Route exact path="/users">
          <ProfileGuard> 
            <ProfileUsers/>
          </ProfileGuard>
        </Route>
        <Route path="/game/:gameId">
          <GameGuard>
            <GameView/>
          </GameGuard>
        </Route>
        <Route path="/endGame/:gameId">
          <GameGuard>
            <EndGameView/>
          </GameGuard>
        </Route>
        <Route exact path="/">
          <Redirect to="/home"/>
        </Route>
        <Route path="*">
          <NotFound />
        </Route>

      </Switch>
      {/* </FitToViewport> */}
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
