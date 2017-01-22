var client_blobs = {}; // list of client blobs locations and size
var random_blobs = {}; // list of random blob locations and size
var my_blob; // my blob data
var zoom; // used for zooming as my_blob resizes
var init_radius = 64; // spawn radius of my blob

var socket; // file descriptor to communicate with the server

var p5_agar = function(sketch)
{
	sketch.setup = function()
	{
		socket = io.connect('http://localhost:3000');

		var canvas = sketch.createCanvas(700, 550);
		canvas.parent('agar');

		sketch.translate(sketch.width / 2, sketch.height / 2);
		my_blob = new Blob(sketch.width / 2, sketch.height / 2, init_radius, sketch);

		var data = {
			x: my_blob.location.x,
			y: my_blob.location.y,
			r: my_blob.r
		};

		socket.emit('start', data); //, my_blob);

		socket.on('client_update', function(new_client_blobs) { client_blobs = new_client_blobs; });
		socket.on('random_update', function(new_random_blobs) { random_blobs = new_random_blobs; });
	};

	sketch.draw = function()
	{
		sketch.background(0);

		sketch.translate(sketch.width / 2, sketch.height / 2);
		new_zoom = init_radius / my_blob.r;
		zoom = sketch.lerp(zoom, new_zoom, .1);
		sketch.scale(zoom);
		sketch.translate(-my_blob.location.x, -my_blob.location.y);

		for(var key in client_blobs)
		{
			var blob = client_blobs[key];
			if(key != socket.id)
			{
				draw_other_blobs(sketch, blob);
				if(my_blob.consumes(sketch, blob))
				{
					delete client_blobs[key];
					socket.emit('consumed_client', key);
				}
			}
		}

		for(var key in random_blobs)
		{
			var blob = random_blobs[key];
			draw_other_blobs(sketch, blob);
			if(my_blob.consumes(sketch, blob))
			{
				delete random_blobs[key];
				socket.emit('consumed_random', key);
			}
		}

		my_blob.show(sketch);
		my_blob.update(sketch);
		my_blob.constrain(sketch);

		var my_b = {
			x: my_blob.location.x,
			y: my_blob.location.y,
			r: my_blob.r
		};
		socket.emit('update', my_b);

	};
};

function draw_other_blobs(sketch, blob)
{
	sketch.fill(0, 255, 0);
	var d = blob.r * 2;
	sketch.ellipse(blob.x, blob.y, d, d);
}

var agar_sketch = new p5(p5_agar);