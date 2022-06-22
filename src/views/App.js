import SelectSource from "./SelectSource";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Results from "./Results";
import Summary from "./Summary";


const App = () => {
    const location = useLocation();

    return (
        <div className="page-container">
            <header>
                <h1>Supportive IDE: Symptom Checker</h1>
            </header>
            <nav>
                <ul className="navigation" role="menubar" aria-label="Main Menu">

                    <li role="none" className={`active ${(location.pathname === `/` || location.pathname === `/select-source`) && "current"}`}>
                        <Link to={`/select-source`}>Select Source</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/summary` && "current"}`}>
                        <Link to="/summary">Summary</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/file-view` && "current"}`}>
                        <Link to="/file-view">File View</Link>
                    </li>
                </ul>
            </nav>
            <main>
                <Routes>
                    <Route path="/select-source" element={<SelectSource />} />
                    <Route path = "/file-view" element={<Results />} />
                    <Route path="/summary" element={<Summary />} />
                    <Route path="/" element={<SelectSource />} /> 
                </Routes>
            </main>
        </div>
    );
}

export default App;
