//https://www.w3schools.com/jsref/jsref_obj_string.asp


// returns true if str contains substring
// set sensitive to true for case sensitive check.
var _contains = function (str, substring, sensitive=false)
{
    // remove uppercase letter before compairing
    if (!sensitive)
    {
        return str.toLowerCase().includes(substring.toLowerCase());
    }
    return str.includes(substring);
}

// public version of _contains
exports.contains = function (str, substring, sensitive=false)
{
    // remove uppercase letter before compairing
    return _contains(str, substring, sensitive);
}

// remove substring from string
_removeSubString = function (str, substring)
{
    return str.replace(substring, "");
}

// public version of removeSubString
exports.removeSubString = function (str, substring)
{
    return _removeSubString(str, substring);
}

// split string into array at char c
_splitString = function (str, c=" ")
{
        return str.split(c);
}

// public version of split string
exports.splitString = function (str, c=" ")
{
    return _splitString(str, c);
}
