import React, {useState, useEffect} from 'react';
import {api, catchError} from 'helpers/api';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {useHistory} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import SideBar from "components/views/SideBar";
import ReactPaginate from 'react-paginate';
import "styles/views/ProfileUsers.scss";
import "styles/views/ProfileLobbyCommon.scss";

// -------------------------------- ProfileUsers --------------------------------
const ProfileUsers = () => {
  const history = useHistory(); 
  // FOR PAGINATION: 
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);

  // -------------------------------- container for each USER --------------------------------
  const User = ({user}) => (
    <div className="user container" onClick={() => visitProfile(user.userId)}>    
      <div className="user name">{user.userName}</div>
      <div className="user status">{user.userStatus ? "Online🟢" : "Offline🔴"}</div>
    </div>
  );
  User.propTypes = {user: PropTypes.object};
  // -------------------------------- getting list of users --------------------------------
  useEffect(() => {
    async function fetchListOfUsers() {
      try {
        // const response = await api.get(`/users`); // TESTME - when edpoint is ready
                                                     // BUG endpoint needs to be accessible by all the players 
                                                     // BUG - endpoint needs to return all users except user who made the request
        const response = [ 
            { userId: 1, userName: "SuperCrazhingsOut", userStatus: true},
            { userId: 2, userName: "ChupapiMuñañyo", userStatus: false},
            { userId: 3, userName: "Ohyesdaddy", userStatus: true},
            { userId: 4, userName: "Alex", userStatus: true},
            { userId: 5, userName: "Diego", userStatus: true},
            { userId: 6, userName: "Ege", userStatus: true},
            { userId: 7, userName: "Tom", userStatus: false},
            { userId: 8, userName: "Jerry", userStatus: false},
            { userId: 9, userName: "Ege1", userStatus: true},
            { userId: 10, userName: "Ege2", userStatus: true},
            { userId: 11, userName: "Ege3", userStatus: true},
            { userId: 12, userName: "Ege4", userStatus: true},
            { userId: 13, userName: "Ege5", userStatus: true},
            { userId: 14, userName: "Ege6", userStatus: true},
            { userId: 15, userName: "Ege7", userStatus: true},
            { userId: 16, userName: "Ege8", userStatus: true},
            { userId: 17, userName: "Ege9", userStatus: true},
            { userId: 18, userName: "Ege10", userStatus: true},
        ];
        response.sort((a,b) => b.userStatus - a.userStatus); // sorting based on online status
        const slice = response.slice((currentPage-1)*perPage, (currentPage-1)*perPage + perPage);
        console.log(slice);
        const postSliceData =(
          <ul className="profile users-list">
            {slice.map(user => (
              <User user={user} key={user.userId}/>
            ))}
          </ul>)               
        setUsers(postSliceData);
        setPageCount(Math.ceil(response.length / perPage));
        console.log('Fetching list of users successfull');
      } catch (error) {
        catchError(history, error, 'fetching the list of users');
      }
    }
    fetchListOfUsers();
  },[currentPage]);

  const onPageClick = (e) => {
    setCurrentPage(e.selected + 1)
  };

  const visitProfile = async (userId) => { 
    history.push(`/profile/${userId}/records`);
  }
  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (users != []) {
    content = (
        <div className = "profile main">
          <SideBar/>
          <div className="profile minor">
            <h2>Other registered players</h2>
            {pageCount != 0 && <h5>Click to see the profile!</h5>}
            {pageCount != 0 &&  
              <div className="tableHeader container">
                <div>Username</div>
                <div>Status</div>
              </div>}
            {pageCount == 0 && <p>No other users yet 🥺</p>}
            {users}
            {pageCount != 0 &&                    
                    <ReactPaginate
                      previousLabel={"←"}
                      nextLabel={"→"}
                      breakLabel={"..."}
                      breakClassName={"break-me"}
                      pageCount={pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={onPageClick}
                      containerClassName={"pagination"}
                      subContainerClassName={"pages pagination"}
                      activeClassName={"active"}/>}
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

export default ProfileUsers;