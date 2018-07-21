/*
 *  Module for facebook-chat-api to help simplifiy functionality
 *
 * TODO: way to remove chip from list via fb
 *       Song generator
 *       Camel train
 *       Randomize chip messages
 *       Watch later list/ reminder list
 *       COOL IDEA: file server via fb chat. use console commands to navigate, request/dl files via fb
 *       FIX: make sure you have to say /chips at start of msgs
 *       ADD whats new to show new in update = /new show version number and time

*/
const fs = require("fs");
const login = require("facebook-chat-api");
const stringHelper = require("./StringHelper");
const jsonHelper = require("./JSONHelper")

var cred = {email: "7096328069", password: "B3tti148"};
exports.cred = cred;

var verNumber = "v 1.1.2 (The Titty Patch)\n";
var date = new Date().getTime();
var startTime = (new Date()).toUTCString();
var lastUpdateTime = (new Date()).toUTCString();

var BOT_ID = 100027355535144;
var MY_SENDER_ID = 616280252;
var BOYS_THREAD_ID = 253740418046451;

var CHIPS_FILE = 'data/chips.json';
var BEER_FILE = 'data/beer.json';
var SCORE_FILE = 'data/score.json';
var CHAT_FILE = 'data/chat_data.json';
var POSTIE_PATH = '/data/posties/';

var groupID = 0;
var msgTotal = 0;

var boysIDs = [
    516653887,527030270,547150556,616280252,623250303,100002398517168,100009372809521
];

var updateMsgs =
[
    "**** WHAT ARE YOU GUYS HAVING FOR DINNER? BRISKET AND RIBS I HOPE ****",
    "**** MAYBE THROW SOME SWEET BABY RAY'S ON THE RIBS AND TAKE IT FROM THERE ****",
    "**** I WANT MY BABY BACK BABY BACK BABY BACK RIBS ****",
    "**** WE JUST APPLIED THE SWEET BABY RAYS ****"
]

var randMsgs =
[
    "MEAT LIKE A BRISKET!",
    "DO YOU SMOKE MEAT???",
    "SMOKE SALMON, YOU'LL LOVE IT",
    "i wanna try my brisket...",
    "Hopefully for canadian thanksgiving you get to eat a lot of BRISKET and RIBS!",
    "Everyone likes ribs!",
    "THATS WHAT I'M TALKING ABOUT!",
    "I am smoking a brisket and some ribs.",
    "Maybe throw some Sweet Baby Ray's on the ribs and take it from there",
    "Brisket on the big guy!!"
]

var triggeredList =
[
    '/data/gifs/triggered_0.gif',
    '/data/gifs/triggered_1.gif',
    '/data/gifs/triggered_2.gif',
    '/data/gifs/triggered_3.gif',
    '/data/gifs/triggered_4.gif'
]

var roastList =
[
    '/data/gifs/roast_0.gif',
    '/data/gifs/roast_1.gif',
    '/data/gifs/roast_2.gif',
    '/data/gifs/roast_3.gif',
    '/data/gifs/roast_4.gif'
]

var wowList =
[
    '/data/gifs/wow_0.gif',
    '/data/gifs/wow_1.gif',
    '/data/gifs/wow_2.gif',
]

var niceList =
[
    '/data/gifs/nice_0.gif',
    '/data/gifs/nice_1.gif',
    '/data/gifs/nice_2.gif',
    '/data/gifs/nice_3.gif'
]

var gratsList =
[
    '/data/gifs/grats_0.gif',
    '/data/gifs/grats_1.gif',
    '/data/gifs/grats_2.gif'
]

// read from files
var memberDict = jsonHelper.readObjFromFile(SCORE_FILE);
var chatDict = jsonHelper.readObjFromFile(CHAT_FILE);

// Generate random msg from array
randomMsg = function (array)
{
    return array[ Math.floor(Math.random() * array.length) ];
}

// Initialize bot
exports.initialize = function (id)
{
    // Set id that msgs will be sent too
    groupID = id;

    // set start time save to new start time
    chatDict["start_time"] = new Date().getTime();
    jsonHelper.saveObjToFile(CHAT_FILE, chatDict);
}

