import PropTypes from 'prop-types';

const FileUploader = ({ onFileRead }) => {
    const showFile = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        let fileName = e.target.files[0].name;
        reader.onload = (e) => {
            const text = e.target.result;
            onFileRead(fileName, text);
        };
        reader.readAsText(e.target.files[0]);
    };
    return <input type="file" accept=".py" onChange={showFile} />;
}

export default FileUploader;

FileUploader.propTypes = {
    onFileRead: PropTypes.func.isRequired
};