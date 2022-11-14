import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";
import GenericSymptom from './symptoms/GenericSymptom';
import SymptomAssignedNoReturn from './symptoms/SymptomAssignedNoReturn';
import GenericMisconception from './misconceptions/GenericMisconception';
import SymptomTypeInvalid from './symptoms/SymptomTypeInvalid';

const getContents = (type, infoId, contents) => {
    if (type === "symptom") {
        switch (infoId) {
            case "AssignedNoReturn":
                return <SymptomAssignedNoReturn {...contents} />
            case "TypeError.invalid":
                return <SymptomTypeInvalid {...contents} />
            default:
                return <GenericSymptom {...contents} />
        }
    } else {
        return <GenericMisconception {...contents} />
    }
}

const InfoCard = ({infoId, type, yPos, isClicked, handleClick,
                   isHovered, handleHoverStart, handleHoverEnd, contents}) => {

    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
             onMouseEnter={() => {if (!isClicked) handleHoverStart()}} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
             className={`${type} info-card ${isClicked ? "info-card-selected" : ""} ${isHovered ? "info-card-hover" : ""}`} 
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
                    getContents(type, infoId, contents)
                }
            </div>
        </div>
    )
}

export default InfoCard;