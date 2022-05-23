import React, {useState} from 'react';
import PropTypes from "prop-types";
import "styles/views/SideBar.scss";
import { useHistory } from "react-router-dom";
import {api, updateApi, catchError} from 'helpers/api';

const SideBar = () => {
  const history = useHistory();
  const [linkCopied, setLinkCopied] = useState(false);
  const userId = localStorage.getItem('loggedInUserID');

  const redirectLobby = () => {
    history.push('/lobby');
  };
  
  const redirectProfile = () => {
    history.push(`/profile/${userId}`);
  };
  
  const redirectRecords = () => {
    // console.log("history: ", `/profile/${userId}/records`)
    history.push(`/profile/${userId}/records`);
  };

  const redirectUsers = () => {
    history.push('/users');
  };

  const inviteFriends = () => {
    navigator.clipboard.writeText('https://sopra-fs22-group-14-client.herokuapp.com/login');
    setLinkCopied(!linkCopied);
  };

  const logout = async () => {
    try {
      // prepare logout API call
      await api.post('/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('loggedInUserID');
      // and update the API, to NOT include Authorization for future requests
      updateApi();
      history.push('/login');
    } catch (error) {
      catchError(history, error, 'logging out');
    }
  }

  return (
    <div className="sidebar container">
      <div className="sidebar lobby" onClick={() => redirectLobby()}>🎮 Lobby</div>
      {/* <div className="sidebar profile" onClick={() => redirectProfile()}>📸 Profile</div> */}
      <ul className = "sidebar buttonsList">
        <li className = "listElement" onClick={() => redirectProfile()}>📸 My profile</li>
        <li className = "listElement" onClick={() => redirectRecords()}>🏆 Records</li>
        <li className = "listElement" onClick={() => redirectUsers()}>🥰 Other players</li>
        {!linkCopied && <li className = "listElement" onClick={() => inviteFriends()}>✉️ Invite friends</li>}
        {linkCopied && <li className = "listElementLink" onClick={() => inviteFriends()}>🖤 Link copied!</li>}
      </ul>
      <div className="sidebar logout" onClick={() => logout()}>👋 Logout</div>
    </div>
  );
}

export default SideBar;
