import { misconInfo } from "../../content/misconceptionInfo";
import { sympInfo } from "../../content/symptomInfo";

const GenericMisconception = ({type, occurrence}) => {
    return (
        <>
            <p>{occurrence.reason.explanation}</p>
            <h4>{occurrence.reason.contributingSymptoms.length > 1 ? "Contributing Symptoms:" : "Contributing Symptom:"}</h4>
            <ul>
                {
                    occurrence.reason.contributingSymptoms.map((s, i) => 
                        <li key={i}><u>{s.type} (line {s.line + 1})</u>: {sympInfo[s.type]}
                            <pre>{s.text}</pre>
                        </li>
                    )
                }
            </ul>
            {
                misconInfo.type ? <p><strong>About this misconception:</strong> {misconInfo[type]}</p>: <p>Unknown misconception.</p>
            }
        </>
    )
}

export default GenericMisconception;