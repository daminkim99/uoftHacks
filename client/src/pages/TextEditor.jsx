import React, {useState, useEffect} from 'react';
import './TextEditor.css'
import rawData from '../../server/data.json'
import { motion, AnimatePresence } from "motion/react"
import axios from 'axios';

const TextEditor = () => {
    const [body,setBody] = useState("");
    const [background, setBackground] = useState('');
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectedText, setSelectedText] = useState('');
    const [selectionTimeout, setSelectionTimeout] = useState(null);
    const [yesData, setData] = useState(false);

    const handleSelection = (e) => {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const selectedText = body.substring(start, end);
        if (selectedText) {
            if (selectionTimeout) {
                clearTimeout(selectionTimeout);
            }

            const timeout = setTimeout(() => {
            const selectionTime = Date.now() - selectionStart;
            if (selectionTime >= 2000) { // Check if selection duration is 2 seconds
                setSelectedText(selectedText);
                saveContentToServer(selectedText); // Send to server
                console.log(selectedText);
                }
            }, 2000);
    
            setSelectionTimeout(timeout);
            setSelectionStart(Date.now());
        } else {
            if (selectionTimeout) {
                clearTimeout(selectionTimeout);
            }
        }

    }

// Define start and end colors for interpolation
const blueStart = { r: 191, g: 200, b: 255 }; // Represents strong positive sentiment
const redEnd = { r: 247, g: 163, b: 163 };   // Represents strong negative sentiment

/**
 * Interpolates between blue and red based on the sentiment value.
 * @param {number} value - Sentiment value ranging from -1 (negative) to 1 (positive).
 * @returns {string} - RGB color string.
 */
const interpolateColor = (value) => {
    // Clamp the value between -1 and 1
    const clampedValue = Math.max(-1, Math.min(1, value));

    // Calculate interpolation factor
    const factor = (clampedValue + 1) / 2; // Maps -1 to 0 and 1 to 1

    // Interpolate each color channel
    const red = Math.round(blueStart.r + (redEnd.r - blueStart.r) * (1 - factor));
    const green = Math.round(blueStart.g + (redEnd.g - blueStart.g) * (1 - factor));
    const blue = Math.round(blueStart.b + (redEnd.b - blueStart.b) * (1 - factor));

    return `rgb(${red}, ${green}, ${blue})`;
};

/**
 * Calculates a linear gradient based on two sentiment values.
 * @param {number} sentiment1 - Sentiment score for the first article.
 * @param {number} sentiment2 - Sentiment score for the second article.
 * @returns {string} - CSS linear-gradient string.
 */
const calculateGradient = (sentiment1, sentiment2) => {
    const color1 = interpolateColor(sentiment1); // Color for the first paper
    const color2 = interpolateColor(sentiment2); // Color for the second paper

    // Enhanced debugging statements
    console.log(`Sentiment1: ${sentiment1}, Color1: ${color1}`);
    console.log(`Sentiment2: ${sentiment2}, Color2: ${color2}`);

    // Consistently order colors based on sentiment values
    // Positive sentiments: color1 (positive) -> color2 (positive)
    // Negative sentiments: color2 (negative) -> color1 (negative)
    // Mixed sentiments: color1 -> color2

    if (sentiment1 >= 0 && sentiment2 >= 0) {
        // Both sentiments are positive
        return `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
    } else if (sentiment1 < 0 && sentiment2 < 0) {
        // Both sentiments are negative
        return `linear-gradient(180deg, ${color2} 0%, ${color1} 100%)`;
    } else {
        // Mixed sentiments
        return `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
    }
};
    
    const handleBody= e => {
        const value = e.target.value; 
        setBody(value);
        

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
            saveContentToServer(value);
        }, 2000);

        setTypingTimeout(timeout);
        console.log(value);
    }

    const saveContentToServer = async (value) => {
        try {
            const response = await axios.post("http://127.0.0.1:8001/extract_keywords", {
                text: value,
            });

            if (response.status >= 200 && response.status < 300) {
                console.log("Content saved successfully");
                setData(true);
            } else {
                throw new Error("Failed to save content");
            }

        } catch (error) {
            console.error("Error saving content:", error);
        }
    };

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
        sentiments: rawData.sentiments[index], /* author will be in 2d array*/
        url: rawData.urls[index],
        abstract: rawData.abstracts[index],
    }));

    // const combinedData = rawData.titles.map((title, index) => {
    //     // Get the authors for the current paper
    //     const authors = rawData.authors[index];
    
    //     // Format the authors to show up to three and append "et al." if there are more
    //     const formattedAuthors = authors.length > 3 
    //         ? `${authors.slice(0, 3).join(', ')}, et al.` 
    //         : authors.join(', ');
    
    //     return {
    //         title,
    //         author: formattedAuthors, // Use formatted authors here
    //         url: rawData.urls[index],
    //         abstract: rawData.abstracts[index],
    //     };
    // });

    return (
            <div className="parent">
             <div className='text-editor'> 
                {/* <a href="/Keyword">Go Back</a> */}
                <h1 className='instructions-title'>Now, enter your research paper...</h1>
                <h2 className='instructions'>Coalesce will give related documents, which agrees or opposes your argument, when you pause typing or you highlight your text for two seconds.</h2>
                    <textarea 
                       className="textbox"
                       value = {body}
                       onChange={handleBody}
                       onSelect={handleSelection}
                       placeholder="Add your text here"
                    />
             </div>
             <div className='match-container'>
                    <h2 className='match-title'>Arguments</h2>
                        <div className='match-rectangle' style={{ '--background-gradient': background }} >
                            <AnimatePresence mode="wait">
                            {yesData && <motion.div className='padding-rectangle' 
                            key={JSON.stringify(combinedData)}
                            >
                                {combinedData.map((paper, index) => (
                                    <motion.a
                                        className='smaller-match-rectangle' 
                                        key={index}
                                        href={paper.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -50 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                            ease: "easeOut",
                                        }}
                                        >
                                        <h3 className='science-title'>{paper.title}</h3>
                                        <div className='tooltip'>
                                            <span className='sentiment-underline'>Sentiment: {paper.sentiments}</span>
                                            <span className='tooltip-text'>
                                                Sentiment represents the emotional tone of the paper, ranging from -1 (negative) to 1 (positive).
                                            </span>
                                        </div>
                                        
                                        <p className='abstract'>{paper.abstract}</p>
                                    </motion.a>
                                ))}

                                
                            </motion.div>}
                            </AnimatePresence>
                        </div>
                </div>
            </div>
        )
    }
    export default TextEditor;