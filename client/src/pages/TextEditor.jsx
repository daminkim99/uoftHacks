import React, {useState} from 'react';
import ReactQuill from "react-quill"
import './TextEditor.css'
import "../../node_modules/react-quill/dist/quill.snow.css"


const TextEditor = () => {
    const [body,setBody] = useState("")
    

    const handleBody= e => {
        console.log(e);
        setBody(e)
    }
    return (
            <div>
            <h2>Text Editor</h2>
            <ReactQuill 
            
            placeholder="Write text"
            onChange={handleBody}
            value={body}
            />
            </div>
        )
    }
    export default TextEditor;