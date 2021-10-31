


class CInfo
{
	constructor()
	{

		this.CrossColor= [1.0,1.0,1.0,1.0];
		this.InjuryAlpha = 0.0;
		this.LifeQt = 1.0;
		this.AnimInjury = new CTimeAnim();
		this.AnimTextRefresh = new CTimeAnim();
		this.AnimTextRefresh.start(1000,0,1);
		this.NbFps = 0;
		this.Win = false;
		this.GameState = "Play";
		this.Time = "0:0";
		this.WeaponsCount = 0;
		this.ScoreTab = null;
		this.EventTab = null;
		this.TargetPos = null;
		this.Level = null;
		this.LevelTitleAnim = new CTimeAnim();
		this.Zoom = 0;
		this.CurrentLevel  = -1;

	}



	update()
	{	
		

		// if (!this.AnimTextRefresh.running) 
		// {
		// 	this.NbFps = Math.round(1/timeGetElapsedInMs() * 1000,0);
		// 	this.AnimTextRefresh.start(1000,0,1);
		// }
		this.EnName = "";
		this.EnLife = "";
		this.CrossColor = [0.0,0.0,0.0,0.0];
		this.HelpCreationMode = 0;


		if (GameInst.State=="Play")
		{
			if(GameInst.HumanInTarget!=null)	{
				this.CrossColor =  [1.0,0.0,0.0,1.0];
				this.EnName = GameInst.HumanInTarget.Name;
				this.TargetPos = GameInst.HumanInTarget.TargetPos;
				if(GameInst.HumanInTarget.Life>0)
					this.EnLife = GameInst.HumanInTarget.Life + "%";
				else
					this.EnLife = "DEAD";
			}
			else{
				this.CrossColor = [1.0,1.0,1.0,1.0];
			}
			if (GameInst.Hero.IsTouched) this.AnimInjury.start(200,0.7,0.0);
	
		}

		this.LifeQt = GameInst.Hero.Life;
		this.InjuryAlpha = this.AnimInjury.getValue();
		this.NbEnemies = CEnemiesInst.NbALive;
		this.GameState = GameInst.State;
		if((this.CurrentLevel != GameInst.CurrentLevel) &&
		   (this.GameState == "Play"))
		{
			this.LevelTitleAnim.start(10000,1,0);
			this.CurrentLevel = GameInst.CurrentLevel;
		}

		
		if(this.GameState != "Win" &&  this.GameState != "Lose") 
		{
			var timeMin = Math.floor(timeGetCurrentInS()/60);
			var timeSec = Math.floor(timeGetCurrentInS()  - timeMin*60) ;
	
			this.Time = timeMin + ":";
			if (timeSec < 10) this.Time += "0";
			this.Time  +=  timeSec;
			this.ScoreTab = null;

		
		}


		this.WeaponsCount  = GameInst.Hero.GunSelected.WeaponsCount;
		if (GameInst.Hero.GunSelected == GunsInst.No) this.WeaponsCount = 0;

		this.Zoom  = GameInst.Hero.Zoom;
		
	}

	draw()
	{
		
		var canvas2D = document.getElementById('canvas2D');
		var canvas3D = document.getElementById('canvas3D');
		ctx2d.clearRect(0, 0, canvas2D.width, canvas2D.height); 
		ctx2d.fillStyle = 'black';
		ctx2d.globalAlpha = 0.8;
		ctx2d.fillRect(0,0,canvas2D.width,18);
		   
		ctx2d.fillStyle = 'white';
		ctx2d.globalAlpha = 1.0;
		ctx2d.font = "14px Arial";

		var legendText =  "Life : " + this.LifeQt 	+ "%  -  ";
		legendText += "Enemies : " +  this.NbEnemies  + "  -  ";
		legendText += "Weapons : " +  this.WeaponsCount  + "  -  ";
		legendText += "Level : " +  this.CurrentLevel  + "  -  ";
		legendText += "Time : " +  this.Time +  " - ";
		legendText += "Resolution : " + canvas3D.width + "x" + canvas3D.height  +  " - ";


		ctx2d.fillText(legendText,10,15);
	
		
		if (this.EventTab!=null)
		{
			var fontSize=15;
			var xPos = fontSize*2;
			var yPos = fontSize*4;
	
			ctx2d.globalAlpha = 1.0;
			ctx2d.fillStyle = 'white';			
			ctx2d.font = fontSize + "px Arial";			

			for (var i=0;i<this.EventTab.length;i++)
			{				
				ctx2d.fillText(this.EventTab[i],xPos,yPos);
				yPos = yPos + fontSize; 
			}	
			
		}
		

		// LEVEL TITLE Display
		else if(this.LevelTitleAnim.running)
		{
			var text = "NEW LEVEL : KILL " + this.NbEnemies + " ENEMIES";
			var coef = this.LevelTitleAnim.getValue();
			var fontSize=canvas2D.width/text.length;
			var xPos = canvas2D.width/2 - (fontSize*text.length)/4;
			var yPos = canvas2D.height/2 + (fontSize)/4; ;
			ctx2d.globalAlpha = coef;
			ctx2d.fillStyle = 'white';
			ctx2d.font = "Bold " + fontSize + "px Arial";
			
			ctx2d.fillText(text,xPos,yPos);


			ctx2d.fillStyle = 'white';
			ctx2d.globalAlpha = 1.0;
			ctx2d.font = "20px Arial";
			var offset = 150;
			ctx2d.fillText("Fire: Mouse Left ",50,offset);
			ctx2d.fillText("Exit Vehicule: Mouse Right",50,offset + 30*1);
			ctx2d.fillText("Change weapon: Mouse Scroll Wheel",50,offset + 30*2);
			ctx2d.fillText("Jump: Space",50,offset + 30*3);
		}
		
				
		
		// Cross Display
		shaderVertexColorVector  = this.CrossColor;
		mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
		mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
		squareDraw(SquareShaderProgram);	
		

		// Zoom Display
		if(this.Zoom)
		{
			mvPushMatrix();
			mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
			mat4.identity(mvMatrix);
			squareDraw(gGunZoomShaderProgram);
			mvPopMatrix();
		}

		
		// Enemy name Display
		ctx2d.font = "14px Arial";
		ctx2d.fillText(this.EnName,canvas2D.width/2.0 + 14,canvas2D.height/2.0);
		ctx2d.fillText(this.EnLife,canvas2D.width/2.0 + 14,canvas2D.height/2.0 + 20);
	
		
		ctx2d.font = "Bold 100px Arial  ";
		ctx2d.globalAlpha = 0.5;
		ctx2d.fillStyle = 'white'; 	
		if(this.GameState == "Win") 	ctx2d.fillText("You Win - " + this.Time,canvas2D.width/2,canvas2D.height/2 );
		if(this.GameState == "Lose") 	ctx2d.fillText("You Lose ",canvas2D.width/2,canvas2D.height/2 );
		
		// Injury Display			
		if (this.InjuryAlpha>0)
		{
			shaderVertexColorVector = [1.0,0.0,0.0,this.InjuryAlpha];
			mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
			mat4.identity(mvMatrix);
			squareDraw(SquareShaderProgram);
		}

	}

}

