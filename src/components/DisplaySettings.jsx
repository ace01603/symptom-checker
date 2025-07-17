import { useSelector, useDispatch } from "react-redux";
import { updateDisplaySetting } from "../redux/displayReducer";

const DisplaySettings = () => {
    const showMiscons = useSelector(state => state.display.showMisconceptions);
    const showUnmatched = useSelector(state => state.display.showUnmatched);
    const showConcepts = useSelector(state => state.display.showConcepts);

    const dispatch = useDispatch();


    return <div id="display-settings" className="settings">
        <h3>Display Settings</h3>
        <div className="settings-grid">
            <div><input type="checkbox" id="show-miscons" value="show-miscons" checked={showMiscons} onChange={event => dispatch(updateDisplaySetting({setting: "showMisconceptions", value: event.target.checked}))}></input><label htmlFor="show-miscons">Misconceptions</label></div>
            <div><input type="checkbox" id="show-concepts" value="show-concepts" checked={showConcepts} onChange={event => dispatch(updateDisplaySetting({setting: "showConcepts", value: event.target.checked}))}></input><label htmlFor="show-concepts">Concepts</label></div>
            <div><input type="checkbox" id="show-unmatched-symptoms" value="show-unmatched-symptoms" checked={showUnmatched} onChange={event => dispatch(updateDisplaySetting({setting: "showUnmatchedSymptoms", value: event.target.checked}))}></input><label htmlFor="show-unmatched-symptoms">Unmatched symptoms</label></div>
        </div>
    </div>
}

export default DisplaySettings;