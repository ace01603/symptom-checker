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
 * @returns {Map<number, Object>} A Map of misconception occurrences. Each key is a line number (0-indexed).
 * Each value is an array of occurrence objects returned by misconInfo.
 */
const getMisconceptionOccurrencesByLine = misconceptions => {
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

/**
 * Add the connected symptom / misconception ids to each object
 * @param {Object[]} symptoms All symptom objects
 * @param {Map<number, Object>} misconceptionsByLine All occurrences grouped by line
 */
const connectSymptomsAndMisconceptions = (symptoms, misconceptionsByLine) => {
    // Connect matched symptoms and misconceptions first
    for (const line of misconceptionsByLine.values()) {
        for (const occurrence of line) {
            const connected = [];
            for (let contributingSymptom of occurrence.occurrence.reason.contributingSymptoms) {
                // look for the matching symptom to get its uniqueId
                for (const symptom of symptoms) {
                    if (contributingSymptom.line === symptom.contents.line && contributingSymptom.docIndex === symptom.contents.docIndex && contributingSymptom.type === symptom.contents.type) {
                        connected.push(symptom.uniqueId);
                        // add th misonception occurrence id to the symptom
                        symptom.connected.push(occurrence.uniqueId);
                        break;
                    }
                }
            }
            occurrence.connected = connected;
        }
    }
}

const sortItems = (a, b) => {
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
}


/**
 * Creates the card data with default values for properties that are dependent on the display e.g. y coord
 * @param {Map<number, Object[]} misconMap The misconception info objects grouped by line
 * @param {Object[]} symptoms
 * @returns {Object[]} The combined info formatted for display in cards
 */
const createInitialCardInfo = (misconMap, symptoms) => {
    // Flatten the map
     const misStandard = Array.from(misconMap)
                            .flatMap(line => line[1].map(
                                o => ({type: "misconception", uniqueId:o.uniqueId, line: line[0], docIndex: o.occurrence.docIndex, contents: o})
                            ))
                            //.sort(sortItems);
    // Find the unmatched symptoms
    const unmatchedSymptoms = symptoms.filter(s => s.connected.length === 0)
                            .map(s => ({
                               type: "symptom", uniqueId: s.uniqueId, line: s.line, docIndex: s.docIndex, contents: {...s.contents, connected: s.connected}
                            }));
    const combined = misStandard.concat(unmatchedSymptoms).sort(sortItems)

    const initialCardInfo = [];
    for (let card of combined) {
        const defaultCoord = -1000;
        initialCardInfo.push({
            id:card.uniqueId,
            line: card.line,
            type: card.type,
            infoId: card.contents.type,
            text: card.contents.text ? card.contents.text : "Not a symptom",
            explanation: card.contents.type === "TypeError.invalid" ? card.contents.feedback : sympInfo[card.contents.type] ? sympInfo[card.contents.type] : "Unknown symptom",
            yPos: defaultCoord,
            origY: defaultCoord,
            contents: card.contents, // this contains the connected info
            lineIndex: card.lineIndex ? card.lineIndex : -1,
            classNames: []
        });

    }
    return initialCardInfo
}

const ShowFile = () => {
    const hiddenPre = useRef(null);
    const symptomCanvas = useRef(null);

    const file = useSelector(state => state.source.files[state.source.filteredFiles[state.source.activeFile]]);
    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatchedSymptoms = useSelector(state => state.display.showUnmatchedSymptoms);
    const showConcepts = useSelector(state => state.display.showConcepts);

    const [highlightInfo, setHighlightInfo] = useState([]);
    const [infoCardLocations, setInfoCardLocations] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(new Set());
    const [hoveredProblem, setHoveredProblem] = useState(new Set());
    

    /**
     * Highlight the info card and connected symptoms
     * @param {string[]} linkedSymptoms 
     */
    const infoCardClicked = linkedSymptoms => {
        const sameIds = [...linkedSymptoms].every(s => selectedProblem.has(s));
        if (!sameIds) {
            setSelectedProblem(linkedSymptoms);
        }
        else {
            setSelectedProblem(new Set());
        }
    }

    const codeLines = file.text.split(/\r?\n/);
    let symptoms = file.analysis.symptoms.map((s, i) => ({ type: "symptom", 
                                            uniqueId: `${s.type}-${s.line}-${s.docIndex}-${i}`, 
                                            line: s.line, 
                                            docIndex: s.docIndex,
                                            lineIndex: s.lineIndex, 
                                            contents: s,
                                            connected:[]
                                        }))
                                        .sort(sortItems);

    const misconsByLine = getMisconceptionOccurrencesByLine(file.analysis.misconceptions); 
    // Connect the symptoms and misconceptions
    connectSymptomsAndMisconceptions(symptoms, misconsByLine);
    // Create the info cards but do not add to state yet
    const defaultInfoCards = createInitialCardInfo(misconsByLine, symptoms);


    const findLinkedSymptoms = misconId => {
        for (let cInfo of infoCardLocations) {
            if (cInfo.id === misconId) return cInfo.contents.connected;
        }
        return [];
    }


    const fileName = useRef(); // Keeps track of previous file name to ensure useEffect only runs when a new file is loaded
    
    useEffect(() => {
        if (fileName.current !== file.fileName) {
            fileName.current = file.fileName;
            let highlightLocations = [];
            let cardInfo = defaultInfoCards;
            const codeLines = file.text.split(/\r?\n/);
            const ctx = symptomCanvas.current.getContext('2d');
            const mainFont = getComputedStyle(hiddenPre.current).font;
            const lineNumberStyle = getComputedStyle(document.getElementsByClassName("code-line")[0]);
            const marginTop = parseFloat(lineNumberStyle.marginTop);
            const lineHeight = parseFloat(lineNumberStyle.height) + marginTop;
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

            // Symptom highlights - TODO: add class to distinguish matched from unmatched symptoms
            for (const s of symptoms) {
                ctx.font = mainFont;
                let y = s.line * lineHeight;
                let lines = s.contents.text.split("\n");
                let x = ctx.measureText(codeLines[s.line].substring(0, s.contents.lineIndex).replace("\t", "    ")).width;
                let w = ctx.measureText(lines[0].trim()).width;
                let h = lineHeight;

                const continuationHighlights = getContinuationHighlights(lines, s.contents.lineIndex);
                let marginLeft = (lastCardPos.line === s.line && lastCardPos.x + lastCardPos.infoWidth + 10 > x) ?
                                (lastCardPos.x + lastCardPos.infoWidth + 10) - x : 0;
            
                ctx.font = "0.6em Helvetica Neue";
                lastCardPos = {line: s.line, x: x + marginLeft, infoWidth: ctx.measureText(s.contents.type).width};
                
                highlightLocations.push({
                    id:s.uniqueId,
                    classNames: ["symptom", s.connected.length === 0 ? "unmatched" : "matched"],
                    x,
                    y: y + marginTop,
                    w,
                    h: h - marginTop,
                    symptomId: s.contents.type,
                    marginLeft,
                    continuationHighlights
                });
            }
            // Update info cards
            let cardY = 0;
            for (const cInfo of cardInfo) {
                const shouldDisplay = (showMiscons && cInfo.type === "misconception") || (showUnmatchedSymptoms && cInfo.type === "symptom");
                ctx.font = mainFont;
                let y = cInfo.line * lineHeight; // Position based only on line and no other cards
                if (cardInfo.length > 0 && shouldDisplay) {
                    const MIN_GAP = 35; // Estimation based on h3, header padding, and font size of 12px
                    // Check the position of the last card and make sure the new card is at least MIN_GAP below
                    cardY = y <= cardY + MIN_GAP ? cardY + MIN_GAP : y;
                }
                else cardY = y;
                cInfo.yPos = cardY;
                cInfo.origY = y;
            }

            setHighlightInfo(highlightLocations);
            setInfoCardLocations(cardInfo);
        }
    }, [file, highlightInfo, hoveredProblem, defaultInfoCards, selectedProblem, symptoms, showMiscons, showUnmatchedSymptoms, showConcepts]);



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
                                                            infoCardClicked(new Set([...connected, id]));
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
                                    classNames={h.classNames}
                                    handleClick={
                                        () => {
                                            const matches = symptoms.filter(s => s.uniqueId === h.id);
                                            if (matches.length === 1) {
                                                infoCardClicked(new Set(matches[0].connected))
                                            }
                                        }
                                    }
                                    isHovered={hoveredProblem.has(h.id)}
                                    handleHoverStart={() => {
                                        const matches = symptoms.filter(s => s.uniqueId === h.id);
                                        if (matches.length === 1) {
                                            setHoveredProblem(new Set([...matches[0].connected, h.id]))
                                        }
                                    }}
                                    handleHoverEnd={() => setHoveredProblem(new Set())}
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
                                    handleClick={() => infoCardClicked(new Set([...i.contents.connected, i.id]))}
                                    isClicked={selectedProblem.has(i.id)} 
                                    isHovered={hoveredProblem.has(i.id)}
                                    handleHoverStart={() => i.contents.connected.length === 0 ? setHoveredProblem(new Set([i.id])) : setHoveredProblem(new Set([...i.contents.connected, i.id]))}
                                    handleHoverEnd={() => setHoveredProblem(new Set())}
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