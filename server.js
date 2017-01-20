// setting up server code
var express = require('express');
var app = express();
var server = app.listen('3000');
app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

var client_blobs = {}; // maps socket id to blob object
var random_blobs = []; // list of random blobs
var num_new_spawns = 10; // 10 new spawns every 25 ms per client
var random_x = 500; // spawn randoms within 500 pixels
var random_y = 500; // spawn randoms within 500 pixels
var random_r = 8; // randoms radius is 8

io.sockets.on('connection', createConnection);

function createConnection(socket)
{
	console.log('new connection! '  + socket.id);
	console.log('hello');

	socket.on('start', newClient);
	socket.on('disconnect', handleDisconnection)


	function newClient(data)
	{
		// console.log('socket id: ' + socket.id + ' x: ' + data.location.x + ' y: ' + data.location.y + ' r: ' + data.r);
		client_blobs[socket.id] = data;
		socket.emit('other_client_blobs', client_blobs);
		// console.log('hi');
	}

	function handleDisconnection()
	{
		delete client_blobs[socket.id];
	}

	setInterval(update_all_clients, 25);

	function update_all_clients()
	{
		io.sockets.emit('client_update', client_blobs); // emit where all the other clients are

		// create new randoms based on the locations of the clients
		for(var key in client_blobs)
		{
			for(var i = 0; i < num_new_spawns; i++)
			{
				var my_blob = client_blobs[key];
				var data = {
					x: (Math.random() * random_x) - (random_x / 2) + my_blob.x,
					y: (Math.random() * random_y) - (random_y / 2) + my_blob.y,
					r: random_r
				}
				random_blobs.push(data);
		}
		// emit locations of randoms
		io.sockets.emit('random_update', random_blobs);
	}

}