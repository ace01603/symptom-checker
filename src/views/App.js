import SelectSource from "./SelectSource";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Results from "./Results";


const App = () => {
    const location = useLocation();

    return (
        <div className="page-container">
            <header>
                <h1>Supportive IDE: Symptom Checker</h1>
            </header>
            <nav>
                <ul className="navigation" role="menubar" aria-label="Main Menu">

                    <li role="none" className={`active ${(location.pathname === "/" || location.pathname === "/select-source") && "current"}`}>
                        <Link to="/select-source">Select source</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === "/results" && "current"}`}>
                        <Link to="/results">Results</Link>
                    </li>
                </ul>
            </nav>
            <main>
                <Routes>
                    <Route path="/select-source" element={<SelectSource />} />
                    <Route path = "/results" element={<Results />} />
                    <Route path="/" element={<SelectSource />} /> {/* only if activeFile > -1 */}
                </Routes>
            </main>
        </div>
    );
}

export default App;
