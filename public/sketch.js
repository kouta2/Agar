var client_blobs = {}; // list of client blobs locations and size
var random_blobs = {}; // list of random blob locations and size
var my_blob; // my blob data
var zoom; 
var init_radius = 64; // spawn radius of my blob

var socket;

var p5_agar = function(sketch)
{
	sketch.setup = function()
	{
		socket = io.connect('http://localhost:3000');
		// console.log("" + socket);

		var canvas = sketch.createCanvas(700, 550);
		canvas.parent('agar');

		sketch.translate(sketch.width / 2, sketch.height / 2);
		my_blob = new Blob(sketch.width / 2, sketch.height / 2, init_radius, sketch);

/*
		for(var i = 0; i < num_initial_blobs; i++)
		{
			blobs.push(new Blob(sketch.random(sketch.width), sketch.random(sketch.height), baby_blob_size, sketch));
		}
*/

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
/*
		if(sketch.frameCount % 50 == 0)
		{
			for(var i = 0; i < num_new_blobs; i++)
			{
				blobs.push(new Blob(sketch.random(my_blob.location.x - sketch.width, my_blob.location.x + sketch.width), sketch.random(my_blob.location.y - sketch.height, my_blob.location.y + sketch.height), baby_blob_size, sketch));
			}
		}
*/

		for(var key in client_blobs)
		{
			// client_blobs[i].show(sketch);
			var blob = client_blobs[key];
			if(key != socket.id)
			{
				// console.log("this is me");
				draw_other_blobs(sketch, blob);
				if(my_blob.consumes(sketch, blob))
				{
					delete client_blobs[key];
					socket.emit('consumed_client', key);
				}
			}
		}

		for(var blob in random_blobs)
		{
			// var blob = random_blobs[i];
			// console.log("am I in here?");
			draw_other_blobs(sketch, blob);
			if(my_blob.consumes(sketch, blob))
			{
				// socket.emit('consumed_random', blob);
				// random_blobs.delete(blob);
				delete random_blobs[blob];
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

		// console.log("x: " + my_blob.location.x + " y: " + my_blob.location.y);
	};
};

function draw_other_blobs(sketch, blob)
{
	// console.log("x: " + blob.x + " y: " + blob.y + " r: " + blob.r);
	sketch.fill(0, 255, 0);
	var d = blob.r * 2;
	sketch.ellipse(blob.x, blob.y, d, d);
}

var agar_sketch = new p5(p5_agar);