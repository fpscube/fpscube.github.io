

class CGame
{

	constructor()
	{
		this.init();
	}

 	init() {

		// init time utils
		timeInit();

		// game data Init
		this.HeroPos = [-370,13,100]; 
		// this.HeroPos = [-70,13,100]; 
		// this.HeroPos = [100,32,-500]; 
		this.HeroDir = [0.88,-0.15,-0.43];
		this.HeroCollision = false;
		this.HeroLife = 10;
		//this.HeroLife = 100000000000000;
		this.HeroHSpeed = 0;
		this.HeroVSpeed = 0;
		this.HeroVAcc=-100.0;
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
		info2DInit();
		squareInit();
		cubeInit();
		SphereInit();

		this.Enemies=[];
		for(var i =0 ;i<30;i++){
			this.Enemies.push(new CHuman([i*20,0,0],Math.random()*8));
		}	
		this.Hero = new CHuman([0,0,0],2);
		groundInit();
		waterInit();
		treeInit();
					

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
					this.HeroHSpeed = 50;
				}else{
					this.HeroHSpeed = 0;
				}
				
				//Store Hero New Position

				//Horizontal Collision
				var newPos=[];
				var newHorizontalPos=[];
				newHorizontalPos[0] = this.HeroPos[0] + this.HeroHSpeed*gElapsed*this.HeroDir[0];
				newHorizontalPos[2] = this.HeroPos[2] + this.HeroHSpeed*gElapsed*this.HeroDir[2];
				newHorizontalPos[1] = this.HeroPos[1] ;

				
				
				var horzCollisionPos = this.Stone.getCollisionPoint(this.HeroPos,newHorizontalPos,mvMatrix,0);

				if (horzCollisionPos==null && this.HeroRunning )
				{
					//Vertical Collision to detect new y Pos
					vec3.copy(newPos,newHorizontalPos);
					this.HeroVSpeed += this.HeroVAcc*gElapsed;
					newPos[1] += this.HeroVSpeed - 5.5;
					var collisionPos = this.Stone.getCollisionPoint(newHorizontalPos,newPos,mvMatrix,0);
					var groundY =  groundGetY(newPos[0],newPos[2]);
					if(collisionPos!=null) 
					{
						newPos[1] = collisionPos[1];
						this.HeroVSpeed = 0;
					}
					if(newPos[1]<groundY) newPos[1]  = groundY;
					{
						this.HeroVSpeed = 0;
					}

					//Final Collision
					newPos[1] += 5.5;
					var collisionPos1 = this.Stone.getCollisionPoint(this.HeroPos,newPos,mvMatrix,16.0);
					newPos[1] += 5.0;
					this.HeroPos[1] += 5.0;
					var collisionPos2 = this.Stone.getCollisionPoint(this.HeroPos,newPos,mvMatrix,0.0);
					
					newPos[1] -= 5.0;
					this.HeroPos[1] -= 5.0;	

					if(collisionPos1==null && collisionPos2==null ) 
					{			
						vec3.copy(this.HeroPos,newPos);
					}
					
				}
				else
				{
					//Vertical Collision
					vec3.copy(newPos,this.HeroPos);
					this.HeroVSpeed += this.HeroVAcc*gElapsed;;
					newPos[1] += this.HeroVSpeed - 5.5;
					var collisionPos = this.Stone.getCollisionPoint(this.HeroPos,newPos,mvMatrix);
					var groundY =  groundGetY(newPos[0],newPos[2]);
					if(collisionPos!=null) 
					{
						newPos[1] = collisionPos[1];
						this.HeroVSpeed = 0;
					}
					if(newPos[1]<groundY) newPos[1]  = groundY;
					{
						this.HeroVSpeed = 0;
					}
					newPos[1] += 5.5;
					vec3.copy(this.HeroPos,newPos);
				}
		

				//Update Cam Position				
				var projDir = [];
				vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
				this.CamPos[0] = this.HeroPos[0] - projDir[0]*15;
				this.CamPos[2] = this.HeroPos[2] - projDir[2]*15;
				this.CamPos[1] = this.HeroPos[1] + 5.5 ;

				// Update Enemies
				var hitTarget=false;
				var isInTarget=false;
				this.EnemiesCount = this.Enemies.length;
				for(var i =0 ;i<this.Enemies.length;i++){
					this.Enemies[i].UpdateEnemie(this.CamPos,this.CamDir,this.HeroPos,this.HeroDir,this.HeroFire);
					hitTarget =hitTarget || this.Enemies[i].HitTarget;
					isInTarget = isInTarget || this.Enemies[i].IsInTarget;
					if (this.Enemies[i].IsDead()) this.EnemiesCount--;
				}	
				if (hitTarget) this.HeroLife--;
				
				this.Hero.UpdateHero(this.HeroPos,this.HeroDir,this.HeroRunning,this.HeroFire,this.CamDir,this.HeroLife<=0);

				if (this.HeroLife<=0 )
				{
					this.State="Lose";
					this.EndAnim.start(2000,0,1);
				}	
				else if (this.EnemiesCount==0) 
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
				this.CamPos[0] = this.HeroPos[0] - projDir[0]*15;
				this.CamPos[2] = this.HeroPos[2] - projDir[2]*15;
				this.CamPos[1] = groundGetY(this.CamPos[0],this.CamPos[2]) + 11.0 ;

				// Update Enemies
				for(var i =0 ;i<this.Enemies.length;i++){
					this.Enemies[i].UpdateEnemie(this.CamPos,this.CamDir,this.HeroPos,this.HeroDir,false);
				}	
				
				this.Hero.UpdateHero(this.HeroPos,this.HeroDir,this.HeroRunning,this.HeroFire,this.CamDir,this.HeroLife<=0);

				if (this.HeroFire && !this.EndAnim.running)
				{
					this.init();
				}

				break;
		}

		info2DUpdate(isInTarget,hitTarget,this.HeroLife,this.EnemiesCount,this.State);


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
		
		treeDraw();
		groundDraw();
		waterDraw();		
		this.Stone.draw();	

		for(var i =0 ;i<this.Enemies.length;i++){
			this.Enemies[i].draw();
		}	
		this.Hero.draw();

		
		//Draw Info 2D
		info2DDraw();



	}

}


