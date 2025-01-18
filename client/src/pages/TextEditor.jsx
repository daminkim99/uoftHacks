import React, {useState, useEffect} from 'react';
import './TextEditor.css'
import rawData from '../../server/data.json'
import { motion } from "motion/react"

const TextEditor = () => {
    const [body,setBody] = useState("");
    const [background, setBackground] = useState('');

    const redStart = 191, greenStart = 200, blueStart = 255; // Red: RGB(255, 0, 0)
    const redEnd = 247, greenEnd = 163, blueEnd = 163; // Blue: RGB(0, 0, 255)


    const interpolateColor = (value) => {
        const red = Math.round(redStart + (redEnd - redStart) * (value + 1) / 2);  // Interpolate red between 255 and 0
        const green = Math.round(greenStart + (greenEnd - greenStart) * (value + 1) / 2);  // Interpolate green (remains 0 in this case)
        const blue = Math.round(blueStart + (blueEnd - blueStart) * (value + 1) / 2);  // Interpolate blue between 0 and 255
        return `rgb(${red}, ${green}, ${blue})`;
    };

    // Function to calculate the gradient color based on similarity
    const calculateGradient = (sentiment1, sentiment2) => {
        const color1 = interpolateColor(sentiment1); // Color for the first paper
        const color2 = interpolateColor(sentiment2); // Color for the second paper
        return `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;

    };
    
    const handleBody= e => {
        const value = e.target.value; 
        setBody(value);
        console.log(value);
    }

    useEffect(() => {
        const { sentiments } = rawData;
        if (sentiments && sentiments.length >= 2) {
            const firstPaperScore = sentiments[0] || 0;
            const secondPaperScore = sentiments[1] || 0;

            const gradient = calculateGradient(firstPaperScore, secondPaperScore);
            setBackground(gradient);
        }
    }, []);

    const combinedData = rawData.titles.map((title, index) => ({
        title,
        author: rawData.authors[index],
        url: rawData.urls[index],
        abstract: rawData.abstracts[index],
    }));



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
                        <div className='match-rectangle' style={{ '--background-gradient': background }} >
                            <div className='padding-rectangle' >
                                {combinedData.map((paper, index) => (
                                    <motion.a
                                        className='smaller-match-rectangle' 
                                        key={index}
                                        href={paper.url}
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
                                        <h4 className='authors'>{paper.author}</h4>
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