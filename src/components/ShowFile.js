import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import vsc from 'react-syntax-highlighter/dist/esm/styles/prism/vs';
import { parse } from "side-lib";

SyntaxHighlighter.registerLanguage('python', python);

const ShowFile = ({fileContents}) => {

    const [cWidth, setWidth] = useState("0px");
    const [cHeight, setHeight] = useState("0px");

    const symptomCanvas = useRef(null);

    useEffect(() => {
        const codeDisplay = document.getElementsByTagName("pre")[0];
        const codeStyles = getComputedStyle(codeDisplay);
        const lineNumbers = document.getElementsByClassName("linenumber");
        const symptomsReport = parse(fileContents);
        if (lineNumbers.length > 0 && symptomsReport.symptoms.length > 0) {
            console.log(symptomsReport.symptoms);
            const lineNumber = lineNumbers[lineNumbers.length - 1];
            const codeLines = fileContents.split(/\r?\n/);

            const codePaddingTop = parseFloat(codeStyles.paddingTop);
            const codePaddingLeft = parseFloat(codeStyles.paddingLeft);
            const codeMarginTop = parseFloat(codeStyles.marginTop);
            const codeMarginLeft = parseFloat(codeStyles.marginLeft);
            const codeLineHeight = parseFloat(codeStyles.lineHeight);
            const lineNumberOffset = parseFloat(getComputedStyle(lineNumber).width) + parseFloat(getComputedStyle(lineNumber).marginRight);

            if (codeStyles.width !== cWidth || codeStyles.height !== cHeight) {
                setWidth(codeStyles.width);
                setHeight(codeStyles.height);
            }

            const ctx = symptomCanvas.current.getContext('2d');
            ctx.font = getComputedStyle(codeDisplay).font;
            for (let symptom of symptomsReport.symptoms) {
                let lines = symptom.text.split(/\r?\n/);
                let textWidth = ctx.measureText(codeLines[symptom.line]).width;
                for (let l = 1; l < lines.length; l++) {
                    const tempW = ctx.measureText(codeLines[symptom.line + l]).width;
                    textWidth = tempW > textWidth ? tempW : textWidth;
                }
                if (textWidth > 0) {
                    ctx.beginPath();
                    ctx.rect(codePaddingLeft + codeMarginLeft + lineNumberOffset, codePaddingTop + codeMarginTop + symptom.line * codeLineHeight, textWidth, codeLineHeight * lines.length);
                    ctx.stroke();
                }
            }
        }
    }, [fileContents, cWidth, cHeight, setWidth, setHeight]);

    return (
        <div className="code-container">
            <canvas ref={symptomCanvas} id="symptom-canvas" width={cWidth} height={cHeight}></canvas>
            <SyntaxHighlighter language="python" style={vsc} showLineNumbers="true" 
                            showInlineLineNumbers="true" customStyle={{background: "transparent"}}>
                {fileContents}
            </SyntaxHighlighter>
        </div>
    )
}

export default ShowFile;

ShowFile.propTypes = {
    fileContents: PropTypes.string
}

ShowFile.defaultProps = {
    fileContents: "# Open a Python file using the button above"
}