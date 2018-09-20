
const json = require("./json_helper.js")
const strings = require("./Strings.js");
const t = require("./time.js")

var _profileObj = new Object();
exports.profileObj = _profileObj;

// true when sender already has profile
exports.hasProfile = function (senderID)
{
    // read from file
    var obj = json.readObjFromFile(strings.profilesPath);
    return obj.hasOwnProperty(senderID);
}

exports.updateLastMsgTime = function (e, newTime)
{
    // read from file
    var obj = json.readObjFromFile(strings.profilesPath);

    var profile = obj[e.senderID];
    profile["lastMsgTime"] = newTime;
    obj[e.senderID] = profile;

    console.log("HERE: " + profile["lastMsgTime"]);

    // write new object to file
    json.writeFileJson(strings.profilesPath, obj);
}

// bot sends msg formatted to look like user profile
exports.showSenderProfile = function (api, e, pm=false)
{
    // read profile from file
    var obj = json.readObjFromFile(strings.profilesPath);
    if (obj.hasOwnProperty(e.senderID))
    {
        var profile = json.readObjFromFile(strings.profilesPath)[e.senderID];

        // build message
        var msg = "* * * " + profile["firstName"] + "'s Profile:" + " * * *\n";
        msg += "Name: " + profile["name"] + "\n";
        msg += "Nickname: " + profile["nickname"] + "\n";
        msg += "Score: " + profile["score"] + "\n";
        msg += "Last Update: " + profile["lastUpdateTime"] + "\n";

        // send as private msg
        if (pm)
        {
            api.sendMessage(msg, e.senderID);
            return;
        }
        // send message to tread
        api.sendMessage(msg, e.threadID);
        return;
    }
    // user does not have profile yet
    var failMsg = "User profile not found. Building new profile now...";
    if (pm)
    {
        api.sendMessage(failMsg, e.senderID);
        return;
    }
    api.sendMessage(failMsg, e.threadID)
}

// get user profile by name
exports.getProfileByName = function (name)
{
    // load profile file
    var profiles = json.readObjFromFile(strings.profilesPath);

    // loop through each profile object
    for (var key in profiles)
    {
        // a users profile object
        var userObj = profiles[key];

        // check for matching name
        if (userObj["name"] === name)
        {
            return userObj;
        }
    }
    // no user with that name found
    return null;
}

// get the users profile by id
exports.getProfileByID = function (id)
{
    // load profiles
    var profiles = json.readObjFromFile(strings.profilesPath);

    console.log(profiles[id]);

    // return object with key being id
    return profiles[id];
}

// update info that changes with each message
exports.updateMsgInfo = function (api, e)
{
    // use api to get needed user information
    api.getUserInfo([e.senderID], (err, obj) =>
    {
        // check for error
        if(err) return console.error(err);

        // get profile with senderID from file
        var inObj = json.readObjFromFile(strings.profilesPath)[e.senderID];

        // create blank object that will be written to file
        var outObj = inObj;

        // Loop through keys and build profile
        for (var key in inObj)
        {
            // check for name to update score
            if (key == "name")
            {
                // get score from file
                var score = json.readObjFromFile(strings.scorePath)[inObj[key]];
            }
        }

        // update score
        outObj["score"] = score;

        // update epoch time
        outObj["epochTime"] = t.getEpochTime();

        // update last message time if this is a reaction to a message
        outObj["lastMsgTime"] = t.currentTime();

        // read profiles from path
        var profiles = json.readObjFromFile(strings.profilesPath);

        // overwrite object and save to file
        profiles[e.senderID] = outObj;
        json.writeFileJson(strings.profilesPath, profiles);
    });
}

// Update the senders profile obj
exports.updateProfile = function (api, e)
{
    // use api to get needed user information
    api.getUserInfo([e.senderID], (err, obj) =>
    {
        // check for error
        if(err) return console.error(err);

        // get sender object
        var inObj = obj[e.senderID];

        // create blank object that will be written to file
        var outObj = new Object();

        // Update user ID
        if (!inObj.hasOwnProperty("id"))
            outObj["id"] = e.senderID;

        // get nickname from file
        var nickname = json.readObjFromFile(strings.nicknamePath)[e.senderID];
        outObj["nickname"] = nickname;

        // Loop through keys and build profile
        for (var key in inObj)
        {
            // Ignore certain properties
            if (key == "isFriend" || key == "type" || key == "gender" ||
                key == "thumbSrc" || key == "vanity")
                continue;

            // check for name to update score
            if (key == "name")
            {
                // get score from file
                var score = json.readObjFromFile(strings.scorePath)[inObj[key]];
            }

            // build profile object
            outObj[key] = inObj[key];
        }

        // update score
        outObj["score"] = score;

        // update epoch time
        outObj["epochTime"] = t.getEpochTime();

        // update last message time if this is a reaction to a message
        outObj["lastMsgTime"] = t.currentTime();

        // need new update time
        outObj["lastUpdateTime"] = t.dateTime();

        // load profiles object
        var profiles = json.readObjFromFile(strings.profilesPath);

        // overwrite object and save to file
        profiles[e.senderID] = outObj
        json.writeFileJson(strings.profilesPath, profiles);
    });
}
