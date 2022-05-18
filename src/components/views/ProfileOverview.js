import React, {useState, useEffect} from 'react';
import {api, catchError} from 'helpers/api';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {Button} from 'components/ui/Button';
import {useHistory, useParams} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import SideBar from "components/views/SideBar";
import "styles/views/ProfileOverview.scss";
import "styles/views/ProfileLobbyCommon.scss";

// -------------------------------- FORMS --------------------------------
const FormFieldUsername = props => {
  return (
    <div className="profile formField">
      <input
        className="profile inputUsername"
        placeholder="type new username..."
        maxLength="10"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};
const FormFieldPassword = props => {
  return (
    <div className="profile formField">
      <input
        className="profile inputPassword"
        type="password"
        placeholder="type new password..."
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};
const FormFieldBirthday = props => {
  return (
    <div className="profile formField">
      <input
        className="profile inputBirthday"
        type="date"
        placeholder="Birthday"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};
FormFieldUsername.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
FormFieldPassword.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
FormFieldBirthday.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
// -------------------------------- ProfileOverview --------------------------------
const ProfileOverview = () => {
  const history = useHistory(); // history.push('/profile/userId');
  const [username, setUsername] = useState(null);
  const [birthday, setBirthday] = useState(null);
  const [password, setPassword] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);

  const startEdit = () => {
    setIsEditing(true);
    setUsername(null);
    setBirthday(null);
    setPassword(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsEditingCompleted(true);
  }

  const changeProfile = async () => {
    try {
      setIsPending(true);
      const loggedInUserID = localStorage.getItem('loggedInUserID');
      const requestBody = JSON.stringify({username, birthday, password});
      await api.put(`/users/${loggedInUserID}`, requestBody);
      console.log('Profile change successfull');
      setIsEditingCompleted(true);
    } catch (error) {
      setIsPending(false);
      catchError(history, error, 'changing user data'); // TODO adjust error message so that it is more user friendly, not just alert 
    }
  };

  // TESTME - when edpoint is ready
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsPending(true);
        // const loggedInUserID = localStorage.getItem('loggedInUserID'); 
        // const response = await api.get(`/users/${loggedInUserID}`);
        // setUsername(response.data.username);
        // setBirthday(response.data.birthday);
        setUsername("Sopra_username");
        setBirthday("1970-01-18");
        console.log('Fetching user data successfull');
      } catch (error) {
        setIsPending(false);
        catchError(history, error, 'fetching the user data');
      }
    }
    fetchUserData();
  }, [isEditingCompleted]); // fetched on entry, when submitted change data, when pressed cancel 

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (true) { //TODO - change this "true" when endpoint is ready
    content = (
        <div className = "profile main">
          <SideBar/>
          <div className="profile minor">
              <h2>Overview</h2>
              <div className="profile form">
                <table className = "profile formTable">
                  <tbody>
                    <tr>
                      <td>Username</td>
                      <td>          
                        <FormFieldUsername
                        value={username} 
                        onChange={un => setUsername(un)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Birthday</td>
                      <td>      
                        <FormFieldBirthday
                          value={birthday} // TESTME - when edpoint is ready
                          onChange={un => setBirthday(un)}
                          />
                      </td>
                    </tr>
                    <tr>
                      <td>Password</td>
                      <td>          
                        <FormFieldPassword
                        onChange={un => setPassword(un)}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                  {!isEditing &&
                                <div className="profile button-container">                   
                                  <Button
                                    width="100%"
                                    onClick={() => startEdit()}
                                  >
                                    Edit profile
                                  </Button>
                                </div>}
                  {isEditing &&       
                                <div className="profile button-container">                
                                  <Button
                                    width="100%"
                                    onClick={() => cancelEdit()}
                                  >
                                    Cancel
                                  </Button> 

                                  {!isPending &&
                                    <Button
                                      width="100%"
                                      onClick={() => changeProfile()}
                                    >
                                      Change profile
                                    </Button>}
                                  {isPending &&
                                  <Button
                                    disabled
                                    width="100%"
                                  >
                                    Changing profile...
                                  </Button>}
                                </div>}
              </div>
          </div>
        </div>
    );
  }
   // -------------------------------- RETURN --------------------------------
  return (
    <BaseContainer className="profile container">
      {content}
    </BaseContainer>
  );
}

export default ProfileOverview;