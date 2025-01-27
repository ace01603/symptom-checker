const ProgressBar = ({completed, total}) => {

    return (
        <div className="progress-container">
            <div className="progress-bg">
                <div className="progress-fill" style={{width: ((completed / total) * 100) + "%"}}></div>
                <span className="progress-info">Processing {completed} of {total}</span>
            </div>
        </div>
    )
};

export default ProgressBar;