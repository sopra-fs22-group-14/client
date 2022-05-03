import React from "react";
import {CAHLogo} from "components/ui/CAHLogo";
import {Button} from 'components/ui/Button';
import PropTypes from "prop-types";
import "styles/views/Header.scss";
import { useHistory } from "react-router-dom";

/**
 * This is an example of a Functional and stateless component (View) in React. Functional components are not classes and thus don't handle internal state changes.
 * Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called “props”) and return React elements describing what should appear on the screen.
 * They are reusable pieces, and think about each piece in isolation.
 * Functional components have to return always something. However, they don't need a "render()" method.
 * https://reactjs.org/docs/components-and-props.html
 * @FunctionalComponent
 */
const Header = props => {

  const history = useHistory()

  const redirectHome = () => {
    history.push('/home');
  };
  
  const redirectGame = () => {
    history.push('/lobby');
  };
  
  const redirectAbout = () => {
    history.push('/about');
  };

  let content = (
    <div className="header container" style={{height: props.height}}>
      <CAHLogo width="60px" height="60px"/>
      <div className="header right">
        <Button className="header link" onClick={() => redirectHome()}>Home</Button>
        <Button className="header link" onClick={() => redirectGame()}>Game</Button>
        <Button className="header link" onClick={() => redirectAbout()}>About</Button>
      </div>
    </div>
  )

  return (
    <div>
      {content}
    </div>
  );
}

Header.propTypes = {
  height: PropTypes.string
};

/**
 * Don't forget to export your component!
 */
export default Header;
