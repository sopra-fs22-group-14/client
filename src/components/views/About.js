import BaseContainer from 'components/ui/BaseContainer';
import 'styles/views/About.scss';

const About = props => {

    return (
      <BaseContainer>
        <div className="about container">
          <div className="about">
            <h2>About</h2>
          </div>

          <div class="row">

            <div className="column">
              <div className="about-card">
                <div className="container">
                  <h1>Regular (Card Czar) Mode</h1>
                  <p className="title">The Classic</p>
                  <p>To start the game, each player receives ten white cards.
                    One randomly chosen player begins as the Card Czar and plays 
                    a black card for everyone to see.<br/>All the others then answer 
                    the question or fill in the blank by playing one white card.<br/>
                    All players can then see the played cards (without knowing by whom
                    the cards were played), but only the Card Czar determines the winner 
                    by choosing his/her favorite card.<br/>After announcing the winner,
                    the Card Czar rotates and the next round begins!
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="about-card">
                <div className="container">
                  <h1>Community  Mode</h1>
                  <p className="title">The Engaging</p>
                  <p>Rather than a Card Czar choosing the winner, this Mode allows for
                    all players to decide for themselves.<br/>After all white cards were
                    played, every player determines the winner by choosing his/her 
                    favorite card that was played by the opponent. 
                    In the end the player who was chosen most often wins the game!
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="about-card">
                <div className="container">
                  <h1>Different Card Types</h1>
                  <p className="title">Fun for Everyone</p>
                  <p>To make Cards Against Humanity a game for everyone to play,
                    we decided to include different card types!<br/>No matter how old 
                    you are, you will find a deck that suits your wishes!<br/>What 
                    are you waiting for?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseContainer>
    );


}

export default About;