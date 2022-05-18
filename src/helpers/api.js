import axios from 'axios';
import { getDomain } from 'helpers/getDomain';

// UUID authentication
const getHeaders = () => {
  const token = localStorage.getItem('token')
  if (token != null) {
    console.log("Token included from now on")
    return {'Content-Type': 'application/json', 'Authorization': token};
  } else {
    console.log("Token excluded from now on")
    return {'Content-Type': 'application/json'};
  }
}

const createApi = () => {
  return axios.create({
    baseURL: getDomain(),
    headers: getHeaders()
  });
};

// initially create the api
let apiObject = createApi();

// update the api to include / exclude Authorization
const updateApi = () => {
  apiObject = createApi();
}

const handleError = error => {
  const response = error.response;

  // catch 4xx and 5xx status codes
  if (response && !!`${response.status}`.match(/^[4|5]\d{2}$/)) {
    let info = `\nrequest to: ${response.request.responseURL}`;

    if (response.data.status) {
      info += `\nstatus code: ${response.data.status}`;
      info += `\nerror: ${response.data.error}`;
      info += `\nerror message: ${response.data.message}`;
    } else {
      info += `\nstatus code: ${response.status}`;
      info += `\nerror message:\n${response.data}`;
    }

    console.log('The request was made and answered but was unsuccessful.', error.response);
    return info;
  } else {
    if (error.message.match(/Network Error/)) {
      return 'The server cannot be reached.\nDid you start it?';
    }

    console.log('Something else happened.', error);
    return error.message;
  }
};


const catchError = (history, error, activityName, stayLoggedIn = false) => {
  alert(`Something went wrong while ${activityName}: \n${handleError(error)}`);
  console.error("Details:", error);
  // NOT AUTHORIZED 
  if(error.response.data.status == 401 && stayLoggedIn == false){
    localStorage.removeItem('token'); 
    // and update the API, to NOT include Authorization for future requests
    updateApi();
    history.push('/login');
  }
}


export {
  apiObject as api,
  updateApi,
  handleError,
  catchError
};