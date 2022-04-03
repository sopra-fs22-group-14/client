import React from "react";
import { Link } from "react-router-dom";
import "styles/ui/CAHLogo.scss";
import CAH_logo from '../../CAH_logo3.png';

export const CAHLogo = props => {
  return (
    <Link to="/lobby"><a><img src={CAH_logo}/></a></Link>
  );
};
