const InfoCard = ({symptomId, explanation, yPos}) => {
    return (
        <div className="info-card" style={{top: `${yPos}px`}}>
            <div className="info-header">
                <h3>{symptomId}</h3>
            </div>
            <div className="info-body">
                {explanation}
            </div>
        </div>
    )
}

export default InfoCard;