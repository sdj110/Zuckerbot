const json = require("./json_helper.js");
const strings = require("./Strings.js");
const sh = require("./string_helper.js");

_buildWordObj = function ()
{
    // read word dict from file
    var wordObj = new Object();

    // read log file object
    var msgLst = json.readObjFromFile(strings.logMsgPath);

    // array to hold every word in every message
    var wordArr = [];

    // loop through every message
    for (var i = 0; i < msgLst.length; i++)
    {
        var bodyArr = sh.splitString(msgLst[i]["body"]);
        for (var j = 0; j < bodyArr.length; j++)
        {
            // add new word to list
            wordArr.push(bodyArr[j]);
        }
    }

    // DEBUG REMOVE HERE
    console.log("WORD COUNT: " + wordArr.length);

    // build the acutal dict
    for (var i = 0; i < wordArr.length; i++)
    {
        if (wordObj.hasOwnProperty(wordArr[i]))
        {
            wordObj[wordArr[i]]++;
        }
        else
        {
            wordObj[wordArr[i]] = 1;
        }
    }

    // save dict to file
    json.writeFileJson("data/word_data.json", wordObj);
}

_sortProperties = function (obj)
{
    for (var key in obj)
    {
        if (obj[key] > 25 && key.length > 3)
        {
            console.log(key + " : " + obj[key]);
        }
    }
}

// sort words by use frequency
_sortWordObject = function ()
{
    // read word count object from file
    var wordCountObj = json.readObjFromFile("data/word_data.json");

    _sortProperties(wordCountObj);
}


// builds a message with data from every obj in log with target in it
_findMsgWithTarget = function (target)
{
    // read word count object from file
    var logObjLst = json.readObjFromFile(strings.logMsgPath);
    var msgWithTarget = new Array();
    var msg = "";

    for (var i in logObjLst)
    {
        var sender = logObjLst[i]["sender"];
        var body = logObjLst[i]["body"].toLowerCase();
        var date = logObjLst[i]["datetime"];
        if (sh.contains(body, target))
        {
            msg += "Sender: " + sender + "\ndate:   " + date + "\nbody:   " + body + "\n\n";
        }
    }
    return msg;
}

// sends message to chat showing all messages with target in its body
exports.showMsgWithTarget = function (api, returnID, target)
{
    var msg = _findMsgWithTarget(target);
    if (msg === "")
    {
        msg = "No messages found with word:" + target;
    }
    // send message to return thread at return id
    api.sendMessage(msg, returnID);
}
