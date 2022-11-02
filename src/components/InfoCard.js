import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";

const InfoCard = ({symptomId, text, explanation, yPos, isClicked, handleClick,
                   isHovered, handleHoverStart, handleHoverEnd}) => {

    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
             onMouseEnter={() => {if (!isClicked) handleHoverStart()}} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
             className={`info-card ${isClicked && "info-card-selected"} ${isHovered && "info-card-hover"}`} 
             style={{top: `${yPos}px`}}>
            <div className="info-header">
                <h3><FontAwesomeIcon icon={faStethoscope} /> {symptomId}</h3>
            </div>
            <div className="info-body">
                <pre>{text}</pre>
                {explanation}
            </div>
        </div>
    )
}

export default InfoCard;