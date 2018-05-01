// Game Model
var gPos=[];
var gCamDir=[];
var gRunDir=[];
var gSpeedCoef=50;
var gLife=0;
var gFire=false;
var gRunning=false;

var gHuman=[];
var gWinAnim;
var gGameState;
var gHero;

// ######### Init ##############// 

function initGame() {

	// init time utils
	timeInit();

	// game data Init
	gPos = [0,0,10]; 
	gSpeedCoef=50;
	gCamDir = [0,0,-1];
	gRunDir = [0,0,0];
	gLife = 10;
	gGameState = "Play"
	gFire=false;
	gRunning=false;
	gWinAnim = new CTimeAnim();

	// gl init
	gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

	// init gl object
	info2DInit();
	squareInit();
	cubeInit();

	gHuman=[];
	for(var i =0 ;i<30;i++){
		gHuman.push(new CHuman([i*10,0,0]));
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
	gFire = mediaIsKey("Fire"); 
	gRunning = mediaIsRunning();
	
	// Media camera movement
	var camMvVec = mediaGetCamMvVector();
	if (gGameState == "Win") camMvVec[0] = -gElapsed;
	mvVector =  vec3.create();
	vec3.cross(mvVector,gCamDir,[0,1,0]);
	gCamDir[0] += mvVector[0]*camMvVec[0];
	gCamDir[1] -= camMvVec[1] ;
	gCamDir[2] += mvVector[2]*camMvVec[0];
	vec3.normalize(gCamDir,gCamDir);

	// Media running movement
	if(mediaIsKey("-")) 	gSpeedCoef -=1;	
	if(mediaIsKey("+") )	gSpeedCoef +=1;	
	if (gRunning)
	{
		var mvVector =  vec3.create();
		var runAngle = mediaGetRunAngle()
		vec3.rotateY(gRunDir,gCamDir,[0,0,0],runAngle);
		gPos[0] += gSpeedCoef*gElapsed*gRunDir[0];
		gPos[2] += gSpeedCoef*gElapsed*gRunDir[2];	
	}
	
	gPos[1]=groundGetY(gPos[0],gPos[2]) + 10.0;

	var hitTarget=false;
	var isInTarget=false;
	var enemiesCount = gHuman.length;
	for(var i =0 ;i<gHuman.length;i++){
		gHuman[i].Update(gPos,gCamDir,gFire);
		hitTarget =hitTarget || gHuman[i].HitTarget;
		isInTarget = isInTarget || gHuman[i].IsInTarget;
		if (gHuman[i].IsDead()) enemiesCount--;
	}	
	gHero.UpdateControled(gPos,gCamDir,gRunning,gRunDir,gFire);
	if (hitTarget) gLife--;

	info2DUpdate(isInTarget,hitTarget,gLife,enemiesCount,gGameState=="Win");

	//Game state machine
	if ( (gLife<0 || enemiesCount==0 ) && gGameState=="Play") 
	{
		gGameState="Win";
		gWinAnim.start(2000,0,1);
	}
	if (gGameState=="Win" && gFire && !gWinAnim.running)
	{
		initGame();
	}
}

function drawGame() {
	
	updateGame();

	// Clear Display
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Perceptive projection
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

	// Camera managment
	var lookAtMatrix = mat4.create();
	viewPos = [gPos[0] + gCamDir[0],gPos[1] + gCamDir[1],gPos[2] + gCamDir[2]];
	mat4.lookAt(lookAtMatrix,gPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
	
	groundDraw();
	waterDraw();	
	//enemiesDraw();
	for(var i =0 ;i<gHuman.length;i++){
		gHuman[i].Draw();
	}	
	gHero.Draw();

	//Draw Info 2D
	info2DDraw();


}
