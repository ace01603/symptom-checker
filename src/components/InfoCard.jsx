import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from "react";
import GenericSymptom from './symptoms/GenericSymptom';
import GenericMisconception from './misconceptions/GenericMisconception';


/**
 * 
 * @param {Card} card 
 * @returns 
 */
const getContents = (card) => {
    if (card.getCategory() === "symptom") {
        return <GenericSymptom type={card.getType()} lineIndex={card.getLineIndex()} text={card.getContents().text} />
    } else {
        return <GenericMisconception contents={card.getContents()} category={card.getCategory()} />
    }
}


const InfoCard = ({card, isClicked, handleClick,
                   isHovered, handleHoverStart, handleHoverEnd}) => {

    useEffect(() => {
        const clickHandler = handleClick;
        if (isClicked) window.addEventListener("click", clickHandler);

        return () => window.removeEventListener("click", clickHandler);
    }, [handleClick, isClicked])

    return (
        <div onClick={e => {e.stopPropagation(); handleClick(); }} 
            onMouseEnter={() => {
                    if (!isClicked) {
                        handleHoverStart();
                    }
                }} onMouseLeave={() => {if (isHovered) handleHoverEnd()}} 
            className={`${card.getCategory()} info-card${isClicked ? " info-card-selected" : ""}${isHovered ?  " info-card-hover" : ""}`} 
            style={{top: `${card.getY()}px`}}>
            <div className="info-header">
                <h3><FontAwesomeIcon icon={card.getIcon()} /> {card.getType()}</h3>
            </div>
            <div className="info-body">
                {
                    getContents(card)
                }
            </div>
        </div>
    )
}


export default InfoCard;