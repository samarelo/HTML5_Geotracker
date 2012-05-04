/* server.js
	@author: Shaun Amarleo
	

	Purpose of server.js

	WebSocket server that has the following functions:

	1. Receives GeoLocation JSON from client tracking device
	2. Stores this GeoLocation to a local file (xml file)
	3. Sends a broadcast to live viewers when live is available (broadcast may either include JSON coords or have the user retrieve coords xml from server)
	4. Provider viewers with client's tracking status (online/offline)

*/

/* Configuration Variables */
var _HOST_ = "0.0.0.0";
var _PORT_ = 8001;

// import ws library
var WebSocketServer = require("ws").Server

//create WebSocket Server
var wss = new WebSocketServer({host:_HOST_,port:_PORT_});

/* Global variables */
var _trackingOn = false; // bool to track is client is online
var _viewerWS =[]; // holds all websockets of viewers
var _clientWS = null; // holds websocket of client (being tracked)


/* JSON message Definitions 
On connection to determine ws type
	type: "connect"
	peer-type: "client" or "viewer"

When receiving geolocation update from client
	type: "update"
	coords: JSON of coords

When receiving a batch of geolocation updates from client once client comes back online
	type: "update-batch'
	coords: Array of JSON coords

*/

wss.on("connection", function(ws){
	ws.on("message", function(msgJSON){
		switch (msgJSON.type){
			case "connect":
				// determine if it's a client or viewer
				if (msgJSON.peer-type == "client"){
					_clientWS = ws;
					_trackingOn = true;
					console.log("Connected: client");
				} else {
					_viewerWS.push(ws);
					console.log("Connection: viewer");
				}
				break;

			case "update":
				/* for testing output the coords */
				console.log("Update: Latitude="+(msgJSON.coords).lat+" Longitude="+(msgJSON.coords).long);
				break;

			case "update-batch":
				/* for testing output the coords */
				var coords = msgJSON.coords;
				console.log("Update-Batch:START");
				for (var i=0;i<coords.length;i++) console.log("Lat:"+coords[i].lat+" Long:"+coords[i].long)
				console.log("Update-Batch:END");
				break;
		}
	});

	ws.on("close", function(){
		var i = _viewerWS.indexOf(ws);
		if (i<0){
			// it's a client that closed
			_clientWS = null;
			_trackingOn = false;
		} else {
			_viewerWS.splice(i,1);
		}

	});

});
