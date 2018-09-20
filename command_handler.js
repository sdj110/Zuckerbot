
const ph = require("./postie_handler");
const json = require("./json_helper.js")
const strings = require("./Strings.js");
const usr = require("./user.js");
const t = require("./time.js");
const mc = require("./message_counter.js");
const uh = require("./update_handler.js");

// COMMAND RESPONSES START   **********************

_helpCommand = function (api, e)
{
    // the message that will be sent
    //var msg = "LIST OF COMMANDS: \n/gifs: show list of gifs.\n";
    var msg = json.readObjFromFile("data/command_help.json");

    // send msg
    api.sendMessage(msg, e.threadID);
}

_searchCommand = function (api, e, cmd)
{
    // check if its a pm. send to sender id
    if (cmd[1] == "-pm")
    {
        var target = " " + cmd[2] + " ";
        mc.showMsgWithTarget(api, e.senderID, target);
        return;
    }

    // send message to thread id
    var target = " " + cmd[1] + " ";
    mc.showMsgWithTarget(api, e.threadID, target);
}

_gifCommand = function (api, e, cmd)
{
    // get list of raw string names
    var rawLst = json.readFileNamesDir(strings.postiePath);
    if (rawLst == undefined)
    {
        return undefined;
    }

    // parse strings to look like postie commands
    var cmdLst = ph.getListOfNames(rawLst);
    var msg = "LIST OF GIF COMMANDS: ";
    for (var i = 0; i < cmdLst.length; i++)
    {
        // Add punctuation to msg.
        if (i == cmdLst.length - 1)
        {
            msg += cmdLst[i];
            continue;
        }
        msg += cmdLst[i] + "\n";
    }

    // Check for secondary command
    if (cmd[1] === "-pm")
    {
        // send message over chat
        api.sendMessage(msg, e.senderID);
        return;
    }

    // send message over chat
    api.sendMessage(msg, e.threadID);
}

_scoreCommand = function (api, e)
{
    // read score object from file
    var obj = json.readObjFromFile(strings.scorePath);

    // format score into string
    var msg = "**** SCOREBOARD ****\n";

    // get keys and values from obj
    var keys = Object.keys(obj);
    var values = Object.values(obj);

    // add total and daily score to msg
    msg += "** Total: " + obj['total'] + '\n';
    msg += "** Daily Total: " + obj['daily_total'] + '\n';

    // Sort values from highest to lowest
    values = values.sort((a, b) => b - a);

    // Add sorted user scores to msg
    for (i in values)
    {
        for (j in keys)
        {
            if (values[i] == obj[keys[j]])
            {
                if (keys[j] !== "total" && keys[j] !== "daily_total")
                {
                    msg += "** " + keys[j] + " " + values[i] + "\n";
                }
            }
        }
    }

    // finish border
    msg += "***********************";

    // send string to thread
    api.sendMessage(msg, e.threadID);
}

_profileCommand = function (api, e, cmd)
{
    // check if there is a secondary command
    if (cmd.length == 1)
    {
        // format profile object and send as msg
        usr.showSenderProfile(api, e);
    }

    // send profile as pm
    if (cmd[1] === "-pm" || cmd[1] === "-p")
    {
        // format profile object and send as msg
        usr.showSenderProfile(api, e, true);
    }

    // update profile command
    if (cmd[1] === "-update" || cmd[1] === "-u")
    {
        console.log("Updating...");
        usr.updateProfile(api, e);
    }
}

_updateCommand = function (api, e)
{
    console.log("Updating...");
    usr.updateProfile(api, e);
}

_beerCommand = function (api, e)
{
    // read list of beers from file
    var beers = json.readObjFromFile("data/beer.json");
    var beer = beers[Math.floor(Math.random() * beers.length)];

    // Send Message
    api.sendMessage("Slam some " + beer, e.threadID);
}

