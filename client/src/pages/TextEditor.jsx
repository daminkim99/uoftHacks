import React, {useState} from 'react';
import ReactQuill from "react-quill"
import './TextEditor.css'
import "../../node_modules/react-quill/dist/quill.snow.css"
import data from '../../server/result.json'
import { motion } from "motion/react"

const TextEditor = () => {
    const [body,setBody] = useState("")
    

    const handleBody= e => {
        const value = e.target.value; 
        setBody(value);
        console.log(value);
    }

    return (
            <div className="parent">
             <div className='text-editor'> 
                <a href="/Keyword">Go Back</a>
                       <textarea 
                       className="textbox"
                       value = {body}
                       onChange={handleBody}
                       placeholder="Add your text here"
                       />
             </div>
             <div className='match-container'>
                    <h2 className='match-title'>Matches</h2>
                        <div className='match-rectangle'>
                            <div className='padding-rectangle'>
                                {data.map((paper, index) => (
                                    <motion.a
                                        className='smaller-match-rectangle' 
                                        key={index}
                                        href={paper.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: index * 0.2,
                                            ease: "easeOut",
                                        }}
                                        >
                                        <h3 className='science-title'>{paper.title}</h3>
                                        <h4 className='authors'>{paper.authors}</h4>
                                        <p className='abstract'>{paper.abstract}</p>
                                    </motion.a>
                                ))}

                                {/* <hr className="rectangle-separator" /> */}

                                {/* <div className='smaller-match-rectangle'>
                                    <h3 className='science-title'>Scientific Title</h3>
                                    <h4 className='authors'>Author1, Author2</h4>
                                    <p className='abstract'>Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. Abstract. </p>
                                </div> */}
                            </div>
                        </div>
                </div>
            </div>
        )
    }
    export default TextEditor;