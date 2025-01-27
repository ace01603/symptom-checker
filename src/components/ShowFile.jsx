import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import InfoCard from './InfoCard';
import {sympInfo} from '../content/symptomInfo';
import Highlight from './Highlight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from 'react-redux'; 

/**
 * Reformats information about a misconception occurrence for display purposes
 * @param {Object} misconception A misconception object returned by SIDElib
 * @param {Object} occurrence An individual occurrence object from the misconception
 * @returns An object reformatted for displaying information about the occurrence (type, description, occurrence details)
 */
const misconInfo = (misconception, occurrence) => ({
    uniqueId: `${misconception.type}-${occurrence.line}-${occurrence.docIndex}`,
    type: misconception.type,
    description: misconception.description,
    occurrence
});

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

const combineAndSortInfo = (symptoms, misconInfoMap) => {
    // Reformat - natural language Boolean - each clause has same docIndex
    let symStandard = symptoms.map((s, i) => ({ type: "symptom", 
                                            uniqueId: `${s.type}-${s.line}-${s.docIndex}-${i}`, 
                                            line: s.line, 
                                            docIndex: s.docIndex,
                                            lineIndex: s.lineIndex, 
                                            contents: s}));
    let misStandard = Array.from(misconInfoMap)
                            .flatMap(line => line[1].map(
                                o => ({type: "misconception", uniqueId:o.uniqueId, line: line[0], docIndex: o.occurrence.docIndex, contents: o})
                            ));
    // Combine
    let combined = misStandard.concat(symStandard);
    // Sort
    combined.sort((a, b) => {
        // Sort by line number
        if (a.line < b.line) return -1;
        else if (a.line > b.line) return 1;
        else {
            // Sort by type: symptom vs. misconception
            if (a.type < b.type) return -1;
            else if (a.type > b.type) return 1;
            // Sort by docIndex
            else {
                if (a.docIndex < b.docIndex) return -1;
                else if (a.docIndex > b.docIndex) return 1;
                else return 0;
            }
        }
    })
    // Return
    return combined;
}

