import './Landing.css'
import { useNavigate } from 'react-router-dom'

const Landing = () => {

    const navigate = useNavigate()
    const handleClick = () => {
        navigate("/keyword");
    };

    return (
            <div>
            <h2 className='sub'>Streamline your scientific papers.</h2>
            <h3 className='sub-sub'>More selling product</h3>
            <button className='landing-button' onClick={handleClick}>Try it for free</button>
           
            </div>
        )
    }
    
    export default Landing;