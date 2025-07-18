import { useSelector, useDispatch } from "react-redux";
import { updateUnmatchedDisplaySetting, toggleMisconceptions, updateSelectedConcept } from "../redux/displayReducer";
import { conInfo } from "../content/misconceptionInfo";

const DisplaySettings = () => {
    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatched = useSelector(state => state.display.showUnmatched);
    const selectedConcept = useSelector(state => state.display.selectedConcept);

    const dispatch = useDispatch();


    return <div id="display-settings" className="settings">
        <h3>Display Settings</h3>
        <div className="settings-section">
            <div><input type="radio" name="miscons-v-concepts" id="show-miscons" value="show-miscons" checked={showMiscons} onChange={event => dispatch(toggleMisconceptions(event.target.checked))}></input><label htmlFor="show-miscons">Misconceptions</label></div>
            <div><input type="radio" name="miscons-v-concepts" value="show-concepts" checked={!showMiscons} onChange={event => dispatch(toggleMisconceptions(!event.target.checked))}></input><label htmlFor="show-concepts">Concepts</label></div>
            <div className={`full-row ${showMiscons ? "show" : "hide"}`}><input type="checkbox" id="show-unmatched-symptoms" value="show-unmatched-symptoms" checked={showUnmatched} onChange={event => dispatch(updateUnmatchedDisplaySetting(event.target.checked))}></input><label htmlFor="show-unmatched-symptoms">Unmatched symptoms</label></div>
        </div>
        <div className={`settings-section ${showMiscons ? "hide" : "show"}`}>
            <div>
                <label htmlFor="concept-select">Show concept: </label>
                <select id="concept-select" value={selectedConcept} onChange={e => dispatch(updateSelectedConcept(e.target.value))}>
                    <option value="none">No concept selected</option>
                    {
                        Object.keys(conInfo).map(c => <option key={c} value={c}>{c}</option>)
                    }
                </select>
            </div>
        </div>
    </div>
}

export default DisplaySettings;