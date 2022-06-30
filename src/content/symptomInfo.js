export const combinedSymptoms = {
    "BooleanSyntax.assignment": "BooleanSyntaxError",
    "BooleanSyntax.doubleOperators": "BooleanSyntaxError",
    "BooleanSyntax.outOfPlace": "BooleanSyntaxError",
    "BooleanSyntax.andOr": "BooleanSyntaxError",
    "UnreachableCode.exhaustiveConditional": "UnreachableCode",
    "UnreachableCode.exitKeyword": "UnreachableCode",
    "UnreachableCode.whileTrue": "UnreachableCode"
}

export const currentlyDetected = [
    "TypeError.unnecessary","OneLineConditional","UnusedVariable","UnusedValue","VariableOverwrite","UnreachableCode","LoopEarlyExit","BooleanSyntax.naturalLanguage","BooleanSyntaxError","CompareBoolLiteral","AssignmentInReturn","AssignedNoReturn","UnusedReturn","WrongArgNumber","UnknownFunction","RedundantException"];

export const symptomInfo = {
    "RedundantException": <p>A specific exception is caught using <code>except</code> then immediately raised. 
    Suggests confusion about how to work with exceptions.</p>,
    "UndefinedVariable": <p>A variable that was not declared is called. Depending on context, may be due to sloppiness (e.g. a typo) 
        or may suggest misconception about variable scope, function parameters, or how to call functions.
    </p>,
    "UnusedVariable": <p>A variable is not used after initialisation. May be an oversight but could potentially indicate 
        misconceptions about variables.
    </p>,
    "UnusedValue": <p>A value (either a single variable or a compound expression) is created but not assigned to a variable, passed 
        as a function argument, or used in some other way.
    </p>,
    "VariableOverwrite": <p>A variable's value is initialised or changed then overwritten without being used.
    </p>,
    "UnreachableCode.exitKeyword": <p>Code that is unreachable because it follows a <code>return</code> or <code>break</code> statement. 
    This might indicate a misconception about how those keywords affect the flow of control.</p>,
    "UnreachableCode.exhaustiveConditional": <p>Code that is unreachable because it follows a conditional with an <code>else</code> branch 
    in which all branches exit (e.g. due to a <code>return</code> statement).</p>,
    "UnreachableCode": <p>Code that is unreachable because if follows a <code>return</code> or <code>break</code> statement, a conditional 
    with an <code>else</code> branch in which all branches exit, or an infinite <code>while</code> loop.</p>,
    "TypeError.invalid": <p>Code that produces a <code>TypeError</code>.</p>,
    "TypeError.unnecessary": <p>A value that has a guaranteed data type is passed to a type conversion function that produces the same 
        data type.
    </p>,
    "LoopEarlyExit": <p>A <code>return</code> or <code>break</code> statement causes a loop to always exit on the first iteration.</p>,
    "BooleanSyntax.naturalLanguage": <p>A Boolean expression checking if a particular expression is equal to one of a range of 
        values uses <code>or</code> in a way that makes sense in natural language but may produce unexpected results in Python. For 
        example, <code>x == 5 or 6</code>.
    </p>,
    "BooleanSyntax.andOr": <p>A Boolean expression contains <code>and or</code>.</p>,
    "BooleanSyntax.assignment": <p>An assignment operator is used in a Boolean expression. This could be a typo or an indication of 
        confusion about <code>=</code> and <code>==</code>.
    </p>,
    "BooleanSyntax.doubleOperators": <p>Two comparison operators are used side by side. This may be due to an extra space e.g. <code>{'<='}</code> is 
    written as <code>{'<'} =</code></p>,
    "BooleanSyntax.outOfPlace": <p>A comparison or logical operator is used in an expected place in a conditional expression.</p>,
    "BooleanSyntaxError": <p>A syntax error in a boolean expression e.g. an out of place comparison operator.</p>,
    "OneLineConditional": <p>A conditional that could be re-written as one line. Although this is not an error, it may indicate a 
        misconception about Boolean values.
    </p>,
    "CompareBoolLiteral": <p>A Boolean expression is compared to a Boolean literal. Although this is not an error, it may indicate 
        a misconception about Boolean values.
    </p>,
    "AssignmentInReturn": <p>A variable is assigned in a <code>return</code> statement.</p>,
    "AssignedNoReturn": <p>A function or method that does not return a value is assigned to a variable, passed as an argument, or used 
        in some way. Commonly seen with the <code>print()</code> function.
    </p>,
    "UnusedReturn": <p>The result of a call to a function / method that returns a value is not used in some way.</p>,
    "WrongArgNumber": <p>A user-defined function is called with the wrong number of arguments.</p>,
    "UnknownFunction": <p>A function that is not defined in the file or built in to Python is called. Could be a typo or a misunderstanding 
        about variables.
    </p>,
}