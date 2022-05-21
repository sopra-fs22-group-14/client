import React, {useState, useEffect, useRef} from 'react';
import {api, updateApi, catchError} from 'helpers/api';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {Button} from 'components/ui/Button';
import {useHistory} from 'react-router-dom';
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
        maxLength="15"
        disabled = {props.isDisabled}
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
        placeholder="type password..."
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
        disabled = {props.isDisabled}
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};
FormFieldUsername.propTypes = {
  value: PropTypes.string,
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func
};
FormFieldPassword.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
FormFieldBirthday.propTypes = {
  value: PropTypes.string,
  isDisabled: PropTypes.bool,
  onChange: PropTypes.func
};

// -------------------------------- ProfileOverview --------------------------------
const ProfileOverview = () => {
  const history = useHistory(); // history.push('/profile/userId');
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isEditingCompleted, setIsEditingCompleted] = useState(false);
  const [isEditingPofile, setIsEditingProfile] = useState(false);
  const hasProfileChanged = useRef(false);
 
  const startEditProfile = () => {
    setIsEditing(true);
    setIsEditingProfile(true);
    setPassword("");
    hasProfileChanged.current = false;
  };
  const startEditPassword = () => {
    setIsEditing(true);
    setPassword("");
    setNewPassword("");
    hasProfileChanged.current = false;
  };
  const cancelEdit = () => {
    setIsEditing(false);
    setIsEditingCompleted(!isEditingCompleted);
    setIsEditingProfile(false);
    setIsPending(false);
  }

  // COMMENT - changing password
  const changePassword = async () => {
    try {
      setIsPending(true);
      const loggedInUserID = localStorage.getItem('loggedInUserID');
      const oldPassword = password;
      const requestBody = JSON.stringify({newPassword, oldPassword}); 
      const response = await api.put(`/users/${loggedInUserID}/password`, requestBody);
      localStorage.setItem('token', response.data.token); 
      updateApi();
      console.log('Password change successfull');
      hasProfileChanged.current = true;
      cancelEdit();
    } catch (error) {
      setIsPending(false);
      setPassword("");
      setNewPassword("");
      catchError(history, error, 'changing user password', true);
    }
  };

  // COMMENT - changing username and/or birthday
  const changeProfile = async () => {
    try {
      setIsPending(true);
      const loggedInUserID = localStorage.getItem('loggedInUserID');
      const requestBody = JSON.stringify({username, birthday, password}); 
      await api.put(`/users/${loggedInUserID}`, requestBody);
      console.log('Profile change successfull');
      hasProfileChanged.current = true;
      cancelEdit();
    } catch (error) {
      setIsPending(false);
      setPassword("");
      catchError(history, error, 'changing user data', true);
    }
  };

  // COMMENT - get User data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const loggedInUserID = localStorage.getItem('loggedInUserID');  
        const response = await api.get(`/users/${loggedInUserID}`); 
        setUsername(response.data.username);
        if(response.data.birthday === null) {
          setBirthday("");
        } else {
          setBirthday(response.data.birthday);
        }
        console.log('Fetching user data successfull');
      } catch (error) {
        catchError(history, error, 'fetching the user data');
      }
    }
    fetchUserData();
  }, [isEditingCompleted]); // fetched on entry, when submitted change data, when pressed cancel 

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (username != "" || isEditing == true) {
    content = (
        <div className = "profile main">
          <SideBar/>
          <div className="profile minor">
              <h2>Overview</h2>
              <div className="profile form">
                <div className="profile tableContainer"> 
                  <table className = "profile formTable">
                    <tbody>
                      {(!isEditing || isEditingPofile) &&
                      <tr>
                        <td>Username</td>
                        <td>          
                          <FormFieldUsername
                          value={username} 
                          isDisabled = {!isEditing}
                          onChange={un => setUsername(un)}
                          />
                        </td>
                      </tr>}
                      {(!isEditing || isEditingPofile) &&
                      <tr>
                        <td>Birthday</td>
                        <td>      
                          <FormFieldBirthday
                            value={birthday} 
                            isDisabled = {!isEditing}
                            onChange={un => setBirthday(un)}
                            />
                        </td>
                      </tr>}
                      {isEditing && isEditingPofile &&
                        <tr>
                          <td>Current password</td>
                          <td>          
                            <FormFieldPassword
                            value={password} 
                            onChange={un => setPassword(un)}
                            />
                          </td>
                        </tr>}
                        {/* COMMENT - for editing the password */}
                        {isEditing && !isEditingPofile &&
                        <tr>
                          <td>Current password</td>
                          <td>          
                            <FormFieldPassword
                            value={password} 
                            onChange={un => setPassword(un)}
                            />
                          </td>
                        </tr>}
                        {isEditing && !isEditingPofile &&
                        <tr>
                          <td>New password</td>
                          <td>          
                            <FormFieldPassword
                            value={newPassword} 
                            onChange={un => setNewPassword(un)}
                            />
                          </td>
                        </tr>}
                    </tbody>
                  </table>
                </div>
                <div className = "profile instructions">
                  {isEditing && isEditingPofile &&
                  <h4>Change username/ birthday, then type current password and press "Change profile" button.</h4>}
                  {isEditing && !isEditingPofile && 
                  <h4>Type current and new password, then press "Change password" button.</h4>}
                  {hasProfileChanged.current && <h4>Changes saved.</h4>}
                </div>
                  {!isEditing &&
                                <div className="profile button-container">                   
                                  <Button
                                    width="100%"
                                    onClick={() => startEditProfile()}
                                  >
                                    Edit profile
                                  </Button>
                                  <Button
                                    width="100%"
                                    onClick={() => startEditPassword()}
                                  >
                                    Edit password
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
                                  {/* COMMENT - profile editing */}
                                  {!isPending && isEditingPofile &&
                                    <Button
                                      width="100%"
                                      disabled = {username == "" || password == ""}
                                      onClick={() => changeProfile()}
                                    >
                                      Change profile
                                    </Button>}
                                  {/* COMMENT - password editing */}
                                  {!isPending && !isEditingPofile &&
                                  <Button
                                    width="100%"
                                    disabled = {newPassword == "" || password == ""}
                                    onClick={() => changePassword()}
                                  >
                                    Change password
                                  </Button>}
                                  {isPending &&
                                  <Button
                                    disabled
                                    width="100%"
                                  >
                                    {isEditingPofile && "Changing profile..."}
                                    {!isEditingPofile && "Changing password..."}
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