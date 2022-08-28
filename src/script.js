htmlElem = document.getElementById.bind(document)

//DECIMAL VARIABLES
let decimalUsed = false
let decimalUsed_pow = false

//EXPONENT VARIABLES
let exponentMode = false
let exponentAsText = "0"
let exponentAsFloat = 0
let exponentAsTextLength = 1
let exponentAsTextLengthMax = 2

//MAIN SCREEN NUMBER VARIABLES
let mainNumberAsText = "0"
let mainNumberAsFloat = 0
let mainNumberAsTextLength = mainNumberAsText.length
let mainNumberAsTextLengthMax = 13
let accumulatedAnswer = ""
let finalAnswer = ""

//OPERATION VARIABLES
let calculation = []
let numbersSubmitted = 0
let operandSelectMode = false
let inError = false

//Initialization
function init()
{
    decimalUsed = decimalUsed_pow = false
    mainNumberAsText = '0', mainNumberAsFloat = mainNumberAsTextLength = 0
    mainNumberAsTextLengthMax = 13, accumulatedAnswer = ""

    calculation = []
    operandSelectMode = false
    inError = false
    numbersSubmitted = 0
    
    exponentAsText = '0', exponentAsFloat = 0, exponentAsTextLength = 1, exponentAsTextLengthMax = 2
    htmlElem("num_txt").innerHTML = htmlElem("pow_num").style.animation = "0"
    htmlElem("pow_num").style.opacity = htmlElem("pow_txt").style.opacity = "0"
}

//Update calculation and the screen information
function update()
{
    //Check for undefined or infinity errors
    errorCheck()

    //Update main number text
    mainNumberAsFloat = parseFloat(mainNumberAsText)
    mainNumberAsTextLength = mainNumberAsText.length
    
    //Update main number decimal and text length variables
    decimalUsed = mainNumberAsText.includes('.') ? true : false
    mainNumberAsTextLengthMax = decimalUsed ? 14 : 13

    //Update the main number information to the screen
    htmlElem("num_txt").innerHTML = operandSelectMode && numbersSubmitted >=2 ? 
        commaFormatManager(accumulatedAnswer) : commaFormatManager(mainNumberAsText)

    //Update exponent number text
    exponentAsFloat = parseFloat(exponentAsText)
    exponentAsTextLength = exponentAsText.length

    //Update exponent number decimal and text length variables
    decimalUsed_pow = exponentAsText.includes(".") ? true : false
    exponentAsTextLengthMax = decimalUsed_pow ? 5 : 2
    htmlElem("pow_num").innerHTML = commaFormatManager(exponentAsText)
    
    //Update log
    console.log("Current number:", mainNumberAsText,  
                "\nContains decimal? ", decimalUsed ? "Yes" : "No",
                "\nExponent mode? ", exponentMode ? "Yes" : "No",
                "\nCalculation:", calculation.join(" "))
    console.log("Current operand:", calculation[calculation.length - 1], "\nSelecting operand?", 
                !operandSelectMode ? "No" : "Yes")
    console.log("")
}

//Handles entering numbers and exponents
function typingManager(char)
{
    if((mainNumberAsTextLength < mainNumberAsTextLengthMax || operandSelectMode) && !exponentMode)
    {
        (mainNumberAsText == '0' || operandSelectMode || inError) ? 
            (mainNumberAsText = char, operandSelectMode = false, inError = false) : mainNumberAsText += char
        new Audio("audio/select.wav").play()
    }
    else if((exponentAsTextLength < exponentAsTextLengthMax) && exponentMode && !operandSelectMode && !inError)
    {
        exponentAsText == '0' ? exponentAsText = char : exponentAsText += char
        new Audio("audio/select.wav").play()
    }
    update()
}

//Handles operand selection
function operandSelectionManager(op)
{
    if(!operandSelectMode && !exponentMode)
    {
        numbersSubmitted++
        calculation.push(mainNumberAsText)
        if(numbersSubmitted >= 2)
        {
            accumulatedAnswer = eval(calculation.join(" ")).toString()
            //Check if accumulated answer overflows the screen and is a decimal number. If so, round it down
            if(accumulatedAnswer.length > mainNumberAsTextLengthMax && accumulatedAnswer.includes('.'))
            {
                let rightSide = accumulatedAnswer.substring(accumulatedAnswer.indexOf('.'), mainNumberAsTextLengthMax)
                accumulatedAnswer = commaFormatManager(parseFloat(accumulatedAnswer).toFixed(rightSide.length - 1).toString())
            }
            calculation = [accumulatedAnswer]
        }
    }
    !operandSelectMode && !exponentMode ? 
        calculation.push(op) : calculation[calculation.length - 1] = op
    operandSelectMode = true
    new Audio("audio/select.wav").play()
    update()
}

