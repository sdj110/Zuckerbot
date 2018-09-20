
const login = require("facebook-chat-api");
const strings = require("./Strings.js");
const json = require("./json_helper.js")
const msgHandler = require("./message_handler.js");
const t = require("./time.js");
const usr = require("./user.js")

// ~~~ TESTING KIT ~~~
var updateNicknames = false;
var testing = false;
if (testing)
{
    console.log("TESTING IS ON");

    // Put testing code here:

    return;
}

// inform group when bot starts
_sendStartingMessage = function (api)
{
    //api.sendMessage("Beta bot has started...", strings.boysId);
    api.sendMessage("Beta bot has started...", strings.mySenderId);
}

// send the current time in a msg to receiverID
var send_current_time = function (api, receiverID, msg = "")
{
    api.sendMessage(msg + t.currentTime(true), receiverID);
}

// set the start time and save to obj in file
_setStartTime = function ()
{
    // read obj from file
    var obj = json.readObjFromFile(strings.botInfoPath);

    // set the starting time
    obj["startDate"] = t.dateTime();

    // save object to file
    json.writeFileJson(strings.botInfoPath, obj);
}

// Log details about every messages
log_messages = function (api, event)
{
    // Get name of person who sent message
    msgHandler.getSenderName(api, event, (senderName) =>
    {
        // package obj
        obj = {
            "sender":senderName,
            "datetime":t.dateTime(),
            "body":event.body
        }

        // add new object to message log list
        json.addToList(strings.logMsgPath, obj);
    });
}

// Set the current leader
_setLeader = function (api)
{
    // read score obj and leader obj from file form file
    var scoreObj = json.readObjFromFile(strings.scorePath);

    // get highest property
    var name;
    var max = 0;
    for (var k in scoreObj)
    {
        // skip these keys
        if (k === "total" || k === "daily_total") continue;

        // get the max value and the name of that value
        if (scoreObj[k] > max)
        {
            name = k;
            max = scoreObj[k]
        }
    }

    var userProfile = usr.getProfileByName(name);

    // build leader obj
    var leaderObj =
    {
        "id" : userProfile["id"],
        "name" : name,
        "nickname" : userProfile["nickname"],
        "score" : max
    };

    // if leaders name isn't already set then set it
    if (userProfile["nickname"] != strings.leaderName)
    {
        var newName = strings.leaderName + " " + userProfile["nickname"];
        // nickname, threadID, userID
        console.log("ID: " + userProfile["id"]);
        api.changeNickname(newName, strings.boysId, userProfile["id"], (err) =>
        {
            if(err) return console.error(err);
        });
    }

    // save leader to file
    json.writeFileJson(strings.leaderPath, leaderObj);
}

// builds user nickname json file on startup.
_buildNicknameFile = function (api)
{
    msgHandler.getNicknames (api, strings.boysId, (nicknameObj) =>
    {
        // write nickname obj to file
        json.writeFileJson(strings.nicknamePath, nicknameObj);
        console.log("UPDATED NICKNAMES");
    });
}

// Handle message event
handleEventMessage = function (api, event)
{
    // log message and details to file
    log_messages(api, event);

    // TESTER CODE FOR THE BOYS. WILL BE REMOVED
    if (event.body.toLowerCase() === '/msgtotal')
    {
        api.getThreadInfo(event.threadID, (err, info) =>
        {
            var msg = '' + info['messageCount'];
            console.log(msg);
            api.sendMessage("Total Msgs: " + msg,event.threadID);
        });
    }

    // Control all message events
    msgHandler.handleMessageEvent(api, event);
}

// Start Here::
login(strings.cred, (err, api) => {
//login(json.readAppstate(), (err, api) => {
    // Return error if login fail
    if (err) return console.error(err);

    // save app data to file for future login
    json.writeFileJson("appstate.json", api.getAppState());

    // TODO: find better way. cannot update nicknames every time because
    // current leaders nicknames will be rewritten as 'champ'
    if (updateNicknames) _buildNicknameFile(api);

    // Set API parameters
    api.setOptions({
        logLevel: "error",
        selfListen: false,
        listenEvents: true
    });

    // Send Starting message
    _sendStartingMessage(api);

    // set starttime and save to file
    _setStartTime();

    var stopListening = api.listen((err, event) =>
    {
        // Check for any error
        if(err) return console.error(err);

        // bots off switch
        if(event.body === '/zzz' && event.senderID == strings.mySenderId)
        {
            api.sendMessage("Shutting down...", strings.mySenderId);
            console.log("Stop Listening: " + stopListening()); // debugging
            return stopListening();
        }

        // Handle event types
        switch(event.type)
        {
            // Respond to message type event type
            case "message":
                handleEventMessage(api, event);
                break;

            // from, fromMobile, isTyping, threadID, type
            case "typ":
                console.log("typ");
                break;

            // reader, threadID, time, type
            case "read_receipt":
                console.log("read_receipt");
                break;

            // threadID, time, type
            case "read":
                console.log("read");
                break;

            // messageID, offlineThreadingID, reaction, senderID,
            //  threadID, timestamp, type, userID
            case "message_reaction":
                break;

            default:
                console.log("DEFAULT TYPE: " + event.type);
                break;
        }
    });
});
