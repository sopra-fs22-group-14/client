import React from "react";
import "styles/ui/SpinnerBalls.scss";

export const SpinnerBalls= () => (
  <div className = "loading">
    <div className="bouncer">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <p>Loading...</p>
  </div>
);
