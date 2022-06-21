import { useSelector } from "react-redux";
import { combinedSymptoms } from "../content/symptomInfo";

const FileSummary = () => {
    const symptoms = useSelector(state => state.source.activeFile >= 0 ? state.source.files[state.source.filteredFiles[state.source.activeFile]].analysis.symptoms : [])

    const processSymptoms = () => {
        if (symptoms.length === 0) return <p>No symptoms found</p>
        let symptomMap = new Map();
        for (let symptom of symptoms) {
            let symptomType = combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type;
            if (!symptomMap.has(symptomType)) symptomMap.set(symptomType, 0);
            symptomMap.set(symptomType, symptomMap.get(symptomType) + 1);
        }
        return <p>{symptoms.length === 1 ? "1 symptom found": `${symptoms.length} symptoms found`}: {Array.from(symptomMap).flatMap(symPair => `${symPair[0]} (${symPair[1]})`).join(", ")}</p>
    }

    return (
        <div className="summary-container">
            {processSymptoms()}
        </div>
    )
}

export default FileSummary;