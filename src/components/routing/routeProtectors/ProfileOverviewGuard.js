import {Redirect, useParams} from "react-router-dom";
import PropTypes from "prop-types";
/**
 * Guard to restrict access to user own profile - place where user can change username etc.
 */
export const ProfileOverviewGuard = props => {
  const { userId } = useParams();
  const loggedInUserID = localStorage.getItem('loggedInUserID');

  // only allow entering the profile overview when a token is set and it is the right user 
  if (localStorage.getItem("token") && userId === loggedInUserID) {
    return props.children;
  }
  // otherwise, redirect to lobby
  return <Redirect to="/lobby"/>;
};

ProfileOverviewGuard.propTypes = {
  children: PropTypes.node
}