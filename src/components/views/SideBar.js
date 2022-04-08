import React from "react";
import PropTypes from "prop-types";
import "styles/views/SideBar.scss";
import { useHistory } from "react-router-dom";
import {api, updateApi, handleError} from 'helpers/api';

const SideBar = props => {

  const history = useHistory()

  const redirectLobby = () => {
    history.push('/lobby');
  };
  
  const redirectProfile = () => {
    history.push('/profile');
  };
  
  const redirectOverview = () => {
    history.push('/profile/overview');
  };

  const redirectRecords = () => {
    history.push('/profile/records');
  };

  const redirectFriends = () => {
    history.push('/profile/friends');
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
      alert(`Something went wrong during the logout: \n${handleError(error)}`);
    }
  }

  return (
    <div className="sidebar container" style={{height: props.height}}>
      <div className="sidebar lobby" onClick={() => redirectLobby()}>🎮 Lobby</div>
      <div className="sidebar profile" onClick={() => redirectProfile()}>📸 Profile</div>
      <ul className = "sidebar buttonsList">
        <li className = "listElement" onClick={() => redirectOverview()}>📝 Overview</li>
        <li className = "listElement" onClick={() => redirectRecords()}>🏆 Records</li>
        <li className = "listElement" onClick={() => redirectFriends()}>🥰 Friends</li>
      </ul>
      <div className="sidebar logout" onClick={() => logout()}>👋 Logout</div>
    </div>
  );
}

SideBar.propTypes = {
  height: PropTypes.string
};

export default SideBar;
