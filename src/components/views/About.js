import BaseContainer from 'components/ui/BaseContainer';
import 'styles/views/About.scss';

const About = props => {

    return (
      <BaseContainer>
        <div className="about">
          <h2>ABOUT</h2>
        </div>

        <div class="row">

          <div class="column">
            <div class="card">
              <div class="container">
                <h1>Regular (Card Czar) Mode</h1>
                <p class="title">The Classic</p>
                <p>To start the game, each player receives ten White Cards.
                  One randomly chosen player begins as the Card Czar and plays 
                  a Black Card for everyone to see.<br/>All the others then answer 
                  the question or fill in the blank by playing one White Card.<br/>
                  Only the Card Czar can see the played cards (without knowing by whom
                  the cards were played) and determines the winner by choosing his
                  favorite card.<br/>The Card Czar rotates and the next round starts!
                </p>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="card">
              <div class="container">
                <h1>No Card Czar Mode</h1>
                <p class="title">The Engaging</p>
                <p>Rather than a Card Czar choosing the winner, this Mode allows for
                  all players to decide for themselves.<br/>After all white cards were
                  played, every player gets ten points to distribute between the
                  others. The player who received the most points wins the round!
                </p>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="card">
              <div class="container">
                <h1>Different Card Types</h1>
                <p class="title">Fun for Everyone</p>
                <p>To make Cards Against Humanity a game for everyone to play,
                  we decided to include different card types!<br/>No matter how old 
                  you are, you will find a deck that suits your wishes!<br/>What 
                  are you waiting for?
                </p>
              </div>
            </div>
          </div>
        </div>
        </BaseContainer>
    );


}

export default About;