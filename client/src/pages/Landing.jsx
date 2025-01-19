import './Landing.css'
import Demo from '../assets/landing.png'
import { useNavigate } from 'react-router-dom'
import { motion, stagger } from 'framer-motion'

const Landing = () => {
    const navigate = useNavigate()
    const handleClick = () => {
        navigate("/keyword");
    };

    const contentVariants = {
        hidden: { 
            opacity: 0, 
        },
        visible: { 
            opacity: 1, 
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 50
        },

        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };


    return (
        <div className='container'>
            <motion.div 
                className='box1'
                initial="hidden"
                animate="visible"
                variants={contentVariants}
            >
                <motion.h2 
                    className='sub'
                    variants={itemVariants}
                >
                    Strengthen <span className="every">every</span> argument
                </motion.h2>
                <motion.h3 
                    className='sub-sub'
                    variants={itemVariants}
                    transition={{ delay: 0.2 }}
                >
                    Coalesce is your own personal research assistant playing devil's advocate
                </motion.h3>
                <motion.button 
                    className='landing-button primary'
                    onClick={handleClick}
                    variants={itemVariants}
                    transition={{ delay: 0.4 }}
                >
                    Try it for free
                </motion.button>
            </motion.div>
            <div>
                <img className="background_img" src={Demo} alt="demo" />
            </div>
        </div>
    )
}

export default Landing;