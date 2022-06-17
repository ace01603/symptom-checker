import { useSelector } from "react-redux";

const FileNavigation = () => {
    const fileName = useSelector(state => {
        if (state.source.activeFile >= 0) {
            return state.source.files[state.source.activeFile].fileName;
        }
        return "No file selected";
    })

    return (
        <div className="results-container">
            <div className="navigation">
                <div className="step-button prev"></div>
                <div>{fileName}</div>
                <div className="step-button next"></div>
            </div>
            <div className="file-summary">

            </div>
        </div>
    )
}

export default FileNavigation;