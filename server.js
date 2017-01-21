// setting up server code
var express = require('express');
var app = express();
var server = app.listen('3000');
app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

var client_blobs = {}; // maps socket id to blob object
var random_blobs = {}; // set of random blobs
var num_new_spawns = 10; // 10 new spawns every 25 ms per client
var random_x = 500; // spawn randoms within 500 pixels
var random_y = 500; // spawn randoms within 500 pixels
var random_r = 8; // randoms radius is 8
var num_clients = 0; // number of clients

io.sockets.on('connection', createConnection);

function createConnection(socket)
{
	console.log('new connection! '  + socket.id);
	console.log('hello');

	socket.on('start', newClient);
	socket.on('disconnect', handleDisconnection);
	socket.on('update', handleUpdate);
	socket.on('consumed_client', handleConsumingClient);
	socket.on('consumed_random', handleConsumingRandom);
	setInterval(update_all_clients, 25);


	function newClient(data)
	{
		// console.log('socket id: ' + socket.id + ' x: ' + data.location.x + ' y: ' + data.location.y + ' r: ' + data.r);
		client_blobs[socket.id] = data;
		socket.emit('other_client_blobs', client_blobs);
		num_clients++;
		// console.log(client_blobs);
	}

	function handleDisconnection()
	{
		console.log(socket.id + " disconnected");
		delete client_blobs[socket.id];
		num_clients--;
	}

	function handleUpdate(data)
	{
		client_blobs[socket.id] = data;
	}

	function handleConsumingClient(data)
	{
		socket.disconnect();
	}

	function handleConsumingRandom(data)
	{
		console.log(random_blobs.size);
		random_blobs.delete(data);
		console.log(random_blobs.size + "\n");
	}

	function update_all_clients()
	{
		// console.log(client_blobs);
		io.sockets.emit('client_update', client_blobs); // emit where all the other clients are
		
		// create new randoms based on the locations of the clients
		if(Object.keys(random_blobs).length <= num_clients * 1000)
		{
			for(var key in client_blobs)
			{
				var val = client_blobs[key];
				for(var i = 0; i < num_new_spawns; i++)
				{
					var data = {
						x: (Math.random() * random_x) - (random_x / 2) + val.x /*600*/,
						y: (Math.random() * random_y) - (random_y / 2) + val.y /*600*/,
						r: random_r
					};
					/// console.log("x: " + data.x + " y: " + data.y + " r: " + data.r);
					random_blobs[data] = data;
					// console.log(data.x);
					// console.log(random_blobs[data]);
					// console.log(Math.random());
				}
				console.log(random_blobs);
			}
		}
		// emit locations of randoms
		// print(random_blobs);
		// console.log(typeof(random_blobs));
		io.sockets.emit('random_update', random_blobs);
	}
}

function print(list)
{
	console.log('printing');
	for(let item of list)
	{
		console.log(item);
	}
}