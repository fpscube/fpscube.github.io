// Game Model
var gPos=[] ;
var gDir=[];
var gSpeedCoef=50;
var gLife=0;

// ######### Init ##############// 

function initGame() {

	// init time utils
	timeInit();

	// game data Init
	gPos = [0,0,10]; 
	gSpeedCoef=50;
	gDir = [0,0,-1];
	gLife = 10;

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
	humanInit();
	enemiesInit(10);
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

	var injury=false;
	// Bullets And Enemies And Hero Collisions
	for (var i=gBulletList.length-1;i>=0;i--){	 		
		bulletPos = gBulletList[i][0];
		for (var y=gEnemiesList.length-1;y>=0;y--){
			enemiePos = gEnemiesList[y][0];
			if 	((Math.abs(bulletPos[0]-enemiePos[0]) < 1.0) &&
				(Math.abs(bulletPos[1]-enemiePos[1]) < 1.0) &&
				(Math.abs(bulletPos[2]-enemiePos[2]) < 1.0)){
					gBulletList.splice(i,1);
					gEnemiesList.splice(y,1);
					break;
			}			
		}
		if 	((Math.abs(bulletPos[0]-gPos[0]) < 1.0) &&
		(Math.abs(bulletPos[1]-gPos[1]) < 1.0) &&
		(Math.abs(bulletPos[2]-gPos[2]) < 1.0)){
			injury=true;			
			break;
		}
	}	

	if (!injury) injury = humanHasFireSucced();
	if (injury) gLife--;
	if (gLife<0) initGame();

	info2DUpdate((enemiesGetCollisionId() >= 0) || humanIsInGunTarget(),injury,gLife);
	enemiesUpdate();
	humanUpdate();
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
	enemiesDraw();
	humanDraw();	
	gunsDraw(gPos,gDir);
	bulletsDraw();	

	//Draw Info 2D
	info2DDraw();


}
