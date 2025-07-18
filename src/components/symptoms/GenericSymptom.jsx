import { sympInfo } from "../../content/symptomInfo";

const padText = (indent, text) => {
    if (text.split("\n").length > 1) {
        let padded = text;
        for (let i = 0; i < indent; i++) {
            padded = " " + padded;
        }
        return padded;
    }
    return text;
}

const GenericSymptom = ({type, lineIndex, text}) => {
    
    return (
        <>
            <pre>{padText(lineIndex, text)}</pre>
            {
                sympInfo[type] !== undefined ? sympInfo[type]: "Unknown symptom."
            }
        </>
    )
}

export default GenericSymptom;