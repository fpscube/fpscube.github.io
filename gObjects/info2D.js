
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
	}


	update(pEnemieTarget,pInjury,pNbLife,pNbEnemies,pGameState)
	{	
		
		// if (!this.AnimTextRefresh.running) 
		// {
		// 	this.NbFps = Math.round(1/timeGetElapsedInMs() * 1000,0);
		// 	this.AnimTextRefresh.start(1000,0,1);
		// }
		if (pGameState=="Play")
		{
			this.CrossColor =((pEnemieTarget) ?  [1.0,0.0,0.0,1.0]: [1.0,1.0,1.0,1.0]);
			if (pInjury) this.AnimInjury.start(200,0.7,0.0);
		}
		else
		{
			this.CrossColor = [0.0,0.0,0.0,0.0];
		}
		this.LifeQt = pNbLife;
		this.InjuryAlpha = this.AnimInjury.getValue();
		this.NbEnemies = pNbEnemies;
		this.GameState = pGameState;
		
		if(this.GameState != "Win" &&  this.GameState != "Lose") 
		{
			var timeMin = Math.floor(timeGetCurrentInS()/60);
			var timeSec = Math.floor(timeGetCurrentInS()  - timeMin*60) ;
	
			this.Time = timeMin + ":";
			if (timeSec < 10) this.Time += "0";
			this.Time  +=  timeSec;
		}
		
	}

	draw()
	{
		
		var canvas2D = document.getElementById('canvas2D');
		var canvas3D = document.getElementById('canvas3D');
		ctx2d.clearRect(0, 0, canvas2D.width, canvas2D.height); 
		ctx2d.globalAlpha = 0.2;
		ctx2d.fillRect(0,0,canvas2D.width,18);
		ctx2d.globalAlpha = 1.0;
		ctx2d.font = "Bold 15px Arial";
		// ctx2d.fillText("Life : " + this.LifeQt*10 + "%  -  Enemies : " +  this.NbEnemies + "  -  Fps : " + this.NbFps	,10,15 );
		ctx2d.fillText(
		"Life : " + this.LifeQt*10 	+ "%  -  " +
		"Enemies : " +  this.NbEnemies  + "  -  "  + 
		"Resolution : " + canvas3D.width + "x" + canvas3D.height  + " - "  + 
		"Time : " +  this.Time
		,10,15 );
		ctx2d.font = "Bold 100px Arial  ";
		ctx2d.globalAlpha = 0.5;

		// Cross Display
		shaderVertexColorVector  = this.CrossColor;
		mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
		mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
		squareDraw(shaderProgram);	
		

		if(this.GameState == "Win") 	ctx2d.fillText("You Win - " + this.Time,canvas2D.width/2,canvas2D.height/2 );
		if(this.GameState == "Lose") 	ctx2d.fillText("You Lose ",canvas2D.width/2,canvas2D.height/2 );


		// // Life Bar Display			
		// shaderVertexColorVector = [1.0,1.0,1.0,1.0];
		// mat4.ortho(pMatrix, -2.0, 10.0, -10.0, 0.5, -1.0, 1.0);	
		// mat4.identity(mvMatrix);
		// mat4.scale(mvMatrix,mvMatrix,[this.LifeQt/10,0.1,0.1]);
		// squareDraw(shaderProgram);

		// Injury Display			
		if (this.InjuryAlpha>0)
		{
			shaderVertexColorVector = [1.0,0.0,0.0,this.InjuryAlpha];
			mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
			mat4.identity(mvMatrix);
			squareDraw(shaderProgram);
		}
			
	}

}

