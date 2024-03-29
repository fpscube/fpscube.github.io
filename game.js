
class CGame
{

	constructor(playerName)
	{
		if(playerName == "") playerName="NoName";
		this.UserData = {};
		this.UserData["playerName"]=playerName;
		this.Level={};
		this.init();
	}

 	init() {
	
		// Data Init
		groundInit();
		timeInit();
		mediaInit();
		this.CamPos = [-370,13,100]; 
		this.SpeedCoef=50;
		this.CamDir = [0.88,-0.15,-0.43];
		this.State = "Play";
		this.EndAnim = new CTimeAnim();
		this.LastFire = 0;
		this.HumanInTarget = null;


		this.Save = new CSave();
		this.CurrentLevel = this.Save.getLevel();

		// gl init
		gl.clearColor(6.0/256.0, 10.0/256.0, 42.0/256.0, 1.0);	
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST); 
		gl.enable(gl.CULL_FACE);     

		this.Creation = new CCreation(this);
		this.Creation.levelGeneration(this);

		// init gl object	
		squareInit();
		SphereInit();
		this.Screen = new CScreen("canvas3D","canvas2D");
		this.Guns = new CGuns();
		this.Stone = new CStone(this);
		this.Vehicules = new CVehicules(this);
		this.Info = new CInfo();
		this.Trees = new CTrees(this);
		
		this.Enemies = new CEnemies(this);
		var intPos = [-630,600,90];
		this.Hero = new CHuman(intPos,2,[1,0,-1],true,this.UserData["playerName"].substring(0, 10));


		
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

		//Clear Human In Target
		this.HumanInTarget = null;


		if(mediaIsKeyOnce("c"))
		{
			if(this.State!="Create")
			{
				this.Creation.MenuLevel=1;
				this.State="Create";
			}
			else 
			{
				this.Vehicules = new CVehicules(this);
				this.State="Play";
			}
		} 


		// Game State Machine
		switch (this.State) {
			case "Create":
				this.Creation.update();
				this.Enemies.updateCreation(this);
				this.Vehicules.updateCreation(this);
				this.Stone.updateCreation(this);
				this.Trees.updateCreation(this);

				break;
			case "Play":

				//Change Gun
				if(mediaWheelEvt()!=0) {
					this.Hero.ChangeGun();
				}

				// Vehicule Exit
				if ((mediaIsKey("Exit")  || mediaIsKey(" ")) &&  this.Hero.InVehicule)
				{
					this.Vehicules.Free = true; 
					this.Hero.ExitVehicule(this.Vehicules )
				}


				// Update Enemies
				this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,this.HeroFire);

				if (this.Hero.Life<=0 )
				{
					this.Hero.Life = 0 ;
					this.State="Lose";
					this.CurrentLevel=0;
					this.Save.saveLevel(this.CurrentLevel);
					this.EndAnim.start(2000,0,1);
				}	
				else if (this.Enemies.NbALive==0) 
				{
					this.State="Win";
					this.CurrentLevel+=1;
					this.Save.saveLevel(this.CurrentLevel);
					this.EndAnim.start(2000,0,1);
				}


				var autoFire = mediaIsTouchModeActivated();
				this.Hero.UpdateHero(autoFire,this.CamDir,mediaIsMvtAsked(),mediaGetMvAngle(),this.Vehicules);

				//Update Cam Position function of CamDir and Vehicule Poisition
				if(this.Hero.InVehicule)
				{
					this.CamPos[0] = this.Vehicules.Pos[0] - this.CamDir[0]*40;
					this.CamPos[2] = this.Vehicules.Pos[2] - this.CamDir[2]*40;
					this.CamPos[1] = this.Vehicules.Pos[1] + 10.5 ;
				}
				//Update Cam Position function of CamDir and Hero Position 
				else
				{							
					var projDir = [];
					vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
					if(this.Hero.Zoom) 
					{
						this.CamPos[0] = this.Hero.Pos[0];
						this.CamPos[2] = this.Hero.Pos[2];
						this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
						mediaSetSpeedSlow();

					}
					else
					{
						this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
						this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15;
						this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
						mediaSetSpeedNormal();
					}
					this.Vehicules.EngineOn = false;
				}

				
				// Update Vehicule if not used by any human
				if(this.Vehicules.Free)	{this.Vehicules.update();}
				
				
	
				break;
			case "Win":
			case "Lose":
				
				if( this.Hero.InVehicule)
				{
					this.Vehicules.Free = true; 
					this.Hero.ExitVehicule(this.Vehicules );
				}

				vec3.rotateY(this.CamDir,this.CamDir,[0,0,0],gElapsed/4);	

				// Update Enemies	
				this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,false);
				
				this.Hero.UpdateHeroDead();

				if (this.LastFire && !mediaIsKey("Fire") && !this.EndAnim.running)
				{
					this.init();
				}	
				var projDir = [];
				vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
				this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
				this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15;
				this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
				this.Vehicules.EngineOn = false;
				break;
		}

		this.Guns.update();
		this.LastFire = mediaIsKey("Fire");
	

		this.Info.update();



	}

	draw() {
		

		// new viewport and clear Display 
		this.Screen.updateViewPortAndCanvasSize(gl);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Perceptive projection
		var fov = 45;
		if(this.Hero.Zoom) fov = 44.2;
		mat4.perspective(pMatrix,fov, gl.viewportWidth / gl.viewportHeight, 1.0, 10000.0);

		// Camera managment
		var lookAtMatrix = mat4.create();
		var viewPos = [this.CamPos[0] + this.CamDir[0],this.CamPos[1] + this.CamDir[1],this.CamPos[2] + this.CamDir[2]];
		mat4.lookAt(lookAtMatrix,this.CamPos,viewPos,[0,1,0]);
		mat4.multiply(pMatrix,pMatrix,lookAtMatrix);
		
		groundDraw(this.Hero.Pos[0],this.Hero.Pos[2]);
		gl.cullFace(gl.BACK);	

		this.Trees.draw();
		this.Stone.draw(false);	 
		this.Enemies.draw();
		this.Vehicules.draw();		
		this.Hero.draw();
		this.Guns.draw();
		gl.disable(gl.CULL_FACE);   
		groundWaterDraw(); 
		gl.enable(gl.CULL_FACE); 

		gl.cullFace(gl.FRONT);	
			
		mat4.identity(mvMatrix); 
	
		shaderVertexColorVector = hexColorToGL("#000044")
		shaderVertexColorVector[3]=1.0
		mat4.translate(mvMatrix,mvMatrix, this.CamPos);	
		mat4.scale(mvMatrix,mvMatrix,[9000.0,9000.0,9000.0]);	
		Sphere.Draw(SphereShaderSkyProgram);
			
		gl.cullFace(gl.BACK);
		
		//Draw Info 2D
		this.Info.draw();
		if(this.State == "Create")
			this.Creation.draw();

	

	}

}


