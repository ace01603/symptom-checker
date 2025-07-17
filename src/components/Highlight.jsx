import { useEffect } from "react";
import { useSelector } from "react-redux";

const Highlight = ({symptomId, isClicked, x, y, w, h, handleClick,
                    isHovered, handleHoverStart, handleHoverEnd, 
                    marginLeft, continuationHighlights, classNames}) => {
    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatchedSymptoms = useSelector(state => state.display.showUnmatchedSymptoms);
    //const showConcepts = useSelector(state => state.display.showConcepts);
    const shouldDisplay = (classNames.includes("symptom") && classNames.includes("matched") && showMiscons) || (classNames.includes("unmatched") && showUnmatchedSymptoms) 

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
             onMouseEnter={() => {if (!isClicked) handleHoverStart()}} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
             className={`highlight${isClicked ? " highlight-selected": ""}${isHovered ? " highlight-hover" : ""} ${classNames.join(" ")} ${shouldDisplay ? "show": "hide"}`}
             style={{left: `${x}px`, top: `${y}px`, width: `${w}px`, height:`${h}px`}}>
            {
                continuationHighlights.map((c, i) => 
                    <div key={i} style={{left: `${c.x}px`, top: `${c.y}px`, width: `${c.w}px`, height:`${c.h}px`}}>
                    </div>
                )
            }
            <p className="symptom-info" style={{left: `${marginLeft}px`}}>{symptomId}</p>
        </div>
    )
}

export default Highlight;