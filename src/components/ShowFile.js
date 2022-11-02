import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import InfoCard from './InfoCard';
import {symptomInfo, combinedSymptoms} from '../content/symptomInfo';
import Highlight from './Highlight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from 'react-redux'; 

const ShowFile = () => {
    const hiddenPre = useRef(null);
    const symptomCanvas = useRef(null);

    const file = useSelector(state => state.source.files[state.source.filteredFiles[state.source.activeFile]]);

    const [highlights, setHighlights] = useState([]);
    const [infoCards, setInfoCards] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(-1);
    const [hoveredProblem, setHoveredProblem] = useState(-1);

    /**
     * Reformats information about a misconception occurrence for display purposes
     * @param {Object} misconception A misconception object returned by SIDElib
     * @param {Object} occurrence An individual occurrence object from the misconception
     * @returns An object reformatted for displaying information about the occurrence (type, description, occurrence details)
     */
     const misconInfo = (misconception, occurrence) => ({
        type: misconception.type,
        description: misconception.description,
        occurrence
    })

    /**
     * Creates a Map of misconception occurrences by line
     * @param {Object[]} misconceptions The misconceptions array returned by SIDElib
     * @returns A Map of misconception occurrences. Each key is a line number (0-indexed).
     * Each value is an array of occurrence objects returned by misconInfo.
     */
    const prepMisconceptions = misconceptions => {
        let misconMap = new Map();
        for (let m of misconceptions) {
            for (let o of m.occurrences) {
                if (!misconMap.has(o.line)) {
                    misconMap.set(o.line, []);
                }
                misconMap.get(o.line).push(misconInfo(m, o));
            }
        }
        return misconMap;
    }

    const codeLines = file.text.split(/\r?\n/);
    let symptoms = file.analysis.symptoms;
    let misconsByLine = prepMisconceptions(file.analysis.misconceptions);
    console.log(misconsByLine);
    console.log(file.fileName);
    console.log(file.analysis.variables);
    //console.log(file.analysis);



    useEffect(() => {
        let highlightDivs = [];
        let cards = [];
        /**
         * REFACTOR TO INCLUDE MISCONCEPTIONS:
         * - Separate symptom highlight generation from Info Card creation
         * - After adding highlights, put symptoms in an array with misonInfos and sort by line > misconceptions first > occurrence by index > symptoms by index
         */
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
        <div className="results-container mb2">
            <div className="code-container">
                <div className="line-numbers">
                    {
                        codeLines.map((line, index) => 
                            <Fragment key={"number" + index}>
                                <div className="line-number">
                                    {
                                        misconsByLine.has(index) &&
                                            <span className='miscon-icon'><FontAwesomeIcon icon={faExclamationTriangle} />{' '}</span>
                                    }
                                    <pre>{index + 1}</pre>
                                </div>
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