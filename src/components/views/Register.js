import React, {useState} from 'react';
import {api, handleError} from 'helpers/api';
import User from 'models/User';
import {useHistory, Link} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/Register.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";


const FormFieldText = props => {
  return (
    <div className="register field">
      <label className="register label">
        {props.label}
      </label>
      <input
        className="register inputUsername"
        placeholder="Username"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

const FormFieldPassword = props => {
  return (
    <div className="register field">
      <label className="register label">
        {props.label}
      </label>
      <input
        className="register inputPassword"
        type="password"
        placeholder="Password"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormFieldText.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

FormFieldPassword.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

const Register = () => {

  const history = useHistory();
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const goBack = () => {
    history.push(`/login`);
  }

  const doRegister = async () => {
    try {
      setIsPending(true);
      // Create a new user -> send POST to /users with the username and password
      const requestBody = JSON.stringify({username, password});
      const response = await api.post('/users/register', requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      // Store the ID of the logged in user as well as the token into the local storage
      localStorage.setItem('loggedInUserID', user.id);
      localStorage.setItem('token', user.token);

      // Registration successfully worked --> navigate back to /login
      history.push(`/login`);

    } catch (error) {
      alert(`Something went wrong during the registration: \n${handleError(error)}`);
      // reset the fields after failed registration
      setUsername("");
      setPassword("");
    }
  };

  return (
    <BaseContainer>
      <div className="register container">
        <div className="register form">
          <h2>Register</h2>
          <FormFieldText
            //label="Username"
            value={username}
            onChange={un => setUsername(un)}
          />
          <FormFieldPassword
            //label="Password"
            value={password}
            onChange={pw => setPassword(pw)}
          />

          <div className="register button-container">
          {!isPending && 
            <Button
              disabled={!username || !password}
              width="100%"
              onClick={() => doRegister()}
            >
              Register
            </Button>}

            {isPending && 
                <Button
                disabled
                width="100%"
              >
                Registering...
              </Button>}
          </div>

          <div className="register redirect-link">
            Already registered? Click to&nbsp;
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </BaseContainer>
  );

};

export default Register;