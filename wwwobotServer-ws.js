var WebSocketServer=require("ws"); // https://github.com/websockets/ws
var ws;
const port = 8080;

ws = new WebSocketServer.Server({port: port});

ws.on("connection",function(s) {
	console.log("server started, port "+port);
	s.send(JSON.stringify({msg:"server started port "+port}));
	s.on('message',function(msg) {
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
				ws.broadcast(msg);
				break;
		}
	});
	s.on('close',function(msg)
	{
		console.log("close");
	});
});

ws.broadcast = function broadcast(data) {
	ws.clients.forEach(function each(client) {
		client.send(data);
	});
};
