import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import InfoCard from './InfoCard';
import {symptomInfo, combinedSymptoms} from '../content/symptomInfo';
import Highlight from './Highlight';
import { useSelector } from 'react-redux';


const ShowFile = () => {
    const hiddenPre = useRef(null);
    const symptomCanvas = useRef(null);

    const file = useSelector(state => state.source.files[state.source.filteredFiles[state.source.activeFile]]);

    const [highlights, setHighlights] = useState([]);
    const [infoCards, setInfoCards] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(-1);
    const [hoveredProblem, setHoveredProblem] = useState(-1);

    const codeLines = file.text.split(/\r?\n/);
    const symptoms = file.analysis.symptoms;


    useEffect(() => {
        let highlightDivs = [];
        let cards = [];
        if (symptoms.length > 0) {
            const codeLines = file.text.split(/\r?\n/);
            const ctx = symptomCanvas.current.getContext('2d');
            ctx.font = getComputedStyle(hiddenPre.current).font;
            let lineNumberStyle = getComputedStyle(document.getElementsByClassName("code-line")[0]);
            let marginTop = parseFloat(lineNumberStyle.marginTop);
            let lineHeight = parseFloat(lineNumberStyle.height) + marginTop;
            let cardY = 0;
            for (let symptom of symptoms) {
                let x = ctx.measureText(codeLines[symptom.line].substring(0, symptom.lineIndex).replace("\t", "    ")).width;
                let y = symptom.line * lineHeight;
                let lines = symptom.text.replace("\\n","  ").split(/\\|\r?\n/); // split on Python continuation symbol as well as line breaks
                let w = ctx.measureText(symptom.text).width;
                let h = lines.length * lineHeight;                
                
                if (cards.length > 0) {
                    const MIN_GAP = 35; // Estimation based on h3, header padding, and font size of 12px
                    cardY = y < cardY + MIN_GAP ? cardY + MIN_GAP : y;
                }
                else cardY = y;

                let id = cards.length;

                const cardClicked = id => {
                    if (id !== selectedProblem) {
                        setSelectedProblem(id);
                    }
                    else {
                        setSelectedProblem(-1);
                    }
                }

                highlightDivs.push(
                    <Highlight key={id} isClicked={id === selectedProblem} x={x} y={y + marginTop} w={w} h={h - marginTop}
                               symptomId={symptom.type} 
                               handleClick={() => cardClicked(id)}
                               isHovered={id === hoveredProblem}
                               handleHoverStart={() => setHoveredProblem(id)}
                               handleHoverEnd={() => setHoveredProblem(-1)}
                            />
                )

                cards.push(<InfoCard key={id} symptomId={combinedSymptoms.hasOwnProperty(symptom.type) ? `${combinedSymptoms[symptom.type]} (${symptom.type})` : symptom.type} 
                                     text={symptom.text}
                                     handleClick={() => cardClicked(id)}
                                     isClicked={id === selectedProblem}
                                     isHovered={id === hoveredProblem}
                                     handleHoverStart={() => setHoveredProblem(id)}
                                     handleHoverEnd={() => setHoveredProblem(-1)}
                                     explanation={symptomInfo.hasOwnProperty(symptom.type) ? symptomInfo[symptom.type] : <p>Unknown symptom</p>} 
                                     yPos={cardY} origY={y} />);
                

            }
        }
        setHighlights(highlightDivs);
        setInfoCards(cards);
    }, [file.text, hoveredProblem, selectedProblem, symptoms]);


    return (
        <>
        <div className="results-container">
            <div className="code-container">
                <div className="line-numbers">
                    {
                        codeLines.map((line, index) => 
                            <Fragment key={"number" + index}>
                                <div className="line-number"><pre>{index + 1}</pre></div>
                            </Fragment>
                        )
                    }
                </div>
                <div className="source-code">
                    <div id="highlights">
                        {
                            highlights
                        }
                    </div>
                    <div className="lines">
                        {
                            codeLines.map((line, index) => 
                                <Fragment key={"code" + index}>
                                    <div className="code-line"><pre>{line}{' '}</pre></div>
                                </Fragment>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="info-container">
                {
                    infoCards
                }
            </div>
        </div>
        <pre id="hidden-pre" aria-hidden="true" ref={hiddenPre}></pre>
        <canvas ref={symptomCanvas} aria-hidden="true" id="symptom-canvas"></canvas>
        </>
    )
}

export default ShowFile;

ShowFile.propTypes = {
    fileContents: PropTypes.string
}