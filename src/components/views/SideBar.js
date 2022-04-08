import React from "react";
import {Button} from 'components/ui/Button';
import PropTypes from "prop-types";
import "styles/views/SideBar.scss";
import { useHistory } from "react-router-dom";

const SideBar = props => {

  const history = useHistory()

  const redirectHome = () => {
    history.push('/home');
  };
  
  const redirectGame = () => {
    history.push('/lobby');
  };
  
  const redirectAbout = () => {
    history.push('/about');
  };

  return (
    <div className="sidebar container" style={{height: props.height}}>
      <div className="sidebar lobby">Lobby</div>
      <div className="sidebar profile">Profile</div>
      <ul className = "sidebar buttonsList">
        <li className = "listElement">Overview</li>
        <li className = "listElement">Record</li>
        <li className = "listElement">Firends</li>
      </ul>
      <div className="sidebar logout">Logout</div>
    </div>
  );
}

SideBar.propTypes = {
  height: PropTypes.string
};

export default SideBar;
