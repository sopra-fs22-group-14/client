<h1 align="center">
  <br>
  <a href="https://github.com/sopra-fs22-group-14"><img src="src/CAH_Logo.png" alt="Cards Against Humanity" width="300"></a>
  <br>
  Cards Against Humanity - Client
  <br>
</h1>

<p align="center">
   <a href="https://github.com/sopra-fs22-group-14/client/actions">
     <img src="https://github.com/sopra-fs22-group-14/client/workflows/Deploy%20Project/badge.svg" alt="Deployment Status">
   </a>
   <a href="https://sonarcloud.io/project/overview?id=sopra-fs22-group-14_client">
      <img src="https://sonarcloud.io/api/project_badges/measure?project=sopra-fs22-group-14_client&metric=alert_status" alt="Quality Gate Status">
  </a>
</p>

## Introduction

Cards Against Humanity is a fill-in-the-blank party game that turns your awkward personality and lackluster social skills into hours of fun! It is a game usually played in person, but we wanted to make this fun available to anyone, anywhere and at anytime - even if you cannot be physically together!

This repository is the front-end bit of our application!

## Technologies

The front-end is written in JavaScript using React as a framework. For styling purposes, Sass is used.

To communicate with the server, REST is used. To ensure that all clients have the relevant information at hand, we make use of polling and update the states in the front-end as they change.

Since we have a user system containing records of previous games, we use PostgreSQL as a persistent database to store the data.

## High-Level Components

The [Lobby](src/components/views/Lobby.js) is the place where the user finds himself / herself when logging in or registering. All the different games that are currently joinable will be displayed here. The list is continuously updated using polling. A user can join an existing game, create a new one or start browsing to different pages using the [Sidebar](src/components/views/SideBar.js) or even the [Header](src/components/views/Header.js).

The [GameView](src/components/views/GameView.js) is the main component to present the game itself. It displays game and round specific information such as the users hand, the played cards, the black card as well as the current round number or the leaderboard. From here, different GET & POST endpoints are called in order to always see the current status of the game, to play cards or to leave the game. At the end of the game, the [EndGameView](src/components/views/EndGameView.js) displays the winner and some summary of played combinations, for the users to choose their favourite.

The [ProfileOverview](src/components/views/ProfileOverview.js), [ProfileRecords](src/components/views/ProfileRecords.js) and [ProfileUsers](src/components/views/ProfileUsers.js) can together be seen as the core of our user system in the application. You can edit your own profile, view your records or see a list of other users in order to look at their records too.

The [AppRouter](src/components/routing/routers/AppRouter.js) brings all the different pages together and decides what has to be rendered (depending on the URL). It furthermore makes use of Guards, which can block certain pages based on conditions.

## Launch & Development

For your local development environment, you will need Node.js. You can download it [here](https://nodejs.org). If you are using the application for the first time, run this command to ensure that all the relevant packages for the build are installed:

```npm install```

Next, you can start the app in the development mode using the following command:

```npm run dev```

Now you can open [http://localhost:3000](http://localhost:3000) to view it in the browser.<br>
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use Google Chrome).

```npm run build```

This command build the app for produciton to the ```build``` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

Now, your app is ready to be deployed. Further information can be found in the section about [deployment](https://create-react-app.dev/docs/deployment).


For development in React, the following tutorials will make your life easier:

- Read the React [Docs](https://reactjs.org/docs/getting-started.html)
- Do this React [Getting Started](https://reactjs.org/tutorial/tutorial.html) Tutorial (it doesn’t assume any existing React knowledge)
- Get an Understanding of [CSS](https://www.w3schools.com/Css/), [SCSS](https://sass-lang.com/documentation/syntax), and [HTML](https://www.w3schools.com/html/html_intro.asp)

## Illustrations

TODO add pictures with description

## Roadmap

The following things could be implemented in the future:

   1. New endpoint for the round ending in the Community Mode, so that the played cards and the times chosen can be associated to the users
   2. Include a chat feature to enable communication during the game
   3. Develop a mobile version of the game, so that it can be played on mobiledevices too

## Authors and Acknowledgements

<h3>Members of Group 14 (SoPra 2022):</h3>

[Diego Bugmann](https://github.com/diegobugmann), [Szymon Kaczmarski](https://github.com/Szymskiii), [Alexander Lerch](https://github.com/lerchal1) and [Ege Onur Güleç](https://github.com/ogegulec16)

<h3>Acknowledgements</h3>

We would like to thank our tutor [Kyrill Hux](https://github.com/realChesta), who was always able to support us when we had any concerns. His support resulted in an application that is more user-friendy and also more secure :)
