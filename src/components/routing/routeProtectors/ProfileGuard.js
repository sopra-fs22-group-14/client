import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
/**
 * Guard to restrict access to user own profile 
 */
export const ProfileGuard = props => {
  // only allow entering the game when a token is set and it is the right user 
  if (localStorage.getItem("token")) {
    return props.children;
  }
  // otherwise, redirect to lobby
  return <Redirect to="/lobby"/>;
};

ProfileGuard.propTypes = {
  children: PropTypes.node
}