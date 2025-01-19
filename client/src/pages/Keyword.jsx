import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import './Keyword.css';
import {motion, AnimatePresence} from 'framer-motion'

const pageVariants = {
    initial: {
        opacity: 0,
        y: 100
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        }
    },
    exit: {
        opacity: 0,
        y: 100,
        transition: {
            duration: 1.2,
            ease: "easeOut",
        }
    }
};

function Keyword() {
    const [text, setText] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [isExisting, setIsExisting] = useState(false);


    const handleInputChange = (event) => {
        setText(event.target.value);
    };

    const handleChange = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (text.trim() !== "") {
                setKeywords((prevKeywords) => [...prevKeywords, text.trim()]);
                setText("");
            }
        }
    };

    const handleDelete = (index) => {
        setKeywords((prevKeywords) =>
            prevKeywords.filter((_, i) => i !== index)
        );
    };

    const navigate = useNavigate()
    const handleClick = async() => {
        setIsExisting(true);
        try {
            await axios.post("http://127.0.0.1:8001/save-keywords/", { keywords });
            console.log("Keywords saved successfully!");
        } catch (error) {
            console.error("Error saving keywords:", error);
        }
        navigate("/textEditor");
    };

    return (
        <AnimatePresence mode="wait">
        {!isExisting && (<motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >            
            <motion.h1 className='keywords-title' variants={pageVariants}>
                First, enter some keywords about your research...
            </motion.h1>            
            <motion.h2 className='keywords-sub' variants={pageVariants}>
                Separate your keywords by pressing enter.
            </motion.h2>
            <motion.div className='input-container' variants={pageVariants}>
                <div className="keywords-area">
                    {keywords.map((keyword, index) => (
                        <motion.span key={index} className="keyword-bubble"
                        initial = {{opacity: 0, scale: 0.8}} animate = {{opacity: 1, scale: 1}} 
                        exit = {{opacity: 0, scale: 0.8}}>
                            {keyword}
                            <button
                                className="delete-keyword"
                                onClick={() => handleDelete(index)}
                            >
                                &times;
                            </button>
                        </motion.span>
                    ))}
                    <input
                        type="text"
                        value={text}
                        onChange={handleInputChange}
                        onKeyDown={handleChange}
                        placeholder="Type a keyword"
                        className="keyword-input"
                    />
                </div>
                <motion.button 
                    className='enter-keywords' 
                    onClick={handleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                > 
                    Enter
                </motion.button>
                </motion.div>
        </motion.div>
        )}
        </AnimatePresence>
    );
}

export default Keyword;