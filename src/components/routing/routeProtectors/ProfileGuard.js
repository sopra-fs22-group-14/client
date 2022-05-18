import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";
/**
 * Guard to restrict access to user list and user records
 */
export const ProfileGuard = props => {
  // only allow entering the profile sections(Records & Users) when a token is set
  if (localStorage.getItem("token")) {
    return props.children;
  }
  // otherwise, redirect to lobby
  return <Redirect to="/lobby"/>;
};

ProfileGuard.propTypes = {
  children: PropTypes.node
}