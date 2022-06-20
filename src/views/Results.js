import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FileNavigation from "../components/FileNavigation";
import ShowFile from "../components/ShowFile"
import { disableRedirect } from "../redux/statusReducer";

const Results = () => {
    const activeFile = useSelector(state => state.source.activeFile);
    const redirect = useSelector(state => state.status.navigateToResults);

    const dispatch = useDispatch();

    useEffect(() => {
        if (redirect) {
            dispatch(disableRedirect());
        }
    }, [dispatch, redirect]);

    return (
        <>
            <FileNavigation />
            {
                (activeFile >= 0) &&
                    <ShowFile />
            }
        </>
    )

    
}

export default Results;
