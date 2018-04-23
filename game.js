// Game Model
var gPos=[] ;
var gDir=[];
var gSpeedCoef=50;
var gLife=0;

var gHuman=[];

// ######### Init ##############// 

function initGame() {

	// init time utils
	timeInit();

	// game data Init
	gPos = [0,0,10]; 
	gSpeedCoef=50;
	gDir = [0,0,-1];
	gLife = 100;

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
	groundInit();
	gunsInit();
	waterInit();
	bulletsInit();
		  	
	// Animation init
	gLastTime = new Date().getTime();	

}

function updateGame() {

	//update time animation
	timeUpdate();
	var gElapsed = timeGetElapsedInS();
	shaderCounter = timeGetCurrentInS()*10;
	
	// Media camera movement
	var camMvVec = mediaGetCamMvVector();
	mvVector =  vec3.create();
	vec3.cross(mvVector,gDir,[0,1,0]);
	gDir[0] += mvVector[0]*camMvVec[0];
	gDir[1] -= camMvVec[1] ;
	gDir[2] += mvVector[2]*camMvVec[0];
	vec3.normalize(gDir,gDir);

	// Media running movement
	if(mediaIsKey("-")) 	gSpeedCoef -=1;	
	if(mediaIsKey("+") )	gSpeedCoef +=1;	
	if (mediaIsRunning())
	{
		var mvVector =  vec3.create();
		var runAngle = mediaGetRunAngle()
		vec3.rotateY(mvVector,gDir,[0,0,0],runAngle);
		gPos[0] += gSpeedCoef*gElapsed*mvVector[0];
		gPos[2] += gSpeedCoef*gElapsed*mvVector[2];	
	}
	
	gPos[1]=groundGetY(gPos[0],gPos[2]) + 10.0;

	var hitTarget=false;
	var isInTarget=false;
	for(var i =0 ;i<gHuman.length;i++){
		var fire = mediaIsKey("Fire");
		gHuman[i].Update(fire);
		hitTarget =hitTarget || gHuman[i].HitTarget;
		isInTarget = isInTarget || gHuman[i].IsInTarget;
	}	
	if (hitTarget) gLife--;
	if (gLife<0) initGame();
	info2DUpdate(isInTarget,hitTarget,gLife/10);
}

function drawGame() {
	
	updateGame();

	// Clear Display
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Perceptive projection
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

	// Camera managment
	var lookAtMatrix = mat4.create();
	viewPos = [gPos[0] + gDir[0],gPos[1] + gDir[1],gPos[2] + gDir[2]];
	mat4.lookAt(lookAtMatrix,gPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
	
	groundDraw();
	waterDraw();	
	//enemiesDraw();
	for(var i =0 ;i<gHuman.length;i++){
		gHuman[i].Draw();
	}	
	gunsDraw(gPos,gDir);
	bulletsDraw();	

	//Draw Info 2D
	info2DDraw();


}
