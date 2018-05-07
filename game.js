// Game Model
var gHero;
var gHeroPos=[];
var gHeroDir=[];
var gHeroLife=0;
var gHeroFire=false;
var gHeroRunning=false;
var gSpeedCoef=50;

var gCamPos=[];
var gCamDir=[];
var gCamViewPos=[];

var gEnemies=[];
var gWinAnim;
var gGameState;
var gDetailCoef=1;
var gCScreen;


// ######### Init ##############// 

function initGame() {

	// init time utils
	timeInit();

	// game data Init
 	gHeroPos = [0,0,10]; 
	gHeroDir = [0,0,0];
	gHeroLife = 10;
	gHeroFire=false;
	gHeroRunning=false;

	gCamPos = [0,0,10]; 
	gSpeedCoef=50;
	gCamDir = [0,0,-1];
	gGameState = "Play"
	gWinAnim = new CTimeAnim();
	gCScreen = new CScreen("canvas3D","canvas2D");

	// gl init
	gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      

	// init gl object
	info2DInit();
	squareInit();
	cubeInit();

	gEnemies=[];
	for(var i =0 ;i<30;i++){
		gEnemies.push(new CHuman([i*10,0,0]));
	}	
	gHero = new CHuman([0,0,0]);
	groundInit();
	waterInit();
		  	
	// Animation init
	gLastTime = new Date().getTime();	

	

}

function updateGame() {

	//update time animation
	timeUpdate();
	var gElapsed = timeGetElapsedInS();
	shaderCounter = timeGetCurrentInS()*10;

	// Media Fire/Running
	gHeroFire = mediaIsKey("Fire"); 
	gHeroRunning = mediaIsRunning();
	
	// Update Camera Dir
	var camMvVec = mediaGetCamMvVector();

	mvVector =  vec3.create();
	vec3.cross(mvVector,gCamDir,[0,1,0]);
	gCamDir[0] += mvVector[0]*camMvVec[0];
	if (gGameState == "Play") gCamDir[1] -= camMvVec[1] ;
	gCamDir[2] += mvVector[2]*camMvVec[0];
	vec3.normalize(gCamDir,gCamDir);

	
	// Media running movement
	if (gHeroRunning && (gGameState=="Play"))
	{
		var mvVector =  vec3.create();
		var runAngle = mediaGetRunAngle();
		vec3.rotateY(gHeroDir,gCamDir,[0,0,0],runAngle);
		gCamPos[0] += gSpeedCoef*gElapsed*gHeroDir[0];
		gCamPos[2] += gSpeedCoef*gElapsed*gHeroDir[2];
		
	}

	if (gGameState !== "Play") 
	{
		var heroCamVec = [];		
		vec3.subtract(heroCamVec,gCamPos,gHeroPos);
		vec3.rotateY(heroCamVec,heroCamVec,[0,0,0],gElapsed/3 + camMvVec[0]);
		vec3.add(gCamPos,gHeroPos,heroCamVec);

		vec3.normalize(heroCamVec,heroCamVec);
		
	 	vec3.rotateY(heroCamVec,heroCamVec,[0,0,0],-0.2)
	 	gCamDir[0]  =  -heroCamVec[0];
	 	gCamDir[2]  = -heroCamVec[2];
		vec3.normalize(gCamDir,gCamDir);
		
		
	}
	gCamPos[1]=groundGetY(gCamPos[0],gCamPos[2]) + 10.0;


	// Update Enemies
	var hitTarget=false;
	var isInTarget=false;
	var enemiesCount = gEnemies.length;
	for(var i =0 ;i<gEnemies.length;i++){
		gEnemies[i].UpdateEnemie(gCamPos,gCamDir,gHeroFire);
		hitTarget =hitTarget || gEnemies[i].HitTarget;
		isInTarget = isInTarget || gEnemies[i].IsInTarget;
		if (gEnemies[i].IsDead()) enemiesCount--;
	}	

	
	
	// Update Hero 
	
	if (gGameState == "Play") 
	{
		var projDir = [];
		vec3.rotateY(projDir,gCamDir,[0,0,0],0.2);
		gHeroPos[0] = projDir[0]*15+gCamPos[0];
		gHeroPos[2] = projDir[2]*15+gCamPos[2];
		gHeroPos[1] = groundGetY(gHeroPos[0],gHeroPos[2])+5.5 ;
	}
	
	gHero.UpdateHero(gHeroPos,gHeroDir,gHeroRunning,gHeroFire,gCamDir,gHeroLife<=0);

	if (hitTarget) gHeroLife--;

	info2DUpdate(isInTarget,hitTarget,gHeroLife,enemiesCount,gGameState);

	//Game state machine
	
	if (gHeroLife<=0 && gGameState=="Play")
	{
		gGameState="Lose";
		gWinAnim.start(2000,0,1);
	}
	else if ( enemiesCount==0 && gGameState=="Play") 
	{
		gGameState="Win";
		gWinAnim.start(2000,0,1);
	}
	if (gGameState!="Play" && gHeroFire && !gWinAnim.running)
	{
		initGame();
	}
}

function drawGame() {
	
	updateGame();


	// new viewport and clear Display 
	gCScreen.updateViewPortAndCanvasSize(gl);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Perceptive projection
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

	// Camera managment
	var lookAtMatrix = mat4.create();
	viewPos = [gCamPos[0] + gCamDir[0],gCamPos[1] + gCamDir[1],gCamPos[2] + gCamDir[2]];
	mat4.lookAt(lookAtMatrix,gCamPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
	
	groundDraw();
	waterDraw();	
	//enemiesDraw();
	for(var i =0 ;i<gEnemies.length;i++){
		gEnemies[i].Draw();
	}	
	gHero.Draw();

	//Draw Info 2D
	info2DDraw();


}
