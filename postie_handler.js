
const fs = require("fs");
const strings = require("./Strings");
const sh = require("./string_helper")

// removes specific char c from string str with n
removeCharFromString = function(str, c, n)
{
    return str.split(c).join(n);
}

// checks if string starts and ends with ':'
checkPostieCommand = function (cmd)
{
    var lst = sh.splitString(cmd);
    for (var i = 0; i < lst.length; i++)
    {
        if (lst[i][0] == ':' && lst[i][lst[i].length-1] == ':')
        {
            return lst[i];
        }
    }
    return false;
}

// parse gif form postie command
getPostieCommand = function (cmd)
{
    var postie = checkPostieCommand(cmd);
    
    // either false or a valid postie command
    if (postie != false)
    {
        var post = removeCharFromString(postie, ':', '');
        return post;
    }
    return false;
}

// return path to possible postie link
exports.packagePostie = function(api, event, cmd)
{
    var tst = getPostieCommand(cmd);
    if (tst !== false)
    {
        var path = strings.postiePath + tst + '.gif';
        try
        {
          stats = fs.statSync(__dirname + path);
          var msg =
          {
              attachment: fs.createReadStream(__dirname + path)
          }
          if (msg['attachment'] == undefined)
          {
              return false;
          }
          api.sendMessage(msg, event.threadID);
          return true;
        }
        catch (e)
        {
            var msg =
            {
                body: "No luck with command: " + cmd +  ". Tell scott to fix this."
            }
            // TODO: log non valid commands in file for later
            api.sendMessage(msg, event.threadID);
        }
    }
    return false;
}

// takes list of file names and returns list of valid postie commands
exports.getListOfNames = function (rawLst)
{
    var lst = [];
    for (var i = 0; i < rawLst.length; i++)
    {
        if (sh.contains(rawLst[i], '.gif'))
        {
            var gifName = sh.removeSubString(rawLst[i], '.gif');
            var cmd = ":" + gifName + ":";
            lst.push(cmd);
        }
    }
    // check for error adding to list
    if (lst.length == 0)
    {
        console.error("Problem checking dir for postie names.");
        return undefined;
    }
    return lst;
}
