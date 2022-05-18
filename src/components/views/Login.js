import React, {useState} from 'react';
import {api, catchError, updateApi} from 'helpers/api';
import User from 'models/User';
import {useHistory, Link} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/Login.scss';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = props => {
  return (
    <div className="login field">
      <label className="login label">
        {props.label}
      </label>
      <input
        className="login inputUsername"
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
        className="login inputPassword"
        type="password"
        placeholder="Password"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

FormFieldPassword.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

const Login = props => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const doLogin = async () => {
    try {
      setIsPending(true);
      const requestBody = JSON.stringify({username, password});
      const response = await api.post('/users/login', requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      // Store the ID of the logged in user as well as the token into the local storage
      localStorage.setItem('loggedInUserID', user.id);
      localStorage.setItem('token', user.token);
      // and update the API, to include Authorization for future requests
      updateApi();

      // Login successfully worked --> navigate to the route /lobby in the GameRouter
      history.push(`/lobby`);
    } catch (error) {
      setIsPending(false);
      catchError(history, error, 'logging in');
      // reset the fields after login failed
      setUsername("");
      setPassword("");
    }
  };

  return (
    <BaseContainer>
      <div className="login container">
        <div className="login form">
        <h2>Login</h2>
          <FormField
            // label="Username"
            value={username}
            onChange={un => setUsername(un)}
          />
          <FormFieldPassword
            // label="Password"
            value={password}
            onChange={n => setPassword(n)}
          />

          <div className="login button-container">
          {!isPending && 
            <Button
              disabled={!username || !password}
              width="100%"
              onClick={() => doLogin()}
            >
              Login
            </Button>}

            {isPending && 
              <Button
                disabled
                width="100%"
              >
                Logging in...
              </Button>}
          </div>
          <div className="login redirect-link">
            No account? Click to&nbsp;
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default Login;
