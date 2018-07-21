
var POSTIE_PATH = '/data/posties/';

exports.getMsgPoints = function (msg)
{
    var total = msg.length;
    var pts = Math.floor(total / 10);
    return pts;
}

// Returns list of each word in msg
exports.splitAtSpace = function(msg)
{
    return msg.split(/[ ,]+/);
}

// Returns true when the substring key can be found in msg
exports.contains = function (msg, key)
{
    if (msg.indexOf(key) !== -1)
    {
        return true;
    }
    return false;
}

// Rebuild a string from list filling with whitespace
exports.reverseSplitAtSpace = function(lst, start)
{
    var msg = "";
    for (var i = start; i < lst.length; i++)
    {
        //msg = i == lst.length ? msg + lst[i] : msg + lst[i] + " "; REMOVE IF NOT USEABLE
        if (i == lst.length - 1)
        {
            msg += lst[i];
        }
        else
        {
            msg += lst[i] + " ";
        }
    }
    return msg;
}

// removes specific char c from string str with n
removeCharFromString = function(str, c, n)
{
    return str.split(c).join(n);
}

// checks if string starts and ends with ':'
checkPostieCommand = function(cmd)
{
    if (cmd[0] == ':' && cmd[cmd.length-1] == ':')
    {
        return true;
    }
    return false;
}

// parse gif form postie command
exports.getPostieCommand = function(cmd)
{
    if (checkPostieCommand(cmd))
    {
        var parse = removeCharFromString(cmd, ':', '');
        return parse;
    }
    return false;
}