_emojiCommand = function (api, e, cmd)
{
    api.getThreadInfo(e.threadID, (err, info) =>
    {
        // return any error
        if(err) return console.error(err);

        // array holds each emoji size
        var sizes = ["small", "medium", "large"];

        // get emoji unicode
        var emojiUni = info['emoji'];

        // check for secondary commands
        if (cmd.length > 1)
        {
            // send the train!
            if (cmd[1] === "train")
            {
                // create message
                var msg = _packageEmojiMsg(emojiUni, sizes[2]);

                for (var i = 0; i < 3; i++)
                {
                    api.sendMessage(msg, e.threadID);
                }
                return;
            }

            // check for small
            if (cmd[1] === "-s")
            {
                // build msg
                // create message
                var msg = _packageEmojiMsg(emojiUni, sizes[0]);
                api.sendMessage(msg, e.threadID);
                return;
            }

            // check for medium
            if (cmd[1] === "-m")
            {
                // build msg
                // create message
                var msg = _packageEmojiMsg(emojiUni, sizes[1]);
                api.sendMessage(msg, e.threadID);
                return;
            }

            // random size camel
            if (cmd[1] === "-r")
            {
                // get random size
                var size = sizes[Math.floor(Math.random() * sizes.length)];

                // send msg
                var msg = _packageEmojiMsg(emojiUni, size);
                api.sendMessage(msg, e.threadID);
                return;
            }
            return;
        }

        //build standard msg
        var msg = _packageEmojiMsg(emojiUni, sizes[2]);
        // send once
        api.sendMessage(msg, e.threadID);
    });
}

_versionCommand = function (api, e, cmd)
{
    // read version information from file
    var obj = json.readObjFromFile(strings.botInfoPath);

    // build message
    var msg = "*** Bot Information ***\n";
    msg += "Start date: " + obj["startDate"];
    msg += "\nVersion: " + obj["version"];

    // send formatted msg about bot info
    api.sendMessage(msg, e.threadID);
}

// build sized emoji message
_packageEmojiMsg = function (uni, size)
{
    //build standard msg
    var msg = {
        'emoji' : uni,
        'emojiSize' : size
    };
    return msg;
}

// public version of _packageEmojiMsg
exports.packageEmojiMsg = function (uni, size)
{
    return _packageEmojiMsg(uni, size);
}

// command to manually reset score
_resetScoreCommand = function (api, e, cmd)
{
    // only bot admin gets this command
    if (e.senderID == strings.mySenderId)
    {
        // reset score object and save to file
        uh.resetScore();
    }
    else
    {
        // inform sender that the command is for bot admin only
        api.sendMessage("Only Bot admin can use this command.", e.threadID);
    }
}

// COMMANDS END HERE          **********************

// returns true of string is formatted list command
_isCommand = function (str)
{
    // commands are formatted like '/help'
    if (str[0] == '/')
    {
        return true;
    }
    return false;
}

// public version of _isCommand
exports.isCommand = function (str)
{
    return _isCommand(str);
}

// check for each command
exports.reactToCommand = function (api, e, cmd)
{
    switch (cmd[0])
    {
        // this command shows list of bots featurs
        case "/help":
        case "/zbot":
        case "/cmds":
        case "/commands":
            _helpCommand(api, e);
            break;

        // show some details about the version of bot
        case "/version":
        case "/ver":
            _versionCommand(api, e, cmd);
            break;

        // this command shows list of gifs zuck understands
        case "/gifs":
        case "/posties":
        case "/gif":
            _gifCommand(api, e, cmd);
            break;

        // show current score
        case "/score":
        case "/#":
        case "/board":
        case "/scoreboard":
            _scoreCommand(api, e);
            break;

        case "/reset score":
        case "/reset":
            _resetScoreCommand(api, e, cmd);
            break;

        case "/search":
        case "/vault":
            _searchCommand(api, e, cmd);
            break;

        // update command section
        case "/profile":
        case "/p":
        case "/prof":
            _profileCommand(api, e, cmd);
            break;

        // secondary command for updating profile
        case "/update":
            _updateCommand(api, e);
            break;

        // Choose a beer from random
        case "/beer":
        case "/beers":
            _beerCommand(api, e);
            break;

        // send the groups emoji
        case "/camel":
        case "/emoji":
            _emojiCommand(api, e, cmd);
            break;

        // send a rocketship!!
        case "/ship":
        case "/rocketship":
            api.sendMessage("( _) _)::::::::::::D ~ ~ ~ ~~", e.threadID);
            break;

        default:
            break;
    }
}
