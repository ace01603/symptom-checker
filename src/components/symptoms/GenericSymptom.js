import { symptomInfo } from "../../content/symptomInfo";

const GenericSymptom = ({type, text}) => {
    return (
        <>
            <pre>{text}</pre>
            {
                symptomInfo.hasOwnProperty(type) ? symptomInfo[type]: "Unknown symptom."
            }
        </>
    )
}

export default GenericSymptom;