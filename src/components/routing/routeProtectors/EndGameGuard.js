import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
/**
 * Guard to restrict access to any game if user is not logged in
 */
export const EndGameGuard = props => {
  // only allow entering the game when a token is set
  if (localStorage.getItem("token")) {
    return props.children;
  }
  // otherwise, redirect to login
  return <Redirect to="/login"/>;
};

EndGameGuard.propTypes = {
  children: PropTypes.node
}