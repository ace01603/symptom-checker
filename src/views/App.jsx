import SelectSource from "./SelectSource.jsx";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Results from "./Results";
import Summary from "./Summary";
import About from "./About";
import { useDispatch, useSelector } from "react-redux";
import { readFiles } from "../redux/sourceReducer.js";


const App = () => {
    const location = useLocation();

    const filesToProcess = useSelector(state => state.source.filesToProcessCount);

    const dispatch = useDispatch();

    const getFilesToOpen = files => {
        dispatch(readFiles(files));
    }


    return (
        <div className="page-container">
            <header>
                <h1>Supportive IDE: Symptom Checker</h1>
            </header>
            <nav>
                <ul className="navigation" role="menubar" aria-label="Main Menu">
                    <li role="none" className={`active ${(location.pathname === `/` || location.pathname === `/about`) && "current"}`}>
                        <Link to={`/about`}>About</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/select-source` && "current"}`}>
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
                    <Route path="/about" element={<About />} />
                    <Route path="/select-source" element={<SelectSource filesToProcess={filesToProcess} processFiles={(files) => getFilesToOpen(files) /*setFilesToProcess(files)*/} />} />
                    <Route path = "/file-view" element={<Results />} />
                    <Route path="/summary" element={<Summary />} />
                    <Route path="/" element={<About />} /> 
                </Routes>
            </main>
        </div>
    );
}

export default App;
