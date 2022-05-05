import React, {useState} from 'react';
import PropTypes from "prop-types";
import "styles/views/SideBar.scss";
import { useHistory } from "react-router-dom";
import {api, updateApi, catchError} from 'helpers/api';

const SideBar = props => {
  const history = useHistory();
  const [linkCopied, setLinkCopied] = useState(false);

  const redirectLobby = () => {
    history.push('/lobby');
  };
  
  const redirectProfile = () => {
    const loggedInUserID = localStorage.getItem('loggedInUserID');
    history.push(`/profile/${loggedInUserID}`);
  };
  
  const redirectRecords = () => {
    history.push('/profile/records');
  };

  const redirectFriends = () => {
    history.push('/profile/friends');
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
    <div className="sidebar container" style={{height: props.height}}>
      <div className="sidebar lobby" onClick={() => redirectLobby()}>🎮 Lobby</div>
      <div className="sidebar profile" onClick={() => redirectProfile()}>📸 Profile</div>
      <ul className = "sidebar buttonsList">
        <li className = "listElement" onClick={() => redirectProfile()}>📝 Overview</li>
        <li className = "listElement" onClick={() => redirectRecords()}>🏆 Records</li>
        <li className = "listElement" onClick={() => redirectFriends()}>🥰 Other players</li>
        {!linkCopied && <li className = "listElement" onClick={() => inviteFriends()}>✉️ Invite friends</li>}
        {linkCopied && <li className = "listElementLink" onClick={() => inviteFriends()}>🖤 Link copied!</li>}
      </ul>
      <div className="sidebar logout" onClick={() => logout()}>👋 Logout</div>
    </div>
  );
}

SideBar.propTypes = {
  height: PropTypes.string
};

export default SideBar;
