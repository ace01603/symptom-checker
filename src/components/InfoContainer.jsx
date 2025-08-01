/* eslint-disable react-hooks/rules-of-hooks */
import InfoCard from "./InfoCard";
import { useSelector } from "react-redux";

const InfoContainer = ({infoCardLocations, infoCardClicked, selectedProblem, hoveredProblem, setHoveredProblem}) => {
    const codeLines = document.getElementsByClassName("code-line");
    const lineNumberStyle = codeLines.length > 0 ? getComputedStyle(codeLines[0]) : {};
    const marginTop = codeLines.length > 0 ? parseFloat(lineNumberStyle.marginTop) : 0;
    const lineHeight = codeLines.length > 0 ? parseFloat(lineNumberStyle.height) + marginTop : 0;

    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatchedSymptoms = useSelector(state => state.display.showUnmatchedSymptoms);
    const selectedConcept = useSelector(state => state.display.selectedConcept);

    const filteredCards = infoCardLocations.filter(card => (showMiscons && card.getCategory() === "misconception") 
                                                            || (showUnmatchedSymptoms && card.getCategory() === "symptom") 
                                                            || (!showMiscons && card.getCategory() === "concept" && card.getType() === selectedConcept));
    let cardY = 0;
    const MIN_GAP = 35;  // Estimation based on h3, header padding, and font size of 12px
    for (let i = 0; i < filteredCards.length; i++) {
        const card = filteredCards[i];
        let y = card.getLine() * lineHeight; // Position based only on line and no other cards
        if (i > 0 ) {
            // Check the position of the last card and make sure the new card is at least MIN_GAP below
            cardY = y <= cardY + MIN_GAP ? cardY + MIN_GAP : y;
        }
        else cardY = y;
        card.setY(cardY);
    }


    return <div className="info-container">
                {
                    filteredCards.map((i, idx) => 
                            <InfoCard key={`${i.getHTMLId()}-${idx}`} card={i} 
                                    handleClick={() => infoCardClicked(new Set([...i.getConnectedObjects(), i.getHTMLId()]))}
                                    isClicked={selectedProblem.has(i.getHTMLId())} 
                                    isHovered={hoveredProblem.has(i.getHTMLId())}
                                    handleHoverStart={() => i.getConnectedObjects().length === 0 ? setHoveredProblem(new Set([i.getHTMLId()])) : setHoveredProblem(new Set([...i.getConnectedObjects(), i.getHTMLId()]))}
                                    handleHoverEnd={() => setHoveredProblem(new Set())}
                                    lineHeight={lineHeight}
                                     />
                    )
                }
            </div>
}

export default InfoContainer