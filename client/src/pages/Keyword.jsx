import React, { useState } from "react";

function Keyword() {
    const [text, setText] = useState("");
    const handleChange = (event) => {
        setText(event.target.value);
    };

    return (
        <div>
            <h1>Enter some keywords about your research...</h1>
            <h2>Separate your keywords by spaces.</h2>
            <input
                type="text"
                placeholder="Enter keywords"
                value={text}
                onChange={handleChange}
                style={{
                    width: "80%",
                    padding: "20px",
                    fontSize: "25px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    marginTop: "10px",
                    backgroundColor: "#F6F2FF",
                    color: "black"
                }}
            />
            <button>Enter</button>
        </div>
    );
}

export default Keyword;