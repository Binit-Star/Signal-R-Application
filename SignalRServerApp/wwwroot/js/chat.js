"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("http://localhost:50761/chatHub").build();

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = user + " says " + msg;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});

connection.on("UserConnected", function (connectionId) {
    var groupElement = document.getElementById("groupElement");
    var options = document.createElement("option");
    options.text = connectionId;
    options.value = connectionId;
    groupElement.add(options);
});

connection.on("UserDisconnected", function (connectionId) {
    var groupElement = document.getElementById("groupElement");
    for (var i = 0; i < groupElement.length; i++) {
        if (groupElement.options[i].value === connectionId) {
            groupElement.remove(i);
        }
    }
});


connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    var groupElement = document.getElementById("groupElement");
    var groupValue = groupElement.options[groupElement.selectedIndex].value;
    if (groupValue === "All" || groupValue === "MySelf") {

        var method = groupValue === "All" ? "SendMessage" : "SendMessageToCaller";

        connection.invoke(method, user, message).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        connection.invoke("SendMessageToUser", groupValue, user, message).catch(function (err) {
            return console.error(err.toString());
        });
    }

    
    event.preventDefault();
});