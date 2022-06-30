import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import { symptomInfo, currentlyDetected } from "../content/symptomInfo";

const About = () => <div className="basic-container">
    <h2>The Symptom Checker</h2>
    <p>Use this website to search Python source code for symptoms of misconceptions about basic 
        Python programming concepts. A <HashLink smooth to="#symptoms"><em>symptom</em></HashLink> is a pattern in a statement of block of 
        code that is associated with one or more <HashLink smooth to="#misconceptions">misconceptions</HashLink>. Symptoms are distinct from misconceptions 
        because different misconceptions may exhibit the same symptoms. For example, an undefined 
        variable is a symptom. Depending on the presence of other symptoms, it could indicate a 
        misconception about variable values or scope, syntax of function calls, or it could just 
        be a typo. Symptoms are also distinct from errors as misconceptions may be apparent in 
        code that produces correct output.
    </p>
    <h3 className="serif">How to Use</h3>
    <p>Go to <Link to="/select-source">Select Source</Link> and choose either a single .py file or a folder. 
    If a folder is selected, the Symptom Checker will analyse all .py files in the folder, including those in 
    nested folders. Detected symptoms will be shown in a <Link to="/summary">summary</Link> table. Go to 
    the <Link to="/file-view">File View</Link> tab to inspect individual files. The <Link to="/file-view">File View</Link> tab 
    includes a filter to select files with specific symptoms.</p>
    <h3 className="serif">Important Details (and Known Limitations)</h3>
    <p>The symptom checker is powered by SIDE-lib, a library we have developed that parses text and forms a custom <a href="https://en.wikipedia.org/wiki/Abstract_syntax_tree" target="_blank" rel="noreferrer">Abstract 
    Syntax Tree (AST)</a> containing information about expressions, statements, and blocks of code. SIDE-lib is completely standalone 
    and based purely on text parsing, 
    meaning it does not interact with the Python interpreter or intercept run time errors. SIDE-lib is able to identify and 
    track many Python constructs such as variables, function definitions, most built-in functions, built-in methods used with 
    common data types (e.g. String methods), literals, loops, and common data types (ints, floats, booleans, strings, lists, 
    dictionaries, tuples, and sets). However, the library is not a complete parser. <strong>The following constructs are not currently handled</strong>:</p>
    <ul>
        <li>Imported modules, including commonly used modules such as <code>sys</code> and <code>math</code></li>
        <li>User-defined classes</li>
    </ul>
    <p>The symptom checker may produce unexpected or unreliable results when analysing files that contain imported modules or 
        user-defined classes.
    </p>
    <p>Where possible, SIDE-lib infers the data type of literals and variables and the return type(s) of user-defined functions. It also 
        tracks the return type of most supported built-in functions and methods. <strong>SIDE-lib uses the following rules to determine 
        type</strong>:
    </p>
    <ul>
        <li>Where an expression is <em>guaranteed</em> to have a single data type, it is assigned that type in the custom AST. For example, 
        consider the following code:
        <pre>{
            "x = 10\n" + 
            "y = input(\"Enter your name:\")"
        }
        </pre>
        The literal, 10, is guaranteed to be an integer. As 10 is assigned directly to <code>x</code>, <code>x</code> is also guaranteed 
        to be an integer. The built in function <code>input()</code> will always return a string, therefore <code>y</code> must be a string.
        </li>
        <li>If the data type of a particular expression is ambiguous or not determined, it will be treated as having "unknown" data type.</li>
        <li>Data types are only inferred at the highest level e.g. a list variable will be identified as a list data type but the data type(s) 
            of the list contents will not be tracked.</li>
        <li>Expressions that involve an unknown data type are assumed to be valid unless it can be inferred by other means that the expression 
            is not valid. The evaluated type of a valid expression involving an unknown 
            data type will also be unknown. For example, in the code below, <code>lst</code> is treated as a list data type but the 
            type of <code>lst[0]</code> is unknown.
            <pre>{
                "lst = [\"a\", 1.5, True]\n" +
                "print(lst[0] + lst[1])"
            }</pre>
            <code>lst[0] + lst[1]</code> involves two unknown data types according to SIDE-lib. With knowledge of the specific list items 
            involved in the expression, it is clear that the expression will lead to a <code>TypeError</code>. However, because SIDE-lib 
            does not currently determine the types of list items, and <code>&lt;unknown list item&gt; + &lt;unknown list item&gt;</code> <em>could</em> be 
            valid depending on the specific data types involved, <code>lst[0] + lst[1]</code> is inferred to be a valid expression with evaluated type 
            of "unknown".
        </li>
        <li>When an expression has syntax issues or identifiable type errors, SIDE-lib marks it as having "invalid" type and continues parsing the rest of the file.</li>
        <li>Parameters in user-defined functions are treated as having unknown data type.</li>
        <li>When a function (user-defined or built-in) has multiple return types, calls to that function are treated as having unknown data type.</li>
        <li>The data types of arguments provided in function calls are not validated.</li>
    </ul>
    <p><HashLink smooth to="#top">Back to top</HashLink></p>
    <h2 className="serif" id="symptoms">The Symptoms</h2>
    <p>The symptoms detected by SIDE-lib and highlighted by the Symptom Checker were derived from our analysis of 1332 Python programs written 
        by beginner programming students. The symptoms currently detected are described below.</p>
    <table className="results-table no-sort">
        <thead>
            <th>Symptom ID</th>
            <th>Description</th>
        </thead>
        <tbody>
            {
                currentlyDetected.map((id, i) => 
                    <tr key={i}>
                        <td>{id}</td>
                        <td>{symptomInfo[id]}</td>
                    </tr>
                )
            }
        </tbody>
    </table>
    <p><HashLink smooth to="#top">Back to top</HashLink></p>
    <h2 className="serif" id="misconceptions">Misconceptions</h2>
    <p>We are currently in the process of mapping symptoms to misconceptions. More soon!</p>
    <p><HashLink smooth to="#top">Back to top</HashLink></p>
</div>

export default About;