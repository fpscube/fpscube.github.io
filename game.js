// Game Model
var gPos=[] ;
var gDir=[];
var gSpeed=[]; 
var gSpeedCoef=50;
var gKeyPressed={};
var gLastTime=0;
var gLife=0;
var gElapsed=0;
var gAnim=0;
var gBulletList = [];

var gFireTimer=0;

// ######### Event Handler ##############// 

function updatePosition(e) {
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	if (!isChrome || ( Math.abs(e.movementX) < 150 && Math.abs(e.movementY)< 150))
	{
		mvVector =  vec3.create();
		vec3.cross(mvVector,gDir,[0,1,0]);

		speedCoef = 2.5
		gDir[0] += mvVector[0]*speedCoef*e.movementX/screen.width;
		gDir[1] -= speedCoef*e.movementY/screen.height;
		gDir[2] += mvVector[2]*speedCoef*e.movementX/screen.width;
		vec3.normalize(gDir,gDir);
	}
}

function mediaSetKeyDownFct(event){gKeyPressed[event.key]=1;}
function mediaSetKeyUpFct(event){gKeyPressed[event.key]=0;}
function mediaIsKey(name){return (gKeyPressed[name]==1);}

function mediaSetMouseUpFct(event){
	if (event.button==0) gKeyPressed["Fire"]=0;
}
function mediaSetMouseDownFct(event){	
	if (event.button==0) gKeyPressed["Fire"]=1;
}





// ######### Init ##############// 

function initGame() {

	// game data Init
	gPos = [0,0,10]; 
	gDir = [0,0,-1];
	gSpeed = [0,0,0];
	gLife = 10;
	gBulletList = [];
	// gl init
	gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

	// init gl object
	squareInit();
	cubeInit();
	enemiesInit(10);
	groundInit();
		  	
	// Animation init
	gLastTime = new Date().getTime();	

}


// ######### Draw ##############// 