// Get name of user based on id
increaseMemberMsgScore = function(api, senderID, msg)
{
    api.getUserInfo([senderID], (err, ret) =>
    {
        // Error check
        if(err) return console.error(err);

        for(var prop in ret)
        {
            if(ret.hasOwnProperty(prop))
            {
                var name = ret[prop].name;
                var obj = jsonHelper.readObjFromFile(SCORE_FILE);
                var points = stringHelper.getMsgPoints(msg);
                obj[name] += points;
                obj["total_msgs"]++;

                if (points >= 3)
                {
                    // decrease everyone else's score by 1
                    for (var i = 0; i < Object.keys(obj).length; i++)
                    {
                        if (Object.keys(obj)[i] != name && Object.keys(obj)[i] != "total_msgs")
                        {
                            if (Object.values(obj)[i] >= 1)
                            {
                                var currentScore = Object.values(obj)[i] - 1
                                Object.values(obj)[i] = currentScore;
                            }
                        }
                    }
                }
                jsonHelper.saveObjToFile(SCORE_FILE, obj);
            }
        }
    });
}

// Send msg that shows how many msgs each member has sent
showMemberScore = function(api)
{
    var obj = jsonHelper.readObjFromFile(SCORE_FILE);
    var msg = "**** SCORE BOARD: ****\n";
    for(var key in obj)
    {
        var value = obj[key];
        msg += key + ": " + value + "\n";
    }
    api.sendMessage(msg, groupID);
}

// Update msgTotal when msg from correct threadID is sent
exports.updateMessageCounter = function(api, e)
{
    if (e.threadID == groupID && e.senderID != BOT_ID)
    {
        msgTotal++;
        increaseMemberMsgScore(api, e.senderID, e.body);
    }
}

// Load from file the current total number of messages
groupTotalMsg = function()
{
    var data = jsonHelper.readObjFromFile(SCORE_FILE);
    return data["total_msgs"];
}

// Use with setInterval to update chat every x hours
exports.updateChat = function(api)
{
    var date = new Date().getTime();
    lastUpdateTime = (new Date()).toUTCString();

    api.sendMessage("UPDATE TIME: \n\n\n\n" + randomMsg(updateMsgs) + "\n\n\n \
     NUMBER OF MSG SENT SINCE LAST UPDATE: " + msgTotal, groupID);
    msgTotal = 0;

     var total = groupTotalMsg();
     api.sendMessage("Group Message Total: " + total);

     showMemberScore(api);
}

// REMOVE ME TEST ONLY
testUpdate = function(api)
{
    var date = new Date().getTime();
    lastUpdateTime = (new Date()).toUTCString();

    api.sendMessage("UPDATE TIME: \n\n\n\n" + randomMsg(updateMsgs) + "\n\n\n \
     NUMBER OF MSG SENT SINCE LAST UPDATE: " + msgTotal, groupID);

     var total = groupTotalMsg();
     api.sendMessage("Group Message Total: " + total, groupID);

     showMemberScore(api);
}

// Look for secondary command in messages
checkForSecondaryCommand = function(api, filename, lst)
{
    // remove from list
    if (lst[1] === '-r')
    {
        // Grab the arguments from list as string
        var name = stringHelper.reverseSplitAtSpace(lst, 2);
        var check = jsonHelper.removeFromListInFile(filename, name);

        // successful removal
        api.sendMessage(name + " removed from list.", groupID);
        return true;
    }
    else if (lst[1] === '-rl')
    {
        // Remove last element from list
        jsonHelper.removeLastFromFileList(filename)
        api.sendMessage("Last element removed from list.", groupID);
        return true;
    }
    return false;
}

