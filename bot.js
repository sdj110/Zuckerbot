// https://github.com/Schmavery/facebook-chat-api

const fs = require("fs");
const login = require("facebook-chat-api");
const handler = require("./ChatHandler");

// CONST IDS
var BOT_ID = 100027355535144;
var MY_SENDER_ID = 616280252;
var BOYS_THREAD_ID = 253740418046451;

// manually stop listening as fail safe
var listening = true;

// Time between updates
var time = 1000 * 60 * 60 * 8;

// Initialize handler
handler.initialize(BOYS_THREAD_ID);

// Will stop when you say '/zzz'
//login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) =>
login(handler.cred, (err, api) =>
{
    // error check
    if(err) return console.error(err);

    // Let them know we are live
    handler.sendMessage(api, "**** Hey everyone, we are live from my backyard and we're \
     smokin some meats! ****\n\n\n type /zbot to see my actions.");

    // This function will update the chat every time seconds
    setInterval( ()=>{ handler.updateChat(api); }, time);

    // Set API parameters
    api.setOptions({
        selfListen: false,
        listenEvents: true,
        logLevel: "error"
    });

    // Start listening for events to the account
    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });

        if (listening)
        {
            // Check event types and react
            switch(event.type)
            {
                // event was a MESSAGE
                case "message":
                    // Check if msg sent to chat matches bot command. send appropriate response
                    handler.checkForCommands(api, event)

                    // Shut down bot by sending /zzz in fb chat
                    if(event.body === '/zzz' && event.senderID == MY_SENDER_ID)
                    {
                        api.sendMessage("\n\n\n*** ZuckerBot shutting down... ***\n\n\n", event.threadID);
                        listening = false;
                        api.logout(null);
                        return stopListening();
                    }

                    // Update number of messages sent to group
                    handler.updateMessageCounter(api, event);
                    break;

                // event was a READ RECEIPT
                case "read_receipt":
                    break;

                case "message_reaction":
                    break;

                // fires when someone is typing
                case "typ":
                    break;

                // event was a default event
                default:
                    console.log("Default case triggered by " +  event.type)
            }
        }
    });
});














// STASH
/*
api.sendMessage("TEST BOT: " + event.body, event.threadID);
console.log(event.type);




// event was a READ RECEIPT
case "read_receipt":
    var date = new Date(event.time / 1000).getTimezoneOffset();
    var formattedTime = (new Date()).toUTCString();

    console.log("Message Read at: " + formattedTime);
    break;

*/
