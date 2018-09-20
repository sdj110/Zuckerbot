
const fs = require("fs");

// Returns true if filename file exists
// http://networkimprov.github.io/node-doc-api/fs.html
_pathExists = function (name)
{
    // build full path
    var path = __dirname + '/' + name;
    // Check if file exists
    try
    {
        stats = fs.statSync(path);
        return true;
    }
    catch (e)
    {
        console.error("json_helper::pathExists(): " + e);
        return false;
    }
}

// read file at filename. undefined if file does not exist
_readObjFromFile = function (filename)
{
    // Check if file exists before reading
    if (_pathExists(filename))
    {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
    }
    // file could not be read
    return undefined;
}

// public version of _readObjFromFile
exports.readObjFromFile = function (filename)
{
    return _readObjFromFile(filename);
}

// format data as json file and write to filename.
_writeFileJson = function (filename, data, pretty=true)
{
    // check if pretty format flag on
    if (pretty)
    {
        // format Object as json with pretty print on
        fs.writeFileSync(filename, JSON.stringify(data, null, '\t'));
    }
    else
    {
        // format Object as json
        fs.writeFileSync(filename, JSON.stringify(data));
    }
}

// public version of writeFileJson
exports.writeFileJson = function (filename, data, pretty=true)
{
    return _writeFileJson(filename, data, pretty);
}

// read appstate from file form login
exports.readAppstate = function (filename='appstate.json')
{
    return {appState: JSON.parse(fs.readFileSync(filename, 'utf8'))}
}

// write to list in json file using key
// add values to list found at key
_writeToKeyInFile = function (filename, key, values)
{
    // get object from list
    obj = _readObjFromFile(filename);

    // check if file exists
    if (obj == undefined)
    {
        return;
    }

    // check object for key
    var keys = Object.keys(obj);
    if (!keys.includes(key))
    {
        console.log("json_helper:80 Key not found in object");
        return;
    }

    // Key found: add values to list
    for (var i = 0; i < values.length; i++)
    {
        obj[key].push(values[i]);
    }

    // save new object to file
    _writeFileJson(filename, obj, true);
}

//public version of _writeToListInFile
exports.writeToKeyInFile = function (filename, key, values)
{
    _writeToListInFile(filename, key, values);
}

// write a plain string to file
_writeStringToFile = function (filename, str)
{
    // do not create new file if file does not exist
    if (!_pathExists(filename))
    {
        return;
    }

    // add a line to a lyric file, using appendFile
    fs.appendFile(filename, str + '\n', (err) => {
        if (err) throw err;
        console.log("file '" + filename + "' was updated");
    });
}

// public version of writeStringToFile
exports.writeStringToFile = function (filename, str)
{
    _writeStringToFile(filename, str);
}

// add data to list in file
_addToList = function (filename, data)
{
    // read list and make sure file exists
    var lst = _readObjFromFile(filename)
    if (lst == undefined)
    {
        return;
    }

    // file exists
    if (!lst.includes(data))
    {
        // add new data
        lst.push(data);

        // save to file
        _writeFileJson(filename, lst, true);
    }
}

// public version of add to list
exports.addToList = function (filename, data)
{
    _addToList(filename, data);
}

// returns list of strings representing each filename in dir
exports.readFileNamesDir = function (dir)
{
    if (_pathExists(dir))
    {
        var path = __dirname + dir;
        var files = fs.readdirSync(path);
        return files;
    }
}
