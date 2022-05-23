import React, {useState, useEffect} from 'react';
import {api, catchError} from 'helpers/api';
import {SpinnerBalls} from 'components/ui/SpinnerBalls';
import {useHistory, useParams} from 'react-router-dom';
import BaseContainer from "components/ui/BaseContainer";
import SideBar from "components/views/SideBar";
import ReactPaginate from 'react-paginate';
import "styles/views/ProfileRecords.scss";
import "styles/views/ProfileLobbyCommon.scss";


// -------------------------------- ProfileRecords --------------------------------
const ProfileRecords = () => {
  const { userId } = useParams();
  const history = useHistory(); // history.push(`/profile/${userId}/records`);
  const [username, setUsername] = useState(null);
  const [roundsWon, setRoundsWon] = useState(null);       // for Card Czar  
  const [pointsEarned, setPointsEarned] = useState(null); // for Community
  const [gamesWon, setGamesWon] = useState(null);
  // FOR PAGINATION: 
  const [currentPage, setCurrentPage] = useState(1);
  const [favouriteCombinations, setFavouriteCombinations] = useState(null);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);

  function convertArray(arr) {
    var rv = [];
    for (var i = 0; i < arr.length; ++i)
      rv[i] = {"combinationId": i, "combinationText": arr[i]};
    return rv;
  }

  async function fetchUserRecordsData() {
    try {
      const IdOfUser = userId;
      // console.log(`/users/${IdOfUser}/records`);
      const response = await api.get(`/users/${IdOfUser}/records`);
      const combinationsData = convertArray(response.data.bestCombinations);
      const slice = combinationsData.slice((currentPage-1)*perPage, (currentPage-1)*perPage + perPage);
      const postData = slice.map(combination => 
        <div key={combination.combinationId}>
            <p>{combination.combinationText}</p>
        </div>)
      setFavouriteCombinations(postData);
      setUsername(response.data.username);
      setRoundsWon(response.data.totalRoundWon); // for Card Czar 
      setPointsEarned(response.data.timesPicked);  // for Community
      setGamesWon(response.data.totalGameWon);
      setPageCount(Math.ceil(combinationsData.length / perPage));
      console.log('Fetching user records data successfull');
    } catch (error) {
      catchError(history, error, 'fetching the user records data');
    }
  }

  useEffect(() => {
    fetchUserRecordsData();
  },[currentPage, userId]);

  const onPageClick = (e) => {
    setCurrentPage(e.selected + 1)
  };


  const displayProfileRecords = () => {
    return (
        <div className="profile minor">
        <h2>Records</h2>
        <h3 className = "animatedH3">{username}</h3>
        <table className = "profile statsTable">
          <tbody>
              <tr>
                <td>🏆Games won</td>
                <td>{gamesWon}</td>
              </tr>
              <tr>
                <td>⭐Points earned (Community mode)</td>
                <td>{pointsEarned}</td>
              </tr>
              <tr>
                <td>🥊Rounds won (Card Czar mode)</td>
                <td>{roundsWon}</td>
              </tr>
          </tbody>
      </table>
      <div className = "profile combinations">
            <div className = "profile combinations list"> 
              <h4>Favourite combinations</h4>
                {favouriteCombinations}
                {favouriteCombinations.length == 0 && userId == localStorage.getItem('loggedInUserID') &&
                  <p>You don't have any favourite combinations yet! You can add them to the profile at the end of each game!</p>
                }
                {favouriteCombinations.length == 0 && userId != localStorage.getItem('loggedInUserID') &&
                  <p>User does not have any favourite combinations yet!</p>
                }
            </div>
      </div>
      <div> 
        {favouriteCombinations.length != 0 &&                   
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
    </div>  )
  }

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (gamesWon != null && username != null && roundsWon != null && pointsEarned != null && favouriteCombinations != null) {
    content = (
        <div className = "profile main">
          <SideBar/>
          {displayProfileRecords()}
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

export default ProfileRecords;