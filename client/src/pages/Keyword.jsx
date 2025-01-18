import React, { useState } from "react";
import './Keyword.css';

function Keyword() {
    const [text, setText] = useState("");
    const handleChange = (event) => {
        setText(event.target.value);
    };

    return (
        <div>
            <h1>Enter some keywords about your research...</h1>
            <h2>Separate your keywords by spaces.</h2>
            <div className='input-container'>
                <input
                    type="text"
                    placeholder="Enter keywords"
                    value={text}
                    onChange={handleChange}
                />
                <button>Enter</button>
            </div>
        </div>
    );
}

export default Keyword;