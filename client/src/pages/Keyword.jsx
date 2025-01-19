import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import './Keyword.css';

function Keyword() {
    const [text, setText] = useState("");
    const [keywords, setKeywords] = useState([]);

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
        try {
            await axios.post("http://127.0.0.1:8001/save-keywords/", { keywords });
            console.log("Keywords saved successfully!");
        } catch (error) {
            console.error("Error saving keywords:", error);
        }

        navigate("/textEditor");
    };

    return (
        <div>
            <h1 className='keywords-title'>First, enter some keywords about your research...</h1>
            <h2 className='keywords-sub'>Separate your keywords by pressing enter.</h2>
            <div className='input-container'>
                <div className="keywords-area">
                    {keywords.map((keyword, index) => (
                        <span key={index} className="keyword-bubble">
                            {keyword}
                            <button
                                className="delete-keyword"
                                onClick={() => handleDelete(index)}
                            >
                                &times;
                            </button>
                        </span>
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
                <button className='enter-keywords' onClick={handleClick}>Enter</button>
            </div>
        </div>
    );
}

export default Keyword;