import React from "react";
import { Link } from "react-router-dom";
import CAH_logo from '../../CAH_logo3.png';

export const CAHLogo = props => {
  return (
    <Link to="/lobby"><img src={CAH_logo}/></Link>
  );
};
