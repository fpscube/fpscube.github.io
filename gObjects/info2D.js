
var gInfo2DCrossColor;
var gInfo2DInjuryAlpha;
var gInfo2DLifeQt;
var gInfo2DAnimInjury;
var gInfo2DNbEnemies;
var gInfo2DNbFps;
var gInfo2DAnimRefreshText;
var gInfo2DWin;

function info2DInit()
{
	gInfo2DCrossColor= [1.0,1.0,1.0,1.0];
	gInfo2DInjuryAlpha = 0.0;
	gInfo2DLifeQt = 1.0;
	gInfo2DAnimInjury = new CTimeAnim();
	gInfo2DAnimTextRefresh = new CTimeAnim();
	gInfo2DAnimTextRefresh.start(1000,0,1);
	gInfo2DNbFps = 0;
	gInfo2DWin = false;
	gInfo2DGameState = "Play";
;	
}

function info2DUpdate(pEnemieTarget,pInjury,pNbLife,pNbEnemies,pGameState)
{	
	
	// if (!gInfo2DAnimTextRefresh.running) 
	// {
	// 	gInfo2DNbFps = Math.round(1/timeGetElapsedInMs() * 1000,0);
	// 	gInfo2DAnimTextRefresh.start(1000,0,1);
	// }
	if (pGameState=="Play")
	{
		gInfo2DCrossColor =((pEnemieTarget) ?  [1.0,0.0,0.0,1.0]: [1.0,1.0,1.0,1.0]);
		gInfo2DLifeQt = pNbLife;
		if (pInjury) gInfo2DAnimInjury.start(200,0.7,0.0);
	}
	else
	{
		gInfo2DCrossColor = [0.0,0.0,0.0,0.0];
	}
	gInfo2DInjuryAlpha = gInfo2DAnimInjury.getValue();
	gInfo2DNbEnemies = pNbEnemies;
	gInfo2DGameState = pGameState;
}

function info2DDraw()
{
	 
    var canvas2D = document.getElementById('canvas2D');
    var canvas3D = document.getElementById('canvas3D');
	ctx2d.clearRect(0, 0, canvas2D.width, canvas2D.height); 
	ctx2d.globalAlpha = 0.2;
    ctx2d.fillRect(0,0,canvas2D.width,18);
    ctx2d.globalAlpha = 1.0;
	ctx2d.font = "Bold 15px Arial";
	// ctx2d.fillText("Life : " + gInfo2DLifeQt*10 + "%  -  Enemies : " +  gInfo2DNbEnemies + "  -  Fps : " + gInfo2DNbFps	,10,15 );
	ctx2d.fillText("Life : " + gInfo2DLifeQt*10 + "%  -  Enemies : " +  gInfo2DNbEnemies  + "  -  " + canvas3D.width + "x" + canvas3D.height ,10,15 );
	ctx2d.font = "Bold 100px Arial";
	ctx2d.globalAlpha = 0.5;
	if(gInfo2DGameState == "Win") 	ctx2d.fillText("You Win ",canvas2D.width/2,canvas2D.height/2 );
	if(gInfo2DGameState == "Lose") 	ctx2d.fillText("You Lose ",canvas2D.width/2,canvas2D.height/2 );

	// Cross Display
	if(!gInfo2DWin) 
	{
		shaderVertexColorVector  = gInfo2DCrossColor;
		mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
		mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
		squareDraw(shaderProgram);	
	}

	// // Life Bar Display			
	// shaderVertexColorVector = [1.0,1.0,1.0,1.0];
	// mat4.ortho(pMatrix, -2.0, 10.0, -10.0, 0.5, -1.0, 1.0);	
	// mat4.identity(mvMatrix);
	// mat4.scale(mvMatrix,mvMatrix,[gInfo2DLifeQt/10,0.1,0.1]);
	// squareDraw(shaderProgram);

	// Injury Display			
	if (gInfo2DInjuryAlpha>0)
	{
		shaderVertexColorVector = [1.0,0.0,0.0,gInfo2DInjuryAlpha];
		mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, 0.0, 1.0);	
		mat4.identity(mvMatrix);
		squareDraw(shaderProgram);
	}
		
}



