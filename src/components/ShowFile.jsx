import { Fragment, useEffect, useRef, useState } from 'react';
import Highlight from './Highlight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux'; 
import InfoContainer from './InfoContainer';
import { Card, ConceptDataObject, MisconceptionDataObject, sortDataObjects, SymptomDataObject } from '../utils/prepDataForDisplay';

/**
 * Create a unique ID for a raw symptom
 * @param {Object[]} rawSymptom A "raw" symptom object from the store
 * @param {Number} i A number to distinguish this symptom from others in the same place (the index in the array)
 * @returns A unique ID
 */
const createSymptomID = (rawSymptom, i) =>`${rawSymptom.type}-${rawSymptom.line}-${rawSymptom.docIndex}-${i}`;


/**
 * Add the connected symptom / misconception ids to each object
 * @param {SymptomDataObject[]} symptoms All symptom objects
 * @param {MisconceptionDataObject[]} misconceptions All misconception objects
 */
const connectSymptomsAndMisconceptions = (symptoms, misconceptions) => {
    for (const m of misconceptions) {
        for (const contributingSymptom of m.getContents().reason.contributingSymptoms) {
            for (const symptom of symptoms) {
                if (symptom.getType() === contributingSymptom.type && contributingSymptom.line === symptom.getLine() && contributingSymptom.docIndex === symptom.getContents().docIndex) {
                    m.addConnection(symptom.getHTMLId());
                    symptom.addConnection(m.getHTMLId());
                    break;
                }
            }
        }
    }
}

/**
 * Pull out the counter symptoms from the concepts
 * @param {ConceptDataObject[]} concepts 
 */
const identifyCounterSymptoms = concepts => {
    const counterSymptomMap = new Map(); // key = html id, value = counter symptom - to ensure no duplicates!
    let i = 0;
    const conceptIDs = new Set();
    for (const concept of concepts) {
        conceptIDs.add(concept.getHTMLId());
        const contributingSymptoms = concept.getContents().reason.contributingSymptoms;
        for (const counter of contributingSymptoms) {
            const counterId = createSymptomID(counter, i); 
            if (!counterSymptomMap.has(counterId)) {
                counterSymptomMap.set(counterId, new SymptomDataObject(createSymptomID(counter, i), counter));
                i++;
            }
            // Connect the two
            const symptomAdded = counterSymptomMap.get(counterId);
            concept.addConnection(symptomAdded.getHTMLId());
            symptomAdded.addConnection(concept.getHTMLId());
        }
    }
    return Array.from(counterSymptomMap.values());
}

/**
 * Creates the card data with default values for properties that are dependent on the display e.g. y coord
 * @param {DataObject[]} symptoms
 * @param {DataObject[]} misconceptions
 * @returns {Card[]} The combined info formatted for display in cards
 */
const createInitialCardInfo = (symptoms, misconceptions) => {
    const unmatchedSymptoms = symptoms.filter(s => s.getConnectedObjects().length === 0);
    const combined = misconceptions.concat(unmatchedSymptoms).sort(sortDataObjects);
    return combined.map(c => Card.create(c));
}

