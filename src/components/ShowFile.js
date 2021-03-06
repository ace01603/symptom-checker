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
    let symptoms = file.analysis.symptoms;

    useEffect(() => {
        let highlightDivs = [];
        let cards = [];
        if (symptoms.length > 0) {
            const codeLines = file.text.split(/\r?\n/);
            const ctx = symptomCanvas.current.getContext('2d');
            let lineNumberStyle = getComputedStyle(document.getElementsByClassName("code-line")[0]);
            let marginTop = parseFloat(lineNumberStyle.marginTop);
            let lineHeight = parseFloat(lineNumberStyle.height) + marginTop;
            let cardY = 0;
            let lastSymptomPos = {line: -1, x: -1, infoWidth: -1};
            for (let symptom of symptoms) {
                ctx.font = getComputedStyle(hiddenPre.current).font;
                // Ignore \n in string literal
                let lines = symptom.text.replace("\\n","  ").split(/\r?\n/); 
                let x = ctx.measureText(codeLines[symptom.line].substring(0, symptom.lineIndex).replace("\t", "    ")).width;
                let y = symptom.line * lineHeight;
                let w = ctx.measureText(lines[0].trim()).width;
                let h = lineHeight;

                /*let w = Math.max(...(lines.map(l => ctx.measureText(l).width))); 
                let h = lines.length * lineHeight;   */  
                
                const getContinuationHighlights = lines => {
                    let continuation = [];
                    for (let l = 1; l < lines.length; l++) {
                        const firstChar = lines[l].search(/\S/);
                        continuation.push({
                            x: ctx.measureText(lines[l].substring(0, firstChar >= 0 ? firstChar : 0).replace("\t", "    ")).width - x,
                            y: l * lineHeight,
                            w: ctx.measureText(lines[l].trim()).width,
                            h: lineHeight - marginTop
                        })
                    }
                    return continuation;
                }

                const continuationHighlights = getContinuationHighlights(lines);
                
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

                let marginLeft = (lastSymptomPos.line === symptom.line && lastSymptomPos.x + lastSymptomPos.infoWidth + 10 > x) ?
                                  (lastSymptomPos.x + lastSymptomPos.infoWidth + 10) - x : 0;
                
                ctx.font = "0.6em Helvetica Neue";
                lastSymptomPos = {line: symptom.line, x: x + marginLeft, infoWidth: ctx.measureText(symptom.type).width};

                highlightDivs.push(
                    <Highlight key={id} isClicked={id === selectedProblem} x={x} y={y + marginTop} w={w} h={h - marginTop}
                               symptomId={symptom.type} 
                               handleClick={() => cardClicked(id)}
                               isHovered={id === hoveredProblem}
                               handleHoverStart={() => setHoveredProblem(id)}
                               handleHoverEnd={() => setHoveredProblem(-1)}
                               marginLeft={marginLeft}
                               continuationHighlights={continuationHighlights}
                            />
                )

                cards.push(<InfoCard key={id} symptomId={combinedSymptoms.hasOwnProperty(symptom.type) ? `${combinedSymptoms[symptom.type]} (${symptom.type})` : symptom.type} 
                                     text={symptom.text}
                                     handleClick={() => cardClicked(id)}
                                     isClicked={id === selectedProblem}
                                     isHovered={id === hoveredProblem}
                                     handleHoverStart={() => setHoveredProblem(id)}
                                     handleHoverEnd={() => setHoveredProblem(-1)}
                                     explanation={symptom.type === "TypeError.invalid" ? symptom.feedback : symptomInfo.hasOwnProperty(symptom.type) ? symptomInfo[symptom.type] : <p>Unknown symptom</p>} 
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