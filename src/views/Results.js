import { useDispatch, useSelector } from "react-redux";
import FileNavigation from "../components/FileNavigation";
import ShowFile from "../components/ShowFile"
import { disableRedirect } from "../redux/statusReducer";

const Results = () => {
    const activeFile = useSelector(state => state.source.activeFile);
    const redirect = useSelector(state => state.status.navigateToResults);

    const dispatch = useDispatch();

    if (redirect) {
        dispatch(disableRedirect());
    }

    return (
        <>
            <FileNavigation />
            {
                (activeFile >= 0) ?
                <ShowFile />
                :
                <p><strong>Error!</strong> No source selected</p>
            }
        </>
    )

    
}

export default Results;
