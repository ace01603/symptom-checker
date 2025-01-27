import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FileNavigation from "../components/FileNavigation";
import FileSummary from "../components/FileSummary";
import ShowFile from "../components/ShowFile"
import { disableFileViewRedirect } from "../redux/statusReducer";

const Results = () => {
    const activeFile = useSelector(state => state.source.activeFile);
    const redirect = useSelector(state => state.status.navigateToFileView);

    const dispatch = useDispatch();

    useEffect(() => {
        if (redirect) {
            dispatch(disableFileViewRedirect());
        }
    }, [dispatch, redirect]);

    return (
        <>
            <FileNavigation />
            {
                (activeFile >= 0) &&
                    <>
                        <FileSummary />
                        <ShowFile />
                    </>
            }
        </>
    )

    
}

export default Results;