const ShowFile = () => {
    const hiddenPre = useRef(null);
    const symptomCanvas = useRef(null);

    const file = useSelector(state => state.source.files[state.source.filteredFiles[state.source.activeFile]]);
    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const selectedConcept = useSelector(state => state.display.selectedConcept);

    const symptoms = file.analysis.symptoms.map((s, i) => new SymptomDataObject(createSymptomID(s, i), s));
    const misconceptions = file.analysis.misconceptions.flatMap(m => m.occurrences.map((o, i) => new MisconceptionDataObject(`${m.type}-${o.line}-${o.docIndex}-${i}`, {...o, type: m.type})));
    connectSymptomsAndMisconceptions(symptoms, misconceptions);
    const concepts = file.analysis.concepts.flatMap(c => c.occurrences.map((o, i) => new ConceptDataObject(`${c.type}-${o.line}-${o.docIndex}-${i}`, {...o, type: c.type})));
    const counterSymptoms = identifyCounterSymptoms(concepts);
    const symptomsAndCounterSymptoms = symptoms.concat(counterSymptoms);
    const defaultInfoCards = createInitialCardInfo(symptomsAndCounterSymptoms, misconceptions.concat(concepts));


    const [highlightInfo, setHighlightInfo] = useState([]);
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

    const misconsByLine = Map.groupBy(defaultInfoCards.filter(card => (card.getCategory() !== "symptom")), m => m.getLine());


    const fileName = useRef(); // Keeps track of previous file name to ensure useEffect only runs when a new file is loaded
    

    useEffect(() => {
        if (fileName.current !== file.fileName) { // handle display update
            fileName.current = file.fileName;
            
            const codeLines = file.text.split(/\r?\n/);
            const ctx = symptomCanvas.current.getContext('2d');
            const mainFont = getComputedStyle(hiddenPre.current).font;
            const lineNumberStyle = getComputedStyle(document.getElementsByClassName("code-line")[0]);
            const marginTop = parseFloat(lineNumberStyle.marginTop);
            const lineHeight = parseFloat(lineNumberStyle.height) + marginTop;

            const getContinuationHighlights = (lines, startLineIndex, ctx, lineHeight, marginTop) => {
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

            /**
             * 
             * @param {SymptomDataObject[]} data Either symptoms or counter symptoms
             * @param {String} category 
             */
            const buildHighlights = (data, category) => {
                let lastCardPos = { line: -1, x: -1, infoWidth: -1};
                const highlights = [];
                for (const s of data) {
                    ctx.font = mainFont;
                    let y = s.getLine() * lineHeight;
                    let lines = s.getContents().text.split("\n");
                    let x = ctx.measureText(codeLines[s.getLine()].substring(0, s.getLineIndex()).replace("\t", "    ")).width;
                    let w = ctx.measureText(lines[0].trim()).width;
                    let h = lineHeight;

                    const continuationHighlights = getContinuationHighlights(lines, s.getLineIndex(), ctx, lineHeight, marginTop);
                    let marginLeft = (lastCardPos.line === s.getLine() && lastCardPos.x + lastCardPos.infoWidth + 10 > x) ?
                                    (lastCardPos.x + lastCardPos.infoWidth + 10) - x : 0;
                
                    ctx.font = "0.6em Helvetica Neue";
                    lastCardPos = {line: s.getLine(), x: x + marginLeft, infoWidth: ctx.measureText(s.getType()).width};
                    
                    highlights.push({
                        id:s.getHTMLId(),
                        classNames: [category, 
                                    s.getConnectedObjects().length === 0 ? "unmatched" : "matched", 
                                    // where multiple concepts, need to split up
                                    category === "countersymptom" && s.getConnectedObjects().length > 0 ? s.getConnectedObjects().map(c => c.split("-")[0]) : []].flatMap(x => x),
                        x,
                        y: y + marginTop,
                        w,
                        h: h - marginTop,
                        symptomId: s.getType(),
                        marginLeft,
                        continuationHighlights
                    });
                }
                return highlights;
            }

            const highlightLocations = buildHighlights(symptoms, "symptom").concat(buildHighlights(counterSymptoms, "countersymptom"));

            setHighlightInfo(highlightLocations);
        }
    }, [file, symptoms, counterSymptoms]);



    return (
        <>
        <div className="results-container mb2">
            <div className="code-container">
                <div className="line-numbers">
                    {
                        codeLines.map((_, index) => 
                            <Fragment key={"number" + index}>
                                <div className="line-number">
                                    {
                                        misconsByLine.has(index) &&
                                            <>
                                            {
                                                misconsByLine.get(index).filter(m => (showMiscons && m.getCategory() === "misconception") 
                                                                                        || (!showMiscons && m.getCategory() === "concept" && m.getType() === selectedConcept)).map((m, idx) => 
                                                    <span 
                                                        key={`icon-${m.getHTMLId()}-${idx}`}
                                                        onClick={
                                                        e => {
                                                            e.stopPropagation();
                                                            const id = m.getHTMLId();
                                                            const connected = m.getConnectedObjects();
                                                            infoCardClicked(new Set([...connected, id]));
                                                        }}
                                                        className={`miscon-icon ${selectedProblem.has(m.getHTMLId()) ? "selected": ""}`}
                                                    >
                                                    <FontAwesomeIcon icon={m.getIcon()} />{' '}
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
                                            const matches = symptomsAndCounterSymptoms.filter(s => s.getHTMLId() === h.id);
                                            if (matches.length === 1) {
                                                infoCardClicked(new Set(matches[0].getConnectedObjects()))
                                            }
                                        }
                                    }
                                    isHovered={hoveredProblem.has(h.id)}
                                    handleHoverStart={() => {
                                        const matches = symptomsAndCounterSymptoms.filter(s => s.getHTMLId() === h.id);
                                        if (matches.length === 1) {
                                            setHoveredProblem(new Set([...matches[0].getConnectedObjects(), h.id]));
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
            <InfoContainer infoCardLocations={defaultInfoCards} infoCardClicked={infoCardClicked} selectedProblem={selectedProblem} 
                            hoveredProblem={hoveredProblem} setHoveredProblem={setHoveredProblem} lineHeight={0} />
        </div>
        <pre id="hidden-pre" aria-hidden="true" ref={hiddenPre}></pre>
        <canvas ref={symptomCanvas} aria-hidden="true" id="symptom-canvas"></canvas>
        </>
    )
}

export default ShowFile;
