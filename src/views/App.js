import { useState } from "react";
import ShowFile from "../components/ShowFile";
import { useSelector } from "react-redux";
import SelectSource from "./SelectSource";


const App = () => {
    const activeFile = useSelector(state => state.source.activeFile);
    const [currentTab, setTab] = useState(0); // won't need this. use routes instead


    return (
        <div className="page-container">
            <header>
                <h1>Supportive IDE: Symptom Checker</h1>
            </header>
            <nav>
                <ul className="navigation" role="menubar" aria-label="Main Menu">
                    <li role="none" className={`active ${currentTab === 0 && "current"}`}>
                        <a role="menuitem" href="/temp" tabIndex="0">Select source</a>
                    </li>
                    <li role="none" className={`${activeFile ? "active": "inactive"} ${currentTab === 1 && "current"}`}>
                        <a role="menuitem" aria-disabled={activeFile ? "false": "true"} href="/temp" tabIndex="0">View results</a>
                    </li>
                </ul>
            </nav>
            <main>
                <SelectSource />
                {
                    activeFile > -1 &&
                        <ShowFile />
                }
            </main>
        </div>
    );
}

export default App;