function drawGame() {

	//Time counter update
	var timeNow =  new Date().getTime();
	gElapsed = (timeNow - gLastTime)/1000; 
	gLastTime = timeNow; 	
	gAnim += 100 * gElapsed;
	shaderCounter += 10* gElapsed;

	// Clear Display
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Deplacement
	mvVector =  vec3.create();
	vec3.cross(mvVector,gDir,[0,1,0]);	
	if(mediaIsKey("-")) 	gSpeedCoef -=1;	
	if(mediaIsKey("+") )	gSpeedCoef +=1;	
	if(mediaIsKey("ArrowLeft") || mediaIsKey("Left")  || mediaIsKey("q")){gSpeed[0]=-gSpeedCoef*mvVector[0];gSpeed[2]=-gSpeedCoef*mvVector[2];}
	if(mediaIsKey("ArrowRight") || mediaIsKey("Right")  || mediaIsKey("d")){gSpeed[0]=gSpeedCoef*mvVector[0];gSpeed[2]=gSpeedCoef*mvVector[2];}
	if(mediaIsKey("ArrowUp") || mediaIsKey("Up")  || mediaIsKey("z")){gSpeed[0]=gSpeedCoef*gDir[0];gSpeed[2]=gSpeedCoef*gDir[2];}
	if(mediaIsKey("ArrowDown") || mediaIsKey("Down")  || mediaIsKey("s")){gSpeed[0]=-gSpeedCoef*gDir[0];gSpeed[2]=-gSpeedCoef*gDir[2];}	
	

	// Fire Object

	if (mediaIsKey("Fire")) 
	{
		
		gFireTimer += gElapsed*50;
		if (gFireTimer > 10) 
		{
			gFireTimer=0;
			mvVector =  vec3.create();
			vec3.cross(mvVector,gDir,[0,1,0]);
			gBulletList.push([[gPos[0] + gDir[0]*6 + mvVector[0]*2,gPos[1]+gDir[1]*6 ,gPos[2]+gDir[2]*6  + mvVector[2]*2],[gDir[0],gDir[1],gDir[2]]]);
			gBulletList.push([[gPos[0] + gDir[0]*6 - mvVector[0]*2,gPos[1]+gDir[1]*6 ,gPos[2]+gDir[2]*6  - mvVector[2]*2],[gDir[0],gDir[1],gDir[2]]]);

			if (gBulletList.length > 20) { gBulletList.shift(); gBulletList.shift();}
		}
	}
	
	// Gravity
	//if (gPos[0] > 50 || gPos[0] < -50  || gPos[2] < -50  || gPos[2] > 50  )  gSpeed[1] = -1000*gElapsed ; 
	gPos[0] += gSpeed[0]*gElapsed;
	gPos[1] += gSpeed[1]*gElapsed;
	gPos[2] += gSpeed[2]*gElapsed;	
	gPos[1]=groundGetY(gPos[0],gPos[2]) + 10.0;
	gSpeed = [0,0,0];



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
			gLife--;
			if (gLife<0)initGame();
			break;
		}
	}	

	enemiesUpdate();

	//Ortho proj

	// Cross Display
	mat4.ortho(pMatrix, 0.0, gl.viewportWidth , 0.0, gl.viewportHeight, -1.0, 1.0);			
	vertexColorVector = [1.0,1.0,1.0,1.0];
	if(enemiesColision(gPos,gDir)) vertexColorVector = [1.0,0.0,0.0,1.0];
	mat4.identity(mvMatrix)
	mat4.translate(mvMatrix,mvMatrix, [ gl.viewportWidth/2.0,gl.viewportHeight/2.0,0.0]);
	mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,1.0]);
	setMatrixUniforms();
	squareDraw();			
	

	// Life Bar Display			
	vertexColorVector = [1.0,1.0,1.0,1.0];
	mat4.ortho(pMatrix, -2.0, 10.0, -10.0, 0.5, -1.0, 1.0);	
	mat4.identity(mvMatrix)
	mat4.scale(mvMatrix,mvMatrix,[gLife/10,0.1,0.1]);
	setMatrixUniforms();
	squareDraw();

	//Perceptive projection
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

	//Gun Display	
	vertexColorVector = [0.2,0.1,0.2,1.0];
	gunSpeed = 0;
	if(mediaIsKey("Fire")) gunSpeed=5;
	mat4.identity(mvMatrix)
	mat4.translate(mvMatrix,mvMatrix, [2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim*gunSpeed), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	setMatrixUniforms();
	mat4.identity(mvMatrix)
	cubeDraw();
	mat4.translate(mvMatrix,mvMatrix, [-2,-1,-2]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-80), [1, 0, 0]);
	mat4.rotate(mvMatrix,mvMatrix, degToRad(-gAnim*gunSpeed), [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[0.2,2.0,0.2]);
	setMatrixUniforms();
	cubeDraw();

	// Camera managment
	var lookAtMatrix = mat4.create();
	viewPos = [gPos[0] + gDir[0],gPos[1] + gDir[1],gPos[2] + gDir[2]];
	mat4.lookAt(lookAtMatrix,gPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)

	// init mvMAtrix
	mat4.identity(mvMatrix)
	setMatrixUniforms();	

	// Ground		
	vertexColorVector = [1.0,1.0,0.5,1.0];
	mvPushMatrix();	
	setMatrixUniforms();
	groundDraw();
	mvPopMatrix();		
	
	// Water 
	gl.enable(gl.BLEND);
	mvPushMatrix();
	mat4.identity(mvMatrix)
	mat4.translate(mvMatrix,mvMatrix, [0.0,-40.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[2000.0,10.0,2000.0]);
	setMatrixUniforms();
	cubeDraw();
	mvPopMatrix();	
	gl.disable(gl.BLEND);
	
	//  Bullets		
	vertexColorVector = [1.0,1.0,1.0,1.0];
	for (var id in gBulletList) {
		bulletPos = gBulletList[id][0];
		bulletDir = gBulletList[id][1];
		bulletPos[0] += gElapsed*100*bulletDir[0];
		bulletPos[1] += gElapsed*100*bulletDir[1];
		bulletPos[2] += gElapsed*100*bulletDir[2];
		mvPushMatrix()	;
		mat4.translate(mvMatrix,mvMatrix, bulletPos);
		mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim)*5, [1, 1, 1]);
		mat4.scale(mvMatrix,mvMatrix,[0.2,0.2,0.2]);
		setMatrixUniforms();;
		cubeDraw();
		mvPopMatrix();
	}
	enemiesDraw();


}