// Check for commands that require an argument
checkForDBCommands = function(api, e)
{
    // Make body lowercase for easier checks
    var body = e.body.toLowerCase();

    // Split string at space into list
    var lst = stringHelper.splitAtSpace(body);

    // check if msg contains any arguments
    if (lst.length == 1) return;

    // Check for two word commands
    if (lst[0] === "/chips" || lst[0] === "/chip") // CHECK FOR CHIPS
    {
        // Check for secondary command
        if (checkForSecondaryCommand(api, CHIPS_FILE, lst))
        {
            return;
        }

        // Grab the arguments from list as string
        var name = stringHelper.reverseSplitAtSpace(lst, 1);

        // Check if name already in list, if not add to list
        if (jsonHelper.addToListInFile(CHIPS_FILE, name.toLowerCase()))
        {
            // Send confirmation msg
            api.sendMessage(name + " added to chip list.", groupID);
        }
        else
        {
            api.sendMessage(name + " already in chip list...", groupID);
        }
    }
    else if (lst[0] === "/beer" || lst[0] === "/beers") // CHECK FOR BEER
    {
        // Check for secondary command
        if (checkForSecondaryCommand(api, BEER_FILE, lst))
        {
            return;
        }

        // Grab the arguments from list as string
        var name = stringHelper.reverseSplitAtSpace(lst, 1);

        // Check if name already in list, if not add to list
        if (jsonHelper.addToListInFile(BEER_FILE, name.toLowerCase()))
        {
            // Send confirmation msg
            api.sendMessage(name + " added to beer list.", groupID);
        }
        else
        {
            api.sendMessage(name + " already in beer list...", groupID);
        }
    }
}

// package a gif to be sent to group
packageGifMessage = function(path)
{
    var msg =
    {
        attachment: fs.createReadStream(__dirname + path)
    }
    return msg;
}

// Send @'s to everyone in the chat
alertChannel = function(api, e)
{
    var msg =
    {
        body: 'fel1as!',
        mentions:
        [
            {
                tag: 'f',
                id: boysIDs[0]
            },
            {
                tag: 'e',
                id: boysIDs[1]
            },
            {
                tag: 'l',
                id: boysIDs[2]
            },
            {
                tag: '1',
                id: boysIDs[3]
            },
            {
                tag: 'a',
                id: boysIDs[4]
            },
            {
                tag: 's',
                id: boysIDs[5]
            },
            {
                tag: '!',
                id: boysIDs[6]
            }
        ]
    }
    return msg;
}

// return path to possible postie link
packagePostiePath = function(cmd)
{
    var tst = stringHelper.getPostieCommand(cmd);
    if (tst !== false)
    {
        var path = POSTIE_PATH + tst + '.gif';
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
          return msg;
        }
        catch (e)
        {
            var msg =
            {
                body: "No luck with command: " + cmd +  ". Tell scott to fix this."
            }
            console.log("Not a valid command: " + cmd);
            return msg;
        }
    }
    return false;
}

