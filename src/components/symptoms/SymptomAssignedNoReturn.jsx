const SymptomAssignedNoReturn = ({text, expressionNoValue}) => {
return (
    <>
        <pre>{text}</pre>
        {
            expressionNoValue.type === "userDefinedFunction" ?
                <p><code>{text}</code> is a user-defined function that does not return a value but it is used as if it does.</p>
                :
                expressionNoValue.type === "builtInFunction" ?
                    <p>The built-in function <code>{text}()</code> does not return a value but it is used as if it does.</p>
                    :
                    expressionNoValue.type === "userDefinedVariable" ?
                        <p><code>{text}</code> has no value but it is used as if it does.</p>
                        : ""
        }
    </>
)
}

export default SymptomAssignedNoReturn;