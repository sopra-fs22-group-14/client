import { Link } from "react-router-dom"
import {ThanosGif} from "components/ui/ThanosGif";


const NotFound = () => {
  return (
    <div className="not-found" style={{display: 'flex', justifyContent:'center', alignItems:'center', height: '20vh'}}>
      <ThanosGif width="60px" height="60px"/>
      <Link to="/">That page cannot be found! Back to the homepage...</Link>
    </div>
  );
}
 
export default NotFound;