// Use this to check for bot commands in the chat and respond accordingly
exports.checkForCommands = function (api, e)
{
    // Ignore messages from bot
    if (e.senderID != BOT_ID)
    {
        // make msg lowercase for easy checking
        var body = e.body.toLowerCase();

        var msg = packagePostiePath(body);
        if (msg !== false)
        {
            api.sendMessage(msg, e.threadID);
        }

        // Check for commands where we need to store the second Word
        checkForDBCommands(api, e);

        switch (body)
        {
            // force an update for testing only
            case "/test_update69":
                getMemberNames(api, BOYS_THREAD_ID);
                break;

            // Display bots main commands in chat
            case "/zbot":
            case "/cmd":
            case "/commands":
                api.sendMessage("*** ZuckerBot Action Control ***\n\n\n \
                -- /total - Show total number of msg since last update.\n\
                -- /ship - Something for your boy to bounce on.\n\
                -- /score - Display scoreboard.\n\
                -- /chips - Get a chip recommendation.\n\
                -- /beer - Get a beer recommendation.\n\
                -- /gifs - Show list of gifs commands.", e.threadID);
                break;

            case "/ver":
            case "/version":
                api.sendMessage("Version: " + verNumber + " Started at: " + startTime, e.threadID);
                break;

            case "/gifs":
            case "/posties":
            case "/gif":
                api.sendMessage("GIF LIST: baked, bewbs, biggayal, boobies, boobs, creep, deal, ew, fags, fbi, fiestacat, gay, gayfish, gotya, gross, haha, hammer, hiralph, imsorry, join, lenny, lightup, lmao, lol, missjoke, morning, mrsparkle, nerd, oops, rake, rofl, smooth, snoop, sorry, sry, suave, thuglife, tits, titties, tripping, trump, umad, wat, woo, woahbro, yoda, yoohoo", e.threadID);
                break;

            case "/chips":
            case "/chip":
            case "what chips should i get?":
            case "what chips should i get":
            case "what kind chips should i get?":
            case "what kind chips should i get":
                var lst = jsonHelper.readObjFromFile(CHIPS_FILE);
                api.sendMessage("Get some " + randomMsg(lst) + "!", e.threadID);
                break;

            case "/beers":
            case "/beer":
                var lst = jsonHelper.readObjFromFile(BEER_FILE);
                api.sendMessage("Friggin Slam some " + randomMsg(lst) + "!", e.threadID);
                break;

            case "/total":
            case "/msgs":
            case "/sent":
            case "/#":
                api.sendMessage("Last Updated at " + lastUpdateTime, e.threadID);
                api.sendMessage("Number of messages sent since last update: " + msgTotal, e.threadID);
                showMemberScore(api);
                break;

            case "/score":
            case "/scoreboard":
            case "/score board":
                showMemberScore(api);
                break;

            // GIFS START HERE
            case "/triggered":
            case "/trigered":
            case "/trigger":
                var msg = packageGifMessage(randomMsg(triggeredList));
                api.sendMessage(msg, e.threadID);
                break;

            case "/roasted":
            case "/roast":
            case "/slam":
            case "/slammed":
            case "/bam":
            case "/burn":
                var msg = packageGifMessage(randomMsg(roastList));
                api.sendMessage(msg, e.threadID);
                break;

            case "/wow":
            case "/woah":
            case "/shock":
                var msg = packageGifMessage(randomMsg(wowList));
                api.sendMessage(msg, e.threadID);
                break;

            case "/nice...":
            case "/nice":
                var msg = packageGifMessage(randomMsg(niceList));
                api.sendMessage(msg, e.threadID);
                break;

            case "/grats":
            case "/congrats":
            case "/congratulations":
                var msg = packageGifMessage(randomMsg(gratsList));
                api.sendMessage(msg, e.threadID);
                break;

            // GIFS END HERE

            // Channel calls
            case "@here":
            case "@channel":
            case "@boys":
            case "@bois":
            case "/here":
            case "/channel":
            case "/boys":
            case "/bois":
                var msg = alertChannel(api, e);
                api.sendMessage(msg, e.threadID);
                break;

            case "/ship":
            case "rocketship":
            case "rocketship!":
            case "my boys dick":
            case "my boys dick!":
            case "my boy's dick":
            case "my boy's dick!":
            case "big money":
            case "big money!":
            case "bounce on my boy's dick":
            case "bounce on my boys dick":
            case "bounce on it":
            case "bounce on my boy's dick!":
            case "bounce on my boys dick!":
            case "bounce on it!":
                api.sendMessage("( _ ) _ )=======D ~ ~ ~", e.threadID);
                break;

            case "smokin these meats":
            case "smokin these meats!":
            case "smokin those meats":
            case "smokin those meats!":
            case "smoking them meats":
            case "smoking them meats!":
            case "smokin some meats":
            case "smokin some meats!":
            case "smoking some meats":
            case "smoking some meats!":
            case "smoking these meats":
            case "smoking these meats!":
                api.sendMessage("SWEET BABY RAY'S!!!", e.threadID);
                break;

            case "right zucc?":
            case "right zucc":
            case "right zuck?":
            case "right zuck":
            case "right zuckerbot?":
            case "right zuckerbot":
                api.sendMessage(randomMsg(randMsgs), e.threadID);
                break;

            // Respect calls
            case "f":
                api.sendMessage("F", e.threadID);
                break;

            case "rip":
                api.sendMessage("RIP", e.threadID);
                break;

            case "666":
                api.sendMessage("* THE NUMBER OF THE BEASTTTT!!! *", e.threadID);
                break;

            default:
                break;
        }
    }
}

// Send message to chat with id = groupID
exports.sendMessage = function (api, msg)
{
    api.sendMessage(msg, groupID);
}

// Bot sends msg to facebook user or group with this id
exports.sendMessageToID = function (api, id, msg)
{
    api.sendMessage(msg, id);
}

// STASH

/*
// return array of ids for each member in group
getMemberNames = function (api, groupID)
{
    api.getThreadInfo(groupID, (err, info) =>
    {
        if(err) return console.error(err);

        var memberIDs = info["participantIDs"];

        for (var i = 0; i < 7; i++)
        {
            getUserNames(api, memberIDs[i]);
        }

    });
}
*/
