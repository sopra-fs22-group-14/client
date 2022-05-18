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
  const [gamesPlayed, setGamesPlayed] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [gamesWon, setGamesWon] = useState(null);
  // FOR PAGINATION: 
  const [currentPage, setCurrentPage] = useState(1);
  const [favouriteCombinations, setFavouriteCombinations] = useState([]);
  const [perPage] = useState(5);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    async function fetchUserRecordsData() {
      try {
        // const response = await api.get(`/users/${userId}/records`); // TESTME - when edpoint is ready
                                                                       // BUG endpoint needs to be accessible by all the players 
        const response = [
          { username: "John Doe" },
          { gamesPlayed: 10 },
          { pointsEarned: 56 },
          { gamesWon: 2 },
          { favouriteCombinations: [
            { combinationId: 1 , combinationText: "SuperCrazyFreackingFancyMysteriousGreatAndAwesomeAsWellAsLegendaryAndStupidOrWellThoughtStringJustToTestThingsOut"},
            { combinationId: 2 , combinationText: "Chupapi Muñañyo"},
            { combinationId: 3 , combinationText: "Oh yes daddy 🤪"},
            { combinationId: 4 , combinationText: "Oh wow this design is super ugly"},
            { combinationId: 5 , combinationText: "You know what also is ugly? Yo mama!"},
            { combinationId: 6 , combinationText: "Why is life so hard guys?"}
          ]},
        ];
        const combinationsData = response[4].favouriteCombinations;
        const slice = combinationsData.slice((currentPage-1)*perPage, (currentPage-1)*perPage + perPage);
        const postData = slice.map(combination => 
          <div key={combination.combinationId}>
              <p>{combination.combinationText}</p>
          </div>)
        setFavouriteCombinations(postData);
        setUsername(response[0].username);
        setGamesPlayed(response[1].gamesPlayed);
        setPointsEarned(response[2].pointsEarned);
        setGamesWon(response[3].gamesWon);
        setPageCount(Math.ceil(combinationsData.length / perPage));
        console.log('Fetching user records data successfull');
      } catch (error) {
        catchError(history, error, 'fetching the user records data');
      }
    }
    fetchUserRecordsData();
  },[currentPage]);

  const onPageClick = (e) => {
    setCurrentPage(e.selected + 1)
  };

  // -------------------------------- SPINNER --------------------------------
  let content = <SpinnerBalls/>;
  // -------------------------------- IF --------------------------------
  if (gamesWon != null && username != null && gamesPlayed != null && pointsEarned != null && favouriteCombinations != []) {
    content = (
        <div className = "profile main">
          <SideBar/>
          <div className="profile minor">
              <h2>Records</h2>
              <h3 className = "animatedH3">{username}</h3>
              <table className = "profile statsTable">
                <tbody>
                    <tr>
                      <td>🎮 Games played</td>
                      <td>{gamesPlayed}</td>
                    </tr>
                    <tr>
                      <td>⭐Points earned</td>
                      <td>{pointsEarned}</td>
                    </tr>
                    <tr>
                      <td>🏆Games won</td>
                      <td>{gamesWon}</td>
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

export default ProfileRecords;