//Handles inserting decimals onto numbers
function decimalManager()
{
    !exponentMode && !inError? 
        mainNumberAsText = !decimalUsed ? mainNumberAsText + '.' : mainNumberAsText :
        exponentAsText = !decimalUsed_pow ? exponentAsText + '.' : exponentAsText
    new Audio("audio/select.wav").play()
    update()
}

//Handles toggling negative sign for main number and exponents
function negativeToggleManager()
{
    !exponentMode ?
        mainNumberAsText = (mainNumberAsFloat *= -1).toString() :
        exponentAsText = (exponentAsFloat *= -1).toString()
    new Audio("audio/select.wav").play()
    update()
}

//Handles backspacing of characters
function backspaceManager()
{
    if(!exponentMode)
    {
        mainNumberAsText.replace('-', '').length != 1? 
        mainNumberAsText = mainNumberAsText.substring(0, mainNumberAsTextLength - 1) : 
            (mainNumberAsText = '0')
        new Audio("audio/back.wav").play()
    }
    else
    {
        exponentAsText.replace('-', '').length != 1? 
        exponentAsText = exponentAsText.substring(0, exponentAsTextLength - 1) : 
            (exponentAsText = '0')
        new Audio("audio/back.wav").play()
    }
    update()
}

//Handles square-rooting
function squareRootManager()
{
    mainNumberAsText = Math.sqrt(mainNumberAsFloat).toString()
    //Check if accumulated answer overflows the screen and is a decimal number. If so, round it down
    mainNumberAsText.length > mainNumberAsTextLengthMax && mainNumberAsText.includes('.') ?
        mainNumberAsText = parseFloat(mainNumberAsText).toFixed(10).toString() :
        console.warn("All good")
    new Audio("audio/select.wav").play()
    update()
}

//Enables/disables exponent mode
function exponentManager()
{
    !operandSelectMode ? 
        exponentMode = !exponentMode : console.warn("Warning: Cannot enable exponent mode at this time")
    exponentMode ? 
        (htmlElem("pow_txt").style.opacity = htmlElem("pow_num").style.opacity = '1', 
        htmlElem("pow_num").style.animation = "pulsing_anim 1.15s infinite") : 
        (htmlElem("pow_txt").style.opacity = htmlElem("pow_num").style.opacity = '0', 
        htmlElem("pow_num").style.animation = exponentAsText = '0')
    new Audio("audio/select.wav").play()
    update()
}

//Either prints the final answer, or power raises a number based on whether or not exponent mode is enabled
function returnAnswer()
{
    if(exponentMode)
    {
        mainNumberAsText = Math.pow(mainNumberAsFloat, exponentAsFloat).toString()
        //Check if accumulated answer overflows the screen and is a decimal number. If so, round it down
        if(mainNumberAsText.length > mainNumberAsTextLengthMax && mainNumberAsText.includes('.'))
        {
            let rightSide = mainNumberAsText.substring(mainNumberAsText.indexOf('.'), mainNumberAsTextLengthMax)
            mainNumberAsText = parseFloat(mainNumberAsText).toFixed(rightSide.length - 1).toString()
        }
        exponentMode = false
        htmlElem("pow_txt").style.opacity = htmlElem("pow_num").style.opacity = htmlElem("pow_num").style.animation = exponentAsText = '0'
    }
    else
    {
        calculation.push(mainNumberAsText)
        finalAnswer = eval(calculation.join(" ")).toString()
        init()
        mainNumberAsText = finalAnswer
    }
    new Audio("audio/select.wav").play()
    update()
}

//Resets all calculations
function reset()
{
    new Audio("audio/back.wav").play()
    init()
}

function errorCheck()
{
    //Check if the main number exceeds the allowed integer limit
    if(parseFloat(accumulatedAnswer) < -9999999999999 || parseFloat(accumulatedAnswer) > 9999999999999 || mainNumberAsText.includes('e') || !isFinite(parseFloat(mainNumberAsText)))
    {
        init()
        inError = true
        mainNumberAsText = "NaN"
    }
}

//Handles comma-formatting of numbers
function commaFormatManager(num)
{
    //There should be no commas on the right side of the decimal
    if(decimalUsed || num.includes('.'))
    {
        //Separate the right side of the decimal from the left side
        let rightSide = num.substring(num.indexOf('.') + 1)
        num = num.replace(rightSide, "")
        //Remove all special characters from the right side
        rightSide = rightSide.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
        //Combine the modified right side with the left side
        num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + rightSide
        return num
    }
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