const ShowFile = () => {
    const hiddenPre = useRef(null);
    const symptomCanvas = useRef(null);

    const file = useSelector(state => state.source.files[state.source.filteredFiles[state.source.activeFile]]);

    const [highlightInfo, setHighlightInfo] = useState([]);
    const [infoCardLocations, setInfoCardLocations] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(new Set());
    const [selectedType, setSelectedType] = useState();
    const [hoveredProblem, setHoveredProblem] = useState(-1);
    

    // For symptoms only
    const cardClicked = id => {
        if (!selectedProblem.has(id)) {
            setSelectedProblem(new Set([id]));
            setSelectedType("symptom");
        }
        else {
            setSelectedProblem(new Set());
            setSelectedType();
        }
    }

    // Why not working when icon clicked?
    const misconClicked = linkedSymptoms => {
        const sameIds = [...linkedSymptoms].every(s => selectedProblem.has(s));
        if (!sameIds) {
            setSelectedProblem(linkedSymptoms);
            setSelectedType("misconception");
        }
        else {
            setSelectedProblem(new Set());
            setSelectedType();
        }
    }

    const codeLines = file.text.split(/\r?\n/);
    let symptoms = file.analysis.symptoms;
    let misconsByLine = prepMisconceptions(file.analysis.misconceptions);
    let combinedInfo = combineAndSortInfo(symptoms, misconsByLine);

    const findLinkedSymptoms = misconId => {
        for (let cInfo of infoCardLocations) {
            if (cInfo.id === misconId) return cInfo.connectedSymptoms;
        }
        return [];
    }


    const fileName = useRef(); // Keeps track of previous file name to ensure useEffect only runs when a new file is loaded
    
    useEffect(() => {
        if (fileName.current !== file.fileName) {
            fileName.current = file.fileName;
            let highlightLocations = [];
            let cardInfo = [];
            const codeLines = file.text.split(/\r?\n/);
            const ctx = symptomCanvas.current.getContext('2d');
            const mainFont = getComputedStyle(hiddenPre.current).font;
            const lineNumberStyle = getComputedStyle(document.getElementsByClassName("code-line")[0]);
            const marginTop = parseFloat(lineNumberStyle.marginTop);
            const lineHeight = parseFloat(lineNumberStyle.height) + marginTop;
            let cardY = 0;
            let lastCardPos = { line: -1, x: -1, infoWidth: -1};

            const getContinuationHighlights = (lines, startLineIndex) => {
                const continuation = [];
                for (let l = 1; l < lines.length; l++) {
                    const lineWidth = ctx.measureText(lines[l].trim()).width;
                    const firstChar = Math.max(lines[l].search(/\S/), 0);
                    const newX = firstChar >= startLineIndex ?
                                    ctx.measureText(lines[l].substring(startLineIndex, firstChar)).width :
                                    -(ctx.measureText(lines[l].substring(firstChar, startLineIndex)).width);
                    continuation.push({
                        x: newX,
                        y: l * lineHeight,
                        w: lineWidth, 
                        h: lineHeight - marginTop
                    })
                }
                return continuation;
            }

            for (let cInfo of combinedInfo) {
                ctx.font = mainFont;
                let y = cInfo.line * lineHeight; 
                //let id = cardInfo.length;
                // Highlight specific
                if (cInfo.type === "symptom") {
                    let lines = cInfo.contents.text.split("\n");
                    let x = ctx.measureText(codeLines[cInfo.line].substring(0, cInfo.contents.lineIndex).replace("\t", "    ")).width;
                    let w = ctx.measureText(lines[0].trim()).width;
                    let h = lineHeight;

                    const continuationHighlights = getContinuationHighlights(lines, cInfo.contents.lineIndex);
                    let marginLeft = (lastCardPos.line === cInfo.line && lastCardPos.x + lastCardPos.infoWidth + 10 > x) ?
                                    (lastCardPos.x + lastCardPos.infoWidth + 10) - x : 0;
                
                    ctx.font = "0.6em Helvetica Neue";
                    lastCardPos = {line: cInfo.line, x: x + marginLeft, infoWidth: ctx.measureText(cInfo.contents.type).width};
                    
                    highlightLocations.push({
                        id:cInfo.uniqueId,
                        x,
                        y: y + marginTop,
                        w,
                        h: h - marginTop,
                        symptomId: cInfo.contents.type,
                        marginLeft,
                        continuationHighlights
                    });
                }
                if (cardInfo.length > 0) {
                    const MIN_GAP = 35; // Estimation based on h3, header padding, and font size of 12px
                    cardY = y < cardY + MIN_GAP ? cardY + MIN_GAP : y;
                }
                else cardY = y;

                let connectedSymptoms = [];
                if (cInfo.type === "misconception") {
                    // cInfo.contents.occurrence.reasoncontributingSymptoms -> for each: line, docIndex, type
                    let contribSymptoms = cInfo.contents.occurrence.reason.contributingSymptoms;
                    for (let s of contribSymptoms) {
                        for (let i = 0; i < combinedInfo.length; i++) {
                            if (combinedInfo[i].type === "symptom" && s.line === combinedInfo[i].contents.line && s.docIndex === combinedInfo[i].contents.docIndex && s.type === combinedInfo[i].contents.type) {
                                connectedSymptoms.push(combinedInfo[i].uniqueId);
                                break;
                            }
                        }
                    }
                }

                cardInfo.push({
                    id:cInfo.uniqueId,
                    type: cInfo.type,
                    infoId: cInfo.contents.type,
                    text: cInfo.contents.hasOwnProperty("text") ? cInfo.contents.text : "Not a symptoms",
                    explanation: cInfo.contents.type === "TypeError.invalid" ? cInfo.contents.feedback : sympInfo.hasOwnProperty(cInfo.contents.type) ? sympInfo[cInfo.contents.type] : "Unknown symptom",
                    yPos: cardY,
                    origY: y,
                    contents: cInfo.contents,
                    lineIndex: cInfo.hasOwnProperty("lineIndex") ? cInfo.lineIndex : -1,
                    connectedSymptoms
                });


            }
            setHighlightInfo(highlightLocations);
            setInfoCardLocations(cardInfo);
        }
    }, [file, highlightInfo.length, hoveredProblem, infoCardLocations.length, selectedProblem, combinedInfo]);



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
                                            <>
                                            {
                                                misconsByLine.get(index).map(m => 
                                                    <span 
                                                        key={`icon-${m.uniqueId}`}
                                                        onClick={
                                                        e => {
                                                            e.stopPropagation();
                                                            const id = m.uniqueId;
                                                            const connected = findLinkedSymptoms(id);
                                                            misconClicked(new Set([...connected, id]));
                                                        }}
                                                        className={`miscon-icon ${selectedProblem.has(m.uniqueId) ? "selected": ""}`}
                                                    >
                                                    <FontAwesomeIcon icon={faExclamationTriangle} />{' '}
                                                    </span>)
                                            }
                                            </>
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
                            highlightInfo.map(h => 
                                <Highlight key={h.id} isClicked={selectedProblem.has(h.id)} 
                                    x={h.x} y={h.y} w={h.w} h={h.h}
                                    symptomId={h.symptomId} 
                                    handleClick={() => cardClicked(h.id)}
                                    isHovered={h.id === hoveredProblem}
                                    handleHoverStart={() => setHoveredProblem(h.id)}
                                    handleHoverEnd={() => setHoveredProblem(-1)}
                                    marginLeft={h.marginLeft}
                                    continuationHighlights={h.continuationHighlights}
                                    />
                            )
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
                    infoCardLocations.map(i => 
                            <InfoCard key={i.id} infoId={i.infoId} 
                                    type={i.type}
                                    handleClick={i.type === "symptom" ?
                                                    () => cardClicked(i.id)
                                                    : () => misconClicked(new Set([...i.connectedSymptoms, i.id]))
                                                }
                                    isClicked={selectedType === i.type && selectedProblem.has(i.id)} // When misconception clicked, prevent connected symptom cards from showing
                                    isHovered={i.id === hoveredProblem}
                                    handleHoverStart={() => setHoveredProblem(i.id)}
                                    handleHoverEnd={() => setHoveredProblem(-1)}
                                    lineIndex={i.lineIndex}
                                    contents={i.contents}
                                    yPos={i.yPos} />
                    )
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