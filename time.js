
/*
**
**  Time helper class
**  -- get timezones, current time, current date, and formats date properly.
**  -- uses built in Intl.DateTimeFormat
**
*/

// gets the current epoch time rounded to seconds
_getEpochTime = function ()
{
    return Math.round((new Date()).getTime() / 1000);
}

// public version of _getEpochTime
exports.getEpochTime = function()
{
    return _getEpochTime();
}

// Update the last time a message was sent
exports.updateTimer = function ()
{
    return _getEpochTime();
}

// get number of seconds since last message
exports.checkTimer = function (lastTime)
{
    var current = _getEpochTime();
    return current - lastTime;
}

// Returns the users timezone ie: America/St_Johns
getUserTimezone = function ()
{
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Returns the current time considering timezones
_getCurrentTime = function (hour12)
{
    // Set options object
    var options = {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: hour12,
        timeZone: getUserTimezone()
    },
        formatter = new Intl.DateTimeFormat([], options)

    // Return formatted datetime
    return formatter.format(new Date())
}

// public version of getCurrentTime
exports.currentTime = function (hour12=false)
{
    return _getCurrentTime(hour12);
}

// Get full date and time
_getDateTime = function (hour12=false)
{
    // build options
    var options =
    {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: hour12,
        timeZone: getUserTimezone()
    },
        formatter = new Intl.DateTimeFormat([], options)

    // Return formatted datetime
    return formatter.format(new Date())
}

// public version of getDateTime
exports.dateTime = function (hour12=false)
{
    return _getDateTime(hour12);
}

// Returns formatted date: Day/Month/Year
_getCurrentDate = function ()
{
    // Create new date object
    var date = new Date();

    // return formatted date day/month/year
    var formattedDate = new Intl.DateTimeFormat('en-US').format(date);

    return formattedDate;
}

// Public version of getCurrentDate
exports.currentDate = function ()
{
    return _getCurrentDate();
}
