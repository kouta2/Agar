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
var random_x = 1000; // spawn randoms within 500 pixels
var random_y = 1000; // spawn randoms within 500 pixels
var random_r = 8; // randoms radius is 8
var num_clients = 0; // number of clients
var num_randoms = 0; // number of randoms

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
		/*
		random_blobs["blah"] = {
			x: data.x + 50,
			y: data.y + 50,
			r: random_r
		};
		*/
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
		delete client_blobs[data];
		// num_clients--;
		socket.disconnect();
	}

	function handleConsumingRandom(data)
	{
		delete random_blobs[data];
		num_randoms--;
	}

	function update_all_clients()
	{
		// console.log(client_blobs);
		io.sockets.emit('client_update', client_blobs); // emit where all the other clients are

		
		// create new randoms based on the locations of the clients
		if(num_randoms <= num_clients * 25)
		{
			for(var key in client_blobs)
			{
				var val = client_blobs[key];
				for(var i = 0; i < num_new_spawns; i++)
				{
					var data = {
						x: (Math.random() * random_x) - (random_x / 2) + val.x,
						y: (Math.random() * random_y) - (random_y / 2) + val.y,
						r: random_r
					};
					/// console.log("x: " + data.x + " y: " + data.y + " r: " + data.r);
					random_blobs["" + data.x + " " + data.y] = data;
					// console.log(data.x);
					// console.log(random_blobs[data]);
					// console.log(Math.random());
				}
				// console.log(random_blobs);
				num_randoms += num_new_spawns;
			}
		}
		
		// emit locations of randoms
		// print(random_blobs);
		// console.log(typeof(random_blobs));
		// console.log(random_blobs);
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