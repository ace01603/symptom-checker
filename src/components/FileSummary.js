import { useSelector } from "react-redux";
import { combinedSymptoms } from "../content/symptomInfo";

const FileSummary = () => {
    const symptoms = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.symptoms : []);
    const misconceptions = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.misconceptions : []);

    const processSymptoms = () => {
        if (symptoms.length === 0) return "No symptoms found"
        let symptomMap = new Map();
        for (let symptom of symptoms) {
            let symptomType = combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type;
            if (!symptomMap.has(symptomType)) symptomMap.set(symptomType, 0);
            symptomMap.set(symptomType, symptomMap.get(symptomType) + 1);
        }
        const symptomMsg = Array.from(symptomMap).flatMap(symPair => `${symPair[0]} (${symPair[1]})`).join(", ");
        return symptoms.length === 1 ? `1 symptom found: ${symptomMsg}`: `${symptoms.length} symptoms found: ${symptomMsg}`;
    }

    const processMisconceptions = () => {
        if (misconceptions.length === 0) return "No misconceptions found";
        const misconMsg = Array.from(misconceptions).flatMap(m => m.type).join(", ");
        return misconceptions.length === 1 ? `1 misconception found: ${misconMsg}` : `${misconceptions.length} misconceptions found: ${misconMsg}`;
    }

    return (
        <div className="results-container mt1 mb1 smaller-txt">
            <p className="no-margin">
                {processMisconceptions()}
                <br/>
                {processSymptoms()}
            </p>
        </div>
    )
}

export default FileSummary;