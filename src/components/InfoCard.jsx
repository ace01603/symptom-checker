import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";
import { useSelector } from 'react-redux';
import GenericSymptom from './symptoms/GenericSymptom';
import SymptomAssignedNoReturn from './symptoms/SymptomAssignedNoReturn';
import GenericMisconception from './misconceptions/GenericMisconception';
import SymptomTypeInvalid from './symptoms/SymptomTypeInvalid';

const getContents = (type, infoId, lineIndex, contents) => {
    if (type === "symptom") {
        switch (infoId) {
            case "AssignedNoReturn":
                return <SymptomAssignedNoReturn lineIndex={lineIndex} {...contents} />
            case "TypeError.invalid":
                return <SymptomTypeInvalid lineIndex={lineIndex} {...contents} />
            default:
                return <GenericSymptom lineIndex={lineIndex} {...contents} />
        }
    } else {
        return <GenericMisconception {...contents} />
    }
}

const InfoCard = ({infoId, type, yPos, isClicked, handleClick,
                   isHovered, handleHoverStart, handleHoverEnd, lineIndex, contents}) => {

    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatchedSymptoms = useSelector(state => state.display.showUnmatchedSymptoms);
    //const showConcepts = useSelector(state => state.display.showConcepts);

    const shouldDisplay = (type === "misconception" && showMiscons) || (type === "symptom" && showUnmatchedSymptoms);

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
             onMouseEnter={() => {
                    if (!isClicked) {
                        handleHoverStart();
                    }
                }} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
             className={`${type} info-card${isClicked ? " info-card-selected" : ""}${isHovered ?  " info-card-hover" : ""} ${shouldDisplay ? "show":"hide"}`} 
             style={{top: `${yPos}px`}}>
            <div className="info-header">
                <h3>{
                        type === "symptom" ?
                            <FontAwesomeIcon icon={faStethoscope} /> 
                            : <FontAwesomeIcon icon={faExclamationTriangle} />
                    } {infoId}</h3>
            </div>
            <div className="info-body">
                {
                    getContents(type, infoId, lineIndex, contents)
                }
            </div>
        </div>
    )
}


export default InfoCard;