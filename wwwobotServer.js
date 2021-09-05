const fs = require('fs');
const https = require('https'); // https://github.com/websockets/ws
const WebSocket = require('ws');

const server = https.createServer({
  cert: fs.readFileSync('./cert.pem'),
	key: fs.readFileSync('./key.pem'),
	// ca: fs.readFileSync('./ca-chain.cert.pem')
});
const wss = new WebSocket.Server({ server });
const port = 8080;

console.log("wss on port " + port);

function broadcast(sourceSocket, data) {
	const isString = typeof data === "string";
	wss.clients.forEach(function each(client) {
		if(client === sourceSocket) {
			return;
		}
		if(client.readyState !== WebSocket.OPEN) {
			return;
		}
		if (isString) {
			client.send(data);
		} else {
			client.send(data, {binary:true, mask:false});
		}
	});
};

function receiveBinaryData(sourceSocket, msg) {
	broadcast(sourceSocket, msg);
}

function receiveStringData(sourceSocket, msg) {
	var	data=JSON.parse(msg);
	switch(data.type) {
		case "echo":
			console.log("ECHO: '"+data.msg+"'");
			break;
		case "chat":
			console.log("CHAT: '"+data.msg+"'");
			s.send(JSON.stringify({type:"chat",msg:"toi même, port "+port}));
			break;
		case "broadcast":
			console.log("BROADCAST: '"+data.msg+"'");
			broadcast(sourceSocket, msg);
			break;
	}
}

wss.on('connection', function connection(sourceSocket) {
	console.log("server started, port " + port);
	sourceSocket.send(JSON.stringify({msg:"server started port " + port}));

	sourceSocket.on('message', function incoming(msg) {
		if (typeof msg === "object") {
			receiveBinaryData(sourceSocket, msg);
		} else if (typeof msg === "string") {
			receiveStringData(sourceSocket, msg);
		} else {
			console.log("Unknown data type", typeof msg);
		}
	});
	// s.on('close',function()
	// {
	// 	console.log("close");
	// });
});

server.listen(port);
