import React from "react";
import {CAHHome} from "components/ui/CAHHome";
import BaseContainer from "components/ui/BaseContainer";
import {Button} from 'components/ui/Button';
import 'styles/views/Home.scss';
import {useHistory} from 'react-router-dom';
import {catchError} from 'helpers/api';


const Home = props => {

  const history = useHistory();

  const goPlay = () => {
    try {
      history.push('/lobby')
    } catch (error) {
      catchError(history, error, 'redirecting');
    }
  }
  
  return (
    <BaseContainer>
      <h2>
        CARDS AGAINST HUMANITY - fun for everyone!
      </h2>
      <div className="home">
        <div className="home paragraph">
          "Stupid"<br/><br/>-Bloomberg
        </div>
        <CAHHome/>
        <div className="home paragraph">
          "Hysterical"<br/><br/>-TIME
        </div>
      </div>
      <Button width="50%" onClick={() => goPlay()}>Play Now</Button>
    </BaseContainer>
  );
}

export default Home;