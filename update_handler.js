
const json = require("./json_helper.js")
const strings = require("./Strings.js");

// Reset score object and write to data/score.json
_resetScore = function ()
{
    // read score object from file
    var scoreObj = json.readObjFromFile(strings.scorePath);

    // build new object with reset score
    var newObj =
    {
    	"total": scoreObj["total"],
    	"daily_total": 0
    }

    // save reset score object to file
    json.writeFileJson(strings.scorePath, newObj);

    return scoreObj;
}

exports.resetScore = function ()
{
    return _resetScore();
}
