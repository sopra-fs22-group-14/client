import React from "react";
import WaitingAnimation from '../../Waiting_logo2.gif';
import "styles/ui/WaitingLogo.scss";

export const WaitingLogo = props => {
  return (
    <div className="waitingLogo">
      <img src={WaitingAnimation}/>
    </div>
  );
};