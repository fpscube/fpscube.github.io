

class CGame
{

	constructor()
	{
		this.init();
	}

 	init() {

		squareInit();
		SphereInit();
		groundInit();

		timeInit();
		// init time utils
		humansInit();
		// game data Init	
		this.HeroDir = [0.88,-0.15,-0.43];
		this.HeroCollision = false;
		this.HeroLife = 10;
		//this.HeroLife = 100000000000000;
		this.HeroFire=false;
		this.HeroRunning=false;
		this.MediaRunAngle=0;

		this.CamPos = [-370,13,100]; 
		this.SpeedCoef=50;
		this.CamDir = [0.88,-0.15,-0.43];
		this.State = "Play"
		this.EndAnim = new CTimeAnim();
		this.Screen = new CScreen("canvas3D","canvas2D");
		this.Stone = new CStone();

		// gl init
		gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);      

		// init gl object
		this.Info = new CInfo();

		this.Trees = new CTrees();
		this.Enemies = new CEnemies(30);
		this.Hero = new CHuman([-575,200,81],2,[-1,0,1]);

		gunsInit();
					

	}

	update() {

		//update time animation
		timeUpdate();
		var gElapsed = timeGetElapsedInS();
		shaderCounter = timeGetCurrentInS()*10;

		// Get Media Info
		this.HeroFire = mediaIsKey("Fire"); 
		this.CamMvVec = mediaGetCamMvVector();
		this.MediaRunAngle = mediaGetRunAngle();
		this.HeroRunning = mediaIsRunning();

		//Update Camera Direction
		var mvVector = vec3.create();
		vec3.cross(mvVector,this.CamDir,[0,1,0]);
		this.CamDir[0] += mvVector[0]*this.CamMvVec[0];
		this.CamDir[1] -= this.CamMvVec[1] ;
		this.CamDir[2] += mvVector[2]*this.CamMvVec[0];
		vec3.normalize(this.CamDir,this.CamDir);

		// Game State Machine
		switch (this.State) {
			case "Play":
				// Update Hero Direction and Hero Horz Speed
				if (this.HeroRunning ){
					vec3.rotateY(this.HeroDir,this.CamDir,[0,0,0],this.MediaRunAngle);
				}			
				this.Hero.UpdateHero(this.HeroDir,this.HeroRunning,this.HeroFire,this.CamDir,this.HeroLife<=0,this.Stone);
				
				// if hero use bazzoka collision is not treated by enemies and turn when fire
				if(this.Hero.Bazooka)	this.HeroFire=false;

				//Update Cam Position				
				var projDir = [];
				vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
				this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
				this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15;
				this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;

				// Update Enemies
				this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,this.HeroFire);
	
				if (this.Enemies.HitTarget) this.HeroLife--;

				if (this.HeroLife<=0 )
				{
					this.State="Lose";
					this.EndAnim.start(2000,0,1);
				}	
				else if (this.Enemies.NbALive==0) 
				{
					this.State="Win";
					this.EndAnim.start(2000,0,1);
				}

				break;
			case "Win":
			case "Lose":
				// Update Cam Position
				// Rotate Around Hero
				vec3.rotateY(this.CamDir,this.CamDir,[0,0,0],gElapsed/4)	
				var projDir = [];
				vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
				this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
				this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15;
				this.CamPos[1] = groundGetY(this.CamPos[0],this.CamPos[2]) + 11.0 ;

				// Update Enemies
				this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,false);				
				
				this.Hero.UpdateHero(this.HeroDir,false,false,this.CamDir,this.HeroLife<=0,this.Stone);

				if (this.HeroFire && !this.EndAnim.running)
				{
					this.init();
				}

				break;
		}

		this.Info.update(this.Enemies.IsInTarget,this.Enemies.HitTarget,this.HeroLife,this.Enemies.NbALive,this.State);
		gunsUpdate();

	}

	draw() {

		// new viewport and clear Display 
		this.Screen.updateViewPortAndCanvasSize(gl);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Perceptive projection
		mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

		// Camera managment
		var lookAtMatrix = mat4.create();
		var viewPos = [this.CamPos[0] + this.CamDir[0],this.CamPos[1] + this.CamDir[1],this.CamPos[2] + this.CamDir[2]];
		mat4.lookAt(lookAtMatrix,this.CamPos,viewPos,[0,1,0]);
		mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
		
		groundDraw(this.Hero.Pos[0],this.Hero.Pos[2]);
		
		this.Trees.draw();
		this.Stone.draw();	 
		this.Enemies.draw();
		this.Hero.draw();

		
		gunsDraw();	
		//Draw Info 2D
		this.Info.draw();



	}

}


