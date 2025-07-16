import { useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faExclamationTriangle, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import DisplaySettings from "./DisplaySettings";

const FileSummary = () => {
    const symptoms = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.symptoms : []);
    const misconceptions = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.misconceptions : []);
    const concepts = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.concepts : [])

    const processSymptoms = () => {
        if (symptoms.length === 0) return "No symptoms found"
        let symptomMap = new Map();
        for (let symptom of symptoms) {
            let symptomType = symptom.type;
            if (!symptomMap.has(symptomType)) symptomMap.set(symptomType, 0);
            symptomMap.set(symptomType, symptomMap.get(symptomType) + 1);
        }
        const symptomMsg = Array.from(symptomMap).flatMap(symPair => `${symPair[0]} (${symPair[1]})`).join(", ");
        return symptoms.length === 1 ? <><strong>1 symptom:</strong> {symptomMsg}</>: <><strong>{symptoms.length} symptoms:</strong> {symptomMsg}</>;
    }

    const processMisconceptions = () => {
        if (misconceptions.length === 0) return "No misconceptions found";
        let misconMap = new Map();
        for (let miscon of misconceptions) {
            misconMap.set(miscon.type, miscon.occurrences.length);
        }
        const misconMsg = Array.from(misconMap).flatMap(mPair => `${mPair[0]} (${mPair[1]})`).join(", ");
        return misconceptions.length === 1 ? <><strong>1 misconception:</strong> {misconMsg}</> : <><strong>{misconceptions.length} misconceptions:</strong> {misconMsg}</>;
    }

    const processConcepts = () => {
        if (concepts.length === 0) return "No concepts found";
        let conceptMap = new Map();
        for (let con of concepts) {
            conceptMap.set(con.type, con.occurrences.length);
        }
        const conMsg = Array.from(conceptMap).flatMap(mPair => `${mPair[0]} (${mPair[1]})`).join(", ");
        return concepts.length === 1 ? <><strong>1 concept:</strong> {conMsg}</> : <><strong>{concepts.length} concepts:</strong> {conMsg}</>;
    }

    return (
        <div className="results-container mt1 mb1 smaller-txt">
            <p className="no-margin">
                <FontAwesomeIcon icon={faExclamationTriangle} /> {processMisconceptions()}
                <br/>
                <FontAwesomeIcon icon={faStethoscope} /> {processSymptoms()}
                <br/>
                <FontAwesomeIcon icon={faLightbulb} /> {processConcepts()}
            </p>
            {/** Display settings go here */}
            <DisplaySettings />
        </div>
    )
}

export default FileSummary;