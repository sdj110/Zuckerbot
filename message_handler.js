
const login = require("facebook-chat-api");
const ph = require("./postie_handler");
const sh = require("./string_helper");
const ch = require("./command_handler");
const json = require("./json_helper.js")
const strings = require("./Strings.js");
const t = require("./time.js");
const usr = require("./user.js");

// wait time is in seconds. ie WAIT_TIME = 60 is 1 second. WAIT_TIME = 60* 30 is 30 seconds
var WAIT_TIME = 60 * 60 * 2;

// user with the current high score
var leader = undefined;

var titles = ["hey", "right", "rite", "fuckin", "fuck", "thanks", "thank", "thx", "yeah", "yea"];
var botNames = ["zucc", "zuck", "zucker", "zuckbot", "suck"];

// update last time a message was sent when bot starts.
var lastMsgTime = t.updateTimer();

// read highest score from score.json file and set leader
_setLeader = function ()
{
    var currentLeaderObj = new Object();
    var scoreObj = json.readObjFromFile(strings.scorePath);

    var keys = Object.keys(scoreObj);
}

exports.getSenderId = function (e)
{
    return e.senderID;
}

// send msg string to id
exports.sendMessage = function (api, msg, id)
{
    // Send msg to chat id
    api.sendMessage(msg, id);
}

// use API to get senders name
exports.getSenderName = function (api, e, callback)
{
    // Get the senders name
    api.getUserInfo([e.senderID], (err, ret) =>
    {
        // return any error
        if(err) return console.error(err);

        //  check if name can be found
        for(var prop in ret)
        {
            // id match
            if (ret.hasOwnProperty(prop))
            {
                // use callback to get name
                callback(ret[prop].name);
            }
        }
    });
}

// use API to get senders alternateName
_getNicknames = function (api, e, callback)
{
    api.getThreadInfo(e.threadID, (err, info) =>
    {
        // return any error
        if(err) return console.error(err);

        callback(info.nicknames);
    });
}

// Get nicknames of each member in the group
exports.getNicknames = function (api, threadID, callback)
{
    api.getThreadInfo(threadID, (err, info) =>
    {
        // return any error
        if(err) return console.error(err);

        // return object of {id:nickname}
        callback(info.nicknames);
    });
}

// if message is group emoji bot responds with the same emoji
_respondToEmoji = function (api, e)
{
    api.getThreadInfo(e.threadID, (err, info) =>
    {
        // return any error
        if(err) return console.error(err);

        var groupEmoji = info['emoji'];

        // true when e.body is msg emoji
        if (e.body === groupEmoji)
        {
            var msg = _packageEmojiMsg(groupEmoji, "large");
            api.sendMessage(msg, e.threadID);
        }

    });
}

// send read recipt to id thread
markAsRead = function (api, id)
{
    // Show that bot has read the message in chat
    api.markAsRead(id, (err) => { if (err) console.log(err); });
}

// use API to get senders name
_getSenderName = function (api, e, callback)
{
    // Get the senders name
    api.getUserInfo([e.senderID], (err, ret) =>
    {
        // return any error
        if(err) return console.error(err);

        //  check if name can be found
        for(var prop in ret)
        {
            // id match
            if (ret.hasOwnProperty(prop))
            {
                // use callback to get name
                callback(ret[prop].name);
            }
        }
    });
}

// react to command found in event.body
_checkForName = function (api, event)
{
    // remove case sensitivity
    var body = event.body.toLowerCase();

    // check if body contains zucks name
    for (var i = 0; i < titles.length; i++)
    {
        for (var j = 0; j < botNames.length; j++)
        {
            if (sh.contains(body, titles[i] + " " + botNames[j]))
            {
                // read messages from file
                var msgs = json.readObjFromFile(strings.botMsgsPath);

                // get a msg randomly form casual message list
                var rand = Math.floor(Math.random() * msgs["casuals"].length);
                var msg = msgs["casuals"][rand];

                // send message over messenger
                api.sendMessage(msg, event.threadID);
            }
        }
    }
}

// send a gif postie message over chat
sendPackagedPostie = function (api, event, cmd)
{
    return ph.packagePostie(api, event, cmd);
}

// check message for any of bots commands. respond accordingly
checkForCommands = function (api, e)
{
    // split message body into array.
    var cmdArray = sh.splitString(e.body.toLowerCase());

    // Check if list is empty. this would be an error
    if (cmdArray.length == 0)
    {
        return false;
    }

    // check if first element in array is formatted like command
    if (!ch.isCommand(cmdArray[0]))
    {
        // if not command then return
        return false;
    }
    else
    {
        // Message is formatted like a command
        ch.reactToCommand(api, e, cmdArray);
        return true;
    }
}

// increment total and daily score safely in object
_updateTotal = function (obj, key, value=1)
{
    // check if name is already key in object
    if (key in obj)
    {
        // increase score for user
        obj[key] += value;
    }
    else
    {
        // add new user to scoreboard with first score
        obj[key] = value;
    }
}

