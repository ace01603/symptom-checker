import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import { parse } from "side-lib";


const ShowFile = ({fileContents}) => {

    const hiddenPre = useRef(null);
    const [cWidth, setWidth] = useState("0px");
    const [cHeight, setHeight] = useState("0px");

    const symptomCanvas = useRef(null);
    const sourceCode = useRef(null);

    const symptoms = parse(fileContents).symptoms;
    const codeLines = fileContents.split(/\r?\n/);

    useEffect(() => {
        const sourceCodeStyle = getComputedStyle(sourceCode.current);
        if (symptomCanvas.current.width !== sourceCodeStyle.width || symptomCanvas.current.height !== sourceCodeStyle.height) {
            setWidth(getComputedStyle(sourceCode.current).width);
            setHeight(getComputedStyle(sourceCode.current).height);
        }
    }, [fileContents, cWidth, cHeight, setWidth, setHeight]);
    // TODO: MAKE HIGHLIGHTS INTERACTIVE - may need to use divs rather than canvas
    useEffect(() => {
        if (symptoms.length > 0) {
            const ctx = symptomCanvas.current.getContext('2d');
            ctx.font = getComputedStyle(hiddenPre.current).font;
            ctx.fillStyle = "#49c8e7cc";

            let lineNumberStyle = getComputedStyle(document.getElementsByClassName("line-number")[0]);
            let leftEdge = parseFloat(lineNumberStyle.width) + parseFloat(lineNumberStyle.marginRight);
            let topEdge = parseFloat(getComputedStyle(sourceCode.current).marginTop);
            let lineHeight = parseFloat(lineNumberStyle.height) + parseFloat(lineNumberStyle.marginTop);
            for (let symptom of symptoms) {
                let x = leftEdge;
                if (symptom.lineIndex > 0) {
                    x += ctx.measureText(codeLines[symptom.line].substring(0, symptom.lineIndex)).width; 
                }
                let y = topEdge + symptom.line * lineHeight;
                let lines = symptom.text.split(/\r?\n/);
                let w = ctx.measureText(codeLines[symptom.line].indexOf(lines[0]) >= 0 ? lines[0] : codeLines[symptom.line].substring(symptom.lineIndex, lines[0].length)).width; //parseFloat(getComputedStyle(hiddenPre.current).width);
                let h = lines.length * lineHeight;
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.fill();
            }
        }
    }, [codeLines, symptoms, fileContents, cWidth, cHeight, setWidth, setHeight]);


    return (
        <div className="code-container">
            <canvas ref={symptomCanvas} id="symptom-canvas" width={cWidth} height={cHeight}></canvas>
            <div ref={sourceCode} className="source-code">
                {
                    codeLines.map((line, index) => 
                        <Fragment key={index}>
                            <div className="line-number">{index + 1}</div>
                            <div className="code-line"><pre>{line}</pre></div>
                        </Fragment>
                    )
                }
                <pre id="hidden-pre" aria-hidden="true" ref={hiddenPre}></pre>
            </div>
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