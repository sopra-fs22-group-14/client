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
    <div className="user container" onClick={() => visitProfile(user.id)}>    
      <div className="user name">{user.username}</div>
      <div className="user status">{user.status == "OFFLINE" && "Offline🔴"} {user.status == "ONLINE" && "Online🟢"}</div>
    </div>
  );
  User.propTypes = {user: PropTypes.object};
  // -------------------------------- getting list of users --------------------------------
  useEffect(() => {
    async function fetchListOfUsers() {
      try {
        const response = (await api.get(`/users`)).data;
        console.log(response);
        response.sort((a,b) => (a.status < b.status) ? 1 : ((b.status < a.status) ? -1 : 0)) // sorting based on online status
        const slice = response.slice((currentPage-1)*perPage, (currentPage-1)*perPage + perPage);
        const postSliceData =(
          <ul className="profile users-list">
            {slice.map(user => (
              <User user={user} key={user.id}/>
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

  const visitProfile = async (id) => { 
    history.push(`/profile/${id}/records`);
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
            <div className="profile users-container">
              {users}
            </div>
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