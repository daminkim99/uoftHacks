import './Landing.css'
import Demo from '../assets/landing.png'
import { useNavigate } from 'react-router-dom'

const Landing = () => {

    const navigate = useNavigate()
    const handleClick = () => {
        navigate("/keyword");
    };

    return (
            <div className='container'>
            <div className='box1'>
            <h2 className='sub'>Strengthen <span className="every">every</span> argument</h2>
            <h3 className='sub-sub'>Subsubsubsub</h3>
            <button className='landing-button' onClick={handleClick}>Try it for free</button>
            </div>
            <div>
            <img className="background_img" src={Demo} alt="demo" />
            </div>
            </div>
        )
    }
    
    export default Landing;