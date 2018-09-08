
class CGame
{

	constructor()
	{
		this.init();
	}

 	init() {

		// Data Init
		timeInit();
		mediaInit();
		this.HeroLife = 10;
		this.CamPos = [-370,13,100]; 
		this.SpeedCoef=50;
		this.CamDir = [0.88,-0.15,-0.43];
		this.State = "Play"
		this.EndAnim = new CTimeAnim();
		this.LastFire = 0;

		// gl init
		gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST); 
		gl.enable(gl.CULL_FACE);     

		// init gl object	
		shadowMapInit();
		squareInit();
		SphereInit();
		groundInit();
		this.Screen = new CScreen("canvas3D","canvas2D");
		this.Guns = new CGuns();
		this.Stone = new CStone();
		this.Vehicules = new CVehicules();
		this.Info = new CInfo();
		this.Trees = new CTrees();
		this.Enemies = new CEnemies(30);
		this.Hero = new CHuman([-575,200,81],2,[1,0,-1]);
		this.initPhase=0   ;

		
	}

	update() {

		//update time animation
		timeUpdate();
		var gElapsed = timeGetElapsedInS();
		shaderCounter = timeGetCurrentInS()*10;

		// Get Media Info
		this.CamMvVec = mediaGetCamMvVector();

		//Update Camera Direction
		var mvVector = vec3.create();
		vec3.cross(mvVector,this.CamDir,[0,1,0]);
		this.CamDir[0] += mvVector[0]*this.CamMvVec[0];
		this.CamDir[1] -= this.CamMvVec[1] ;
		this.CamDir[2] += mvVector[2]*this.CamMvVec[0];
		vec3.normalize(this.CamDir,this.CamDir);

		//Change Gun
		if(mediaWheelEvt()) {
			this.Hero.ChangeGun();
		}
		// Game State Machine
		switch (this.State) {
			case "Play":
				// Vehicule Exit
				if (this.LastFire && !mediaIsKey("Fire") &&  this.Hero.State =="Vehicule")
				{
					vec3.copy(this.Hero.Pos,this.Vehicules.DriverOutPos);
					this.Hero.State = "Running";
					this.Hero.Dir[1]=0;
					vec3.normalize(this.Hero.Dir,this.Hero.Dir);
					this.Vehicules.Power = 0;
					this.Vehicules.FrontPt.Speed = [0,0,0];
				}

				// Update Hero Direction and Hero Horz Speed
				if(this.Hero.State !="Vehicule"){
	
					// if Running process hero dir function of camdir and media angle
					if (mediaIsMvtAsked()){
						vec3.rotateY(this.Hero.Dir,this.CamDir,[0,0,0],mediaGetMvAngle());
						this.Hero.Dir[1]=0;
						vec3.normalize(this.Hero.Dir,this.Hero.Dir);
						this.Hero.HSpeed = 50;
					}	
					else
					{
						this.Hero.HSpeed = 0;
					}

					this.Vehicules.update();
					this.Hero.UpdateHero(mediaIsKey("Fire"),this.CamDir,this.HeroLife<=0);	

					//Update Cam Position function of CamDir and Hero Position			
					var projDir = [];
					vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
					this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
					this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15
					this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
				}
				else
				{				
					vec3.copy(this.Vehicules.WheelDir,this.CamDir);
					if(mediaIsMvtAsked())
					{
						this.Vehicules.Power = (Math.abs(mediaGetMvAngle())<Math.PI/4)?60:-100;
					}
					else
					{
						this.Vehicules.Power = 0;
					}						
					this.Vehicules.update();
					vec3.copy(this.Hero.Pos,this.Vehicules.DriverPos);
					vec3.copy(this.Hero.Dir,this.Vehicules.Dir);
					vec3.normalize(this.Hero.Dir,this.Hero.Dir);
					this.Hero.HSpeed = 0;
					this.Hero.UpdateHero(false,this.CamDir,this.HeroLife<=0);
					
					this.CamPos[0] = this.Vehicules.Pos[0] - this.CamDir[0]*40;
					this.CamPos[2] = this.Vehicules.Pos[2] - this.CamDir[2]*40
					this.CamPos[1] = this.Vehicules.Pos[1] + 10.5 ;

					
				}



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
				this.CamPos[1] = this.Hero.Pos[1] + 10.5 ;

				// Update Enemies
				this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,false);				
				
				this.Hero.UpdateHero(false,this.CamDir,this.HeroLife<=0);

				if (this.LastFire && !mediaIsKey("Fire") && !this.EndAnim.running)
				{
					this.init();
				}

				break;
		}

		this.Info.update(this.Enemies.IsInTarget,this.Enemies.HitTarget,this.HeroLife,this.Enemies.NbALive,this.State,this.Hero.GunSelected);
		this.Guns.update();
		this.LastFire = mediaIsKey("Fire");

	}

	draw() {


		
		//Perceptive projection
		mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

		// new viewport and clear Display 
		this.Screen.updateViewPortAndCanvasSize(gl);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Perceptive projection
		mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 10000.0);

		// Camera managment
		var lookAtMatrix = mat4.create();
		var viewPos = [this.CamPos[0] + this.CamDir[0],this.CamPos[1] + this.CamDir[1],this.CamPos[2] + this.CamDir[2]];
		mat4.lookAt(lookAtMatrix,this.CamPos,viewPos,[0,1,0]);
		mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
		
		groundDraw(this.Hero.Pos[0],this.Hero.Pos[2]);
		//Draw Shadow Map		
		SphereShaderProgram = SphereShaderNormalProgram;
		this.Trees.draw();
		this.Stone.draw(false);	 
		SphereShaderProgram = SphereWithShadowShaderProgram;	 
		this.Enemies.draw();
		this.Vehicules.draw();	
		this.Hero.draw();
		this.Guns.draw();

		
		//Draw Info 2D
		this.Info.draw();

		//Draw Shadow Map	
		if(this.initPhase<2)
		{
			SphereShaderProgram = SphereShadowMapShaderProgram;
			shadowMapStart();
				mat4.identity(mvMatrix);
				gl.viewport(0, 0,shadowMapDepthTextureSize,shadowMapDepthTextureSize);
				// new viewport and clear Display 
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				//Perceptive projection
				var lookAtMatrix = mat4.create();			
				mat4.ortho(pMatrix, -1000.0, 1000.0, -1000.0, 1000.0, 0.0, 2000.0);	
				mat4.lookAt(lookAtMatrix,[0,1000,0],[0,0,0],[1,0,0]);
				mat4.multiply(pMatrix,pMatrix,lookAtMatrix);
				mat4.copy(pShadowMatrix,pMatrix);
				gl.cullFace(gl.FRONT);
				this.Trees.draw();
				this.Stone.draw(true);	 
		
			shadowMapStop();
			gl.cullFace(gl.BACK);	

			this.initPhase++;
		}	
		//Debug shadow map Texture
		// gl.viewport(0, 0,256,256);
		// mat4.identity(mvMatrix);
		// mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
		// mat4.identity(mvMatrix);
		// squareDraw(SquareShaderProgramTexDbg);


	}

}


