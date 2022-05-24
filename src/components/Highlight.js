import { useEffect } from "react";

const Highlight = ({symptomId, isClicked, x, y, w, h, handleClick,
                    isHovered, handleHoverStart, handleHoverEnd}) => {

    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
             onMouseEnter={() => {if (!isClicked) handleHoverStart()}} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
             className={`highlight ${isClicked && "highlight-selected"} ${isHovered && "highlight-hover"}`}
             style={{left: `${x}px`, top: `${y}px`, width: `${w}px`, height:`${h}px`}}>
            <p className="symptom-info">{symptomId}</p>
        </div>
    )
}

export default Highlight;