// calculates the users message score
_calculateScore = function (msg)
{
    // set message standards
    var wordTarget = 18;
    var charTarget = 8;

    // total starts at 1, split msg into array
    var total = 0;
    var lst = msg.split(" ");

    // add word portion to total
    var lstLen = lst.length;
    total += lstLen >= wordTarget ? 2 : 1 * (lst.length / wordTarget);

    // add char portion to total
    for (var i = 0; i < lst.length; i++)
    {
        // check each word for lettes
        var word = lst[i];
        var wordLen = word.length;

        // increase total
        total += wordLen >= charTarget ? 2 : 1 * (wordLen / charTarget);
    }

    // round into integer
    return Math.round(total);
}

// Check if sender has new high score. update title if true
_updateTitle = function (api, e, scoreObj)
{
    console.log("UPDATE TITLE");
    var newTitle = "";

    // get member name with highest score
    var name;
    var max = 0;
    for (var key in scoreObj)
    {
        if (key == "total" || key == "daily_total") continue;
        if (scoreObj[key] > max)
        {
            max = scoreObj[key];
            name = key;
        }
    }

    // get user profile object
    var profile = usr.getProfileByName(name);

    newTitle = profile["nickname"] + "'s " + strings.groupTitle;

    console.log(newTitle);

    api.setTitle("tst title pls work", strings.boysId, (err) =>
    {
        if (err) return console.error(err);
    });

}

// Update scoreboard when someone messages
_updateScore = function (api, e, extraPts)
{
    _getSenderName(api, e, (senderName) =>
    {
        // if extraPts is higher than zero then use that as score.
        if (extraPts > 0)
        {
            // get score object
            var scoreObj = json.readObjFromFile(strings.scorePath);

            // Update users score
            _updateTotal(scoreObj, senderName, extraPts);

            // save updated object back to file
            json.writeFileJson(strings.scorePath, scoreObj, true);

            // update last message time
            lastMsgTime = t.updateTimer();

            // do not calculate word score
            return;
        }

        // read score object from file
        var scoreObj = json.readObjFromFile(strings.scorePath);
        var sec = t.checkTimer(lastMsgTime);
        var timeBonus = 50;
        var score = 0;

        // update total msg number
        _updateTotal(scoreObj, "total");
        _updateTotal(scoreObj, "daily_total");

        // check if its been a while since last message
        if (sec > WAIT_TIME)
        {
            // calculate time length
            var len = Math.floor(sec / 3600);
            var tMsg = len + " hour break.";
            if (len == 0)
            {
                len = Math.floor(sec / 60);
                tMsg = len + " minute break.";
            }

            // Increase score for time bonus, inform chat
            score += timeBonus;
            var bonusMsg = senderName + " Awarded " + timeBonus + " extra points for breaking a " + tMsg;
            api.sendMessage(bonusMsg, e.threadID);
        }

        // calculate score based on msg
        score += _calculateScore(e.body);

        // Update users score
        _updateTotal(scoreObj, senderName, score);

        // save updated object back to file
        json.writeFileJson(strings.scorePath, scoreObj, true);

        // update last message time
        lastMsgTime = t.updateTimer();

    });
}

// update user profile
_updateProfile = function (api, e)
{
    // check if we need to build new profile
    if (usr.hasProfile(e.senderID))
    {
        // update user profile information
        usr.updateMsgInfo(api, e);
    }
    else
    {
        usr.updateProfile(api, e);
    }
}

// handle all message events in bot.js
exports.handleMessageEvent = function (api, e)
{
    // certain msgs will get extra points (ie. using bot to send postie gifs).
    var photoBonus = 25;
    var postieBonus = 10;
    var extraPts = 0;

    // Show that bot has read the message in chat
    markAsRead(api, e.threadID);

    // check for bots name in a body msg
    _checkForName(api, e);

    // Check for someone sending threadEmoji in chat
    _respondToEmoji(api, e);

    // send postie. Posties are worth more points
    if (sendPackagedPostie(api, e, e.body.toLowerCase()))
    {
        extraPts += postieBonus;
    }

    // check if message was a photo attachment
    if (e.attachments[0] != undefined)
    {
        if (e.attachments[0]["type"] === 'photo')
        {
            // save photo details to file
            var arr = json.readObjFromFile("data/photo_data.json");
            // new object to add
            var obj = {
                "name" : e.attachments[0]["name"],
                "url" : e.attachments[0]["url"],
                "previewUrl" : e.attachments[0]["previewUrl"]
            };
            // update array and save to file
            arr.push(obj);
            json.writeFileJson("data/photo_data.json", arr);

            // add extra points for photo
            extraPts += photoBonus;
        }
    }

    // check for commands. Only update score if msg was not command
    if (!checkForCommands(api, e))
    {
        // update scoreboard with new msg
        _updateScore(api, e, extraPts);
    }

    // update information in sender profile
    _updateProfile(api, e);
}
