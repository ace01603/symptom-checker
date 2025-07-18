import { misconInfo, conInfo } from "../../content/misconceptionInfo";
import { sympInfo } from "../../content/symptomInfo";

const GenericMisconception = ({contents, category}) => {
    const infoObj = category === "misconception" ? misconInfo : conInfo;

    return (
        <>
            <p>{contents.reason.explanation}</p>
            <h4>{contents.reason.contributingSymptoms.length > 1 ? "Contributing Symptoms:" : "Contributing Symptom:"}</h4>
            <ul>
                {
                    contents.reason.contributingSymptoms.map((s, i) => 
                        <li key={i}><u>{s.type} (line {s.line + 1})</u>: {sympInfo[s.type]}
                            <pre>{s.text}</pre>
                        </li>
                    )
                }
            </ul>
            {
                infoObj[contents.type] ? <p><strong>About this {contents.type}:</strong> {infoObj[contents.type]}</p>: <p>Unknown {category}.</p>
            }
        </>
    )
}

export default GenericMisconception;