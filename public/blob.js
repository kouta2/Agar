

function Blob(x, y, r, sketch)
{
	this.location = sketch.createVector(x, y);
	this.r = r;
	this.v = sketch.createVector(0, 0);
	this.vel_mag = 200;

	this.show = function(sketch)
	{
		sketch.fill(255);
		var d = this.r * 2;
		sketch.ellipse(this.location.x, this.location.y, d, d);
	}

	this.update = function(sketch, list_of_blobs)
	{
		var update_vel = sketch.createVector(sketch.mouseX - sketch.width / 2, sketch.mouseY - sketch.height / 2);
		update_vel.setMag(this.vel_mag / this.r);
		this.v.lerp(update_vel, .2);
		this.location.add(this.v);
	}

	this.consumes = function(sketch, blob)
	{
		var dist_between_blobs = sketch.dist(this.location.x, this.location.y, blob.x, blob.y);
		if(dist_between_blobs < this.r + blob.r && this.r > blob.r)
		{
			this.r = sketch.sqrt(this.r * this.r + blob.r * blob.r);
			return true;
		}
		return false;
	}

	this.constrain = function(sketch)
	{
		this.location.x = sketch.constrain(this.location.x, -600, 600); // -sketch.width, sketch.width);
		this.location.y = sketch.constrain(this.location.y, -600, 600); // -sketch.height, sketch.height);
	}

	this.split = function(sketch)
	{
		
	}
}