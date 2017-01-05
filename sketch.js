var blobs = [];
var my_blob;
var num_initial_blobs = 100;
var random_blob_size = 8;
var glob_sketch;
var zoom;
var init_radius = 64;

var p5_agar = function(sketch)
{
	sketch.setup = function()
	{
		glob_sketch = sketch;
		var canvas = sketch.createCanvas(700, 550);
		canvas.parent('agar');

		sketch.translate(sketch.width / 2, sketch.height / 2);
		my_blob = new Blob(sketch.width / 2, sketch.height / 2, init_radius, sketch);

		for(var i = 0; i < num_initial_blobs; i++)
		{
			blobs.push(new Blob(sketch.random(sketch.width), sketch.random(sketch.height), random_blob_size, sketch));
		}
	};

	sketch.draw = function()
	{
		sketch.background(0);

		sketch.translate(sketch.width / 2, sketch.height / 2);
		new_zoom = init_radius / my_blob.r;
		zoom = sketch.lerp(zoom, new_zoom, .1);
		sketch.scale(zoom);
		sketch.translate(-my_blob.location.x, -my_blob.location.y);


		for(var i = 0; i < blobs.length; i++)
		{
			blobs[i].show(sketch);
			if(my_blob.consumes(sketch, blobs[i]))
			{
				blobs.splice(i, 1);
			}
		}

		my_blob.show(sketch);
		my_blob.update(sketch);
	};
};

var agar_sketch = new p5(p5_agar);