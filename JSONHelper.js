
const fs = require("fs");

var POSTIE_PATH = '/data/posties/';
var SCORE_FILE = 'data/score.json';

// Save data to file at filename
saveToFile = function(filename, data)
{
    fs.writeFileSync(filename, JSON.stringify(data));
}

// Read from file at filename and return data
readFromFile = function(filename)
{
    return JSON.parse(fs.readFileSync(filename, 'utf8'))
}

// Write Object to a json file
exports.saveObjToFile = function(filename, data)
{
    fs.writeFileSync(filename, JSON.stringify(data));
}

// Public function for reading object from file
exports.readObjFromFile = function(filename)
{
    return readFromFile(filename);
}

// Open file and add to data found there
exports.addToListInFile = function(filename, data)
{
    // read from file into list
    var lst = readFromFile(filename);

    // Check if data already in list before adding
    if (lst.indexOf(data) == -1)
    {
        // Add new element to list
        lst.push(data);

        // save new list to file
        saveToFile(filename, lst);

        return true;
    }
    return false;
}

// Returns new lst without ele
removeElementFromList = function(lst, ele)
{
    // list to return
    var newLst = [];

    for (var i = 0; i < lst.length; i++)
    {
        // add all elements besides ele
        if (lst[i] != ele)
        {
            newLst.push(lst[i]);
        }
    }
    return newLst;
}

// Remove element from list found inside file
exports.removeFromListInFile = function(filename, ele)
{
    // read from file into list
    var fileList = readFromFile(filename);

    // get list without ele
    var newList = removeElementFromList(fileList, ele);

    // save new list to file
    saveToFile(filename, newList);
}

// remove last element form a list
removeLastElementList = function (lst)
{
    var newList = [];

    for (var i = 0; i < lst.length; i++)
    {
        if (i != lst.length - 1)
        {
            newList.push(lst[i]);
        }
    }
    return newList;
}

// Remove last element from list in file
exports.removeLastFromFileList = function (filename)
{
    // read from file into list
    var fileList = readFromFile(filename);

    // get list last element
    var newList = removeLastElementList(fileList);

    // save new list to file
    saveToFile(filename, newList);
}
