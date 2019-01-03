
class CGame
{

	constructor()
	{
		this.UserData = {};
		this.UserData["playerName"]="NoName";
		var hrefTab = window.location.href.split(/[?&]+([^=&]+)=([^&]*)/);
		hrefTab.shift();
		while (hrefTab.length>0)
		{
			var key=hrefTab.shift();
			if(key!="")
			{
				var val=hrefTab.shift();
				this.UserData[key]=val;
			}
		}
	
		this.init();
	}

 	init() {
	
		// Data Init
		timeInit();
		mediaInit();
		this.CamPos = [-370,13,100]; 
		this.SpeedCoef=50;
		this.CamDir = [0.88,-0.15,-0.43];
		this.State = "Play"
		this.EndAnim = new CTimeAnim();
		this.LastFire = 0;

		// gl init
		gl.clearColor(6.0/256.0, 10.0/256.0, 42.0/256.0, 1.0);	
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST); 
		gl.enable(gl.CULL_FACE);     

		// init gl object	
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
		this.Hero = new CHuman([-575,200,81],2,[1,0,-1],true,this.UserData["playerName"]);
		if (this.MultiPlayer==undefined) this.MultiPlayer = new CMultiPlayer();

		
	}

	reInitMulti() {
		// Data Init
		this.CamPos = [-370,13,100]; 
		this.SpeedCoef=50;
		this.CamDir = [0.88,-0.15,-0.43];
		this.State = "Play"
		this.LastFire = 0;
		this.Hero.reInit();
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
					this.Vehicules.Free = true; 
					this.Hero.ExitVehicule(this.Vehicules )
				}

				this.Hero.UpdateHero(mediaIsKey("Fire"),this.CamDir,mediaIsMvtAsked(),mediaGetMvAngle(),this.Vehicules);
				
				//Update Cam Position function of CamDir and Vehicule Poisition
				if(this.Hero.State =="Vehicule")
				{
					this.CamPos[0] = this.Vehicules.Pos[0] - this.CamDir[0]*40;
					this.CamPos[2] = this.Vehicules.Pos[2] - this.CamDir[2]*40
					this.CamPos[1] = this.Vehicules.Pos[1] + 10.5 ;
				}
				//Update Cam Position function of CamDir and Hero Position 
				else
				{							
					var projDir = [];
					vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
					this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
					this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15
					this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
					this.Vehicules.EngineOn = false;
				}



				// Update Enemies
				if(this.MultiPlayer.NbPlayers==1)
				{
					this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,this.HeroFire);
				}


				if (this.Hero.Life<=0 )
				{
					this.State="Lose";
					this.EndAnim.start(2000,0,1);
				}	
				else if (this.Enemies.NbALive==0 && this.MultiPlayer.NbPlayers==1) 
				{
					this.State="Win";
					this.EndAnim.start(2000,0,1);
				}

				break;
			case "Win":
			case "Lose":
				
				vec3.rotateY(this.CamDir,this.CamDir,[0,0,0],gElapsed/4);	

				// Update Enemies
				if(this.MultiPlayer.NbPlayers==1)
				{
					this.Enemies.update(this.CamPos,this.CamDir,this.Hero.Pos,this.HeroDir,false);				
				}
				
				this.Hero.UpdateHeroDead();

				if (this.LastFire && !mediaIsKey("Fire") && !this.EndAnim.running)
				{
					(this.MultiPlayer.NbPlayers==1) ? this.init() : this.reInitMulti();
				}	
				var projDir = [];
				vec3.rotateY(projDir,this.CamDir,[0,0,0],0.125);
				this.CamPos[0] = this.Hero.Pos[0] - projDir[0]*15;
				this.CamPos[2] = this.Hero.Pos[2] - projDir[2]*15
				this.CamPos[1] = this.Hero.Pos[1] + 5.5 ;
				this.Vehicules.EngineOn = false;
				break;
		}

		this.Guns.update();
		this.LastFire = mediaIsKey("Fire");
	
		this.MultiPlayer.update(this.Hero,this.CamPos,this.CamDir);

		this.Info.update();
			
		// Update Vehicule if not used by any human
		if(this.Vehicules.Free)	{this.Vehicules.update();}

	}

	draw() {
		

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
		gl.cullFace(gl.BACK);	

		this.Trees.draw();
		this.Stone.draw(false);	 
		(this.MultiPlayer.NbPlayers==1) ? this.Enemies.draw(): this.MultiPlayer.draw();
		this.Vehicules.draw();		
		this.Hero.draw();
		this.Guns.draw();

		gl.cullFace(gl.FRONT);	
			
		mat4.identity(mvMatrix); 
	
		shaderVertexColorVector = [7.0/256.0,11.0/256.0,45.0/256.0,1.0]; 
		mat4.translate(mvMatrix,mvMatrix, this.CamPos);	
		mat4.scale(mvMatrix,mvMatrix,[9000.0,9000.0,9000.0]);	
		Sphere.Draw(SphereShaderSkyProgram);
			
		gl.cullFace(gl.BACK);
		
		//Draw Info 2D
		this.Info.draw();

	

	}

}


