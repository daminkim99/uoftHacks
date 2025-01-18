import React, {useState} from 'react';
import ReactQuill from "react-quill"
import './TextEditor.css'
import "../../node_modules/react-quill/dist/quill.snow.css"


const TextEditor = () => {
    const [body,setBody] = useState("")
    

    const handleBody= e => {
        const value = e.target.value; 
        setBody(value);
        console.log(value);
    }

    return (
            <div>
            <h2 className="header">Insert text below:</h2>
            <div className="textcover">
            <textarea 
            className="textbox"
            value = {body}
            onChange={handleBody}
            placeholder="Write text"
            rows="30"
            cols="80"
            />
            </div>
            </div>
        )
    }
    export default TextEditor;