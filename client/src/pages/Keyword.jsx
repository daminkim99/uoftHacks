import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import './Keyword.css';

function Keyword() {
    const [text, setText] = useState("");
    const handleChange = (event) => {
        setText(event.target.value);
    };

    const navigate = useNavigate()
    const handleClick = () => {
        navigate("/textEditor");
    };

    return (
        <div>
            <h1 className='keywords-title'>Enter some keywords about your research...</h1>
            <h2 className='keywords-sub'>Separate your keywords by spaces.</h2>
            <div className='input-container'>
                <input
                    className='input-keywords'
                    type="text"
                    placeholder="Enter keywords"
                    value={text}
                    onChange={handleChange}
                />
                <button className='enter-keywords' onClick={handleClick}>Enter</button>
            </div>
        </div>
    );
}

export default Keyword;