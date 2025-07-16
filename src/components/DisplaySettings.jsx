const DisplaySettings = () => {
    return <div id="display-settings" className="settings">
        <h3>Display Settings</h3>
        <div className="settings-grid">
            <div><input type="checkbox" id="show-miscons" value="show-miscons"></input><label htmlFor="show-miscons">Misconceptions</label></div>
            <div><input type="checkbox" id="show-concepts" value="show-concepts"></input><label htmlFor="show-concepts">Concepts</label></div>
            <div><input type="checkbox" id="show-unmatched-symptoms" value="show-unmatched-symptoms"></input><label htmlFor="show-unmatched-symptoms">Unmatched symptoms</label></div>
        </div>
    </div>
}

export default DisplaySettings;