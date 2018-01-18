// Game Model
var gPos=[] ;
var gDir=[];
var gSpeed=[]; 
var gKeyPressed={};
var gLastTime=0;
var gAnim=0;
var gAnimBody=0;
var gAnimGuns=0;
var gElapsed=0;
var gBulletList = [];
var gEnemieList = [];

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

function mediaSetMouseUpFct(event){return;}
function mediaSetMouseDownFct(event){
	if (event.button==0)  gBulletList.push([[gPos[0],gPos[1],gPos[2]],[gDir[0],gDir[1],gDir[2]]]);
	if (event.button==2)  gEnemieList.push([[-gPos[0],gPos[1]+20,-gPos[2]],[-gDir[0],0,-gDir[2]],[0,0,0]]);
	if (gBulletList.length > 20)  gBulletList.shift();	
}

function addEnemies()
{
	gEnemieList.push([[gPos[0] +  (Math.random() + 2) *50,gPos[1]+20,gPos[2] + (Math.random() + 2) * 50],[Math.random(),Math.random(),Math.random()],[0,0,0]]);
}

// ######### Init ##############// 

function initGame() {

	// game data Init+  
	gPos = [0,6,40]; 
	gDir = [0,0,-1];
	gSpeed = [0,0,0];
	gBulletList = [];
	gEnemieList = [];	

	// gl init
	gl.clearColor(0.0, 0.0, 0.0, 1.0);	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	
	// Vertex Buffer
	buffer = gl.createBuffer();
	buffer.itemSize = 3;
	buffer.numItems = 24;	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gCubePositions), gl.STATIC_DRAW);	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);

	// Normal Buffer	
	buffer = gl.createBuffer();
	buffer.itemSize = 3;
	buffer.numItems = 24;	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gCubeNormals), gl.STATIC_DRAW);	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
		
	// Index Buffer
	buffer = gl.createBuffer ();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gIndices), gl.STATIC_DRAW);
		  	
	// Animation init
	gLastTime = new Date().getTime();
	
	//setInterval(addEnemies,10000);

}

// ######### Draw ##############// 

function drawGame() {

	//Time counter update
	var timeNow =  new Date().getTime();
	gElapsed = (timeNow - gLastTime)/1000; 
	gLastTime = timeNow; 	
	gAnim += 100 * gElapsed

	// Clear Display
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Deplacement
	mvVector =  vec3.create();
	vec3.cross(mvVector,gDir,[0,1,0]);	
	if(mediaIsKey("ArrowLeft") || mediaIsKey("Left")){gSpeed[0]=-20*mvVector[0];gSpeed[2]=-20*mvVector[2];}
	if(mediaIsKey("ArrowRight") || mediaIsKey("Right")){gSpeed[0]=20*mvVector[0];gSpeed[2]=20*mvVector[2];}
	if(mediaIsKey("ArrowUp") || mediaIsKey("Up")){gSpeed[0]=20*gDir[0];gSpeed[2]=20*gDir[2];}
	if(mediaIsKey("ArrowDown") || mediaIsKey("Down")){gSpeed[0]=-20*gDir[0];gSpeed[2]=-20*gDir[2];}	
	
	
	// Gravity
	if (gPos[0] > 50 || gPos[0] < -50  || gPos[2] < -50  || gPos[2] > 50  )  gSpeed[1] = -1000*gElapsed ; 
	gPos[0] += gSpeed[0]*gElapsed;
	gPos[1] += gSpeed[1]*gElapsed;
	gPos[2] += gSpeed[2]*gElapsed;
	if (gPos[1] < -60) {initGame();}
	gSpeed = [0,0,0];
	
	// Bullets And Enemies Collisions
	for (var i=gBulletList.length-1;i>=0;i--){	 
		for (var y=gEnemieList.length-1;y>=0;y--){
			bulletPos = gBulletList[i][0];
			enemiePos = gEnemieList[y][0];
			if 	((Math.abs(bulletPos[0]-enemiePos[0]) < 1.0) &&
				(Math.abs(bulletPos[1]-enemiePos[1]) < 1.0) &&
				(Math.abs(bulletPos[2]-enemiePos[2]) < 1.0)){
					gBulletList.splice(i,1);
					gEnemieList.splice(y,1);
					break
			}			
		}
	}	

	// Camera managment
	var lookAtMatrix = mat4.create();
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
	viewPos = [gPos[0] + gDir[0],gPos[1] + gDir[1],gPos[2] + gDir[2]];
	mat4.lookAt(lookAtMatrix,gPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)

	// init mvMAtrix
	mat4.identity(mvMatrix)
	setMatrixUniforms();
	
	// Center Cube
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);

	// Center Rotation Cube
	mvPushMatrix();	
	mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim)/2, [0, 1, 0]);
	mat4.scale(mvMatrix,mvMatrix,[2.0,2.0,2.0])
	mat4.translate(mvMatrix,mvMatrix, [10,1,0]);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	// Ground
	mvPushMatrix();	
	mat4.scale(mvMatrix,mvMatrix,[50.0,0.1,50.0])
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	// // Bullets	
	for (var id in gBulletList) {
		bulletPos = gBulletList[id][0];
		bulletDir = gBulletList[id][1];
		bulletPos[0] += gElapsed*100*bulletDir[0];
		bulletPos[1] += gElapsed*100*bulletDir[1];
		bulletPos[2] += gElapsed*100*bulletDir[2];
		mvPushMatrix()	;
		mat4.translate(mvMatrix,mvMatrix, bulletPos);
		mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim)*5, [1, 1, 1]);
		mat4.scale(mvMatrix,mvMatrix,[0.5,0.5,0.25]);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();
	}

	// // Enemies	
	for (var id in gEnemieList) {
		
		enemiePos = gEnemieList[id][0];
		enemieDir = gEnemieList[id][1];
		enemieSpeed = gEnemieList[id][2];
		enemieDir[0] = gPos[0] - enemiePos[0];
		enemieDir[1] = gPos[1] - enemiePos[1];
		enemieDir[2] = gPos[2] - enemiePos[2];
		dist = vec3.length(enemieDir);
		vec3.normalize(enemieDir,enemieDir);
		if (dist > 20)
		{
			enemiePos[0] += (gElapsed*enemieSpeed[0] + gElapsed*10*enemieDir[0]);
			enemiePos[1] += (gElapsed*enemieSpeed[1] + gElapsed*10*enemieDir[1]);
			enemiePos[2] += (gElapsed*enemieSpeed[2] + gElapsed*10*enemieDir[2]);
			enemieSpeed[0] = gElapsed*10*enemieDir[0];
			enemieSpeed[1] = gElapsed*10*enemieDir[1];
			enemieSpeed[2] = gElapsed*10*enemieDir[2];
			gAnimBody += gElapsed*100;
		}
		else
		{

			gAnimGuns  += gElapsed*100;
		}
		

		mvPushMatrix();
		newPos = [-(enemiePos[0]+enemieDir[0]),-(enemiePos[1]+enemieDir[1]),enemiePos[2]+enemieDir[2]];
		mat4.translate(mvMatrix,mvMatrix, enemiePos);
		console.log(enemieDir)
		mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],enemieDir,[0,1,0]);
		mat4.invert(lookAtMatrix,lookAtMatrix);
		mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
		// mat4.rotate(mvMatrix, degToRad(-angleX), [1, 0, 0]);
		setMatrixUniforms();

		mvPushMatrix();
		mat4.translate(mvMatrix,mvMatrix, [1.25, 0, 0]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnimGuns*2), [0, 0, 1]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,2.0,0.25]);
		setMatrixUniforms();	
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();

		mvPushMatrix();
		mat4.translate(mvMatrix,mvMatrix, [-1.25, 0, 0]);			
		mat4.rotate(mvMatrix,mvMatrix, degToRad(-gAnimGuns*2), [0, 0, 1]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,2.0,0.25]);
		setMatrixUniforms();	
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();
		
		mvPushMatrix();
		
		mat4.translate(mvMatrix,mvMatrix, [0, 0, 0.5]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad((gAnimBody)), [1, 0, 0]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);	
		mat4.scale(mvMatrix,mvMatrix,[1.0,1.0,1.0]);	
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();		
		
		
		mvPopMatrix();
		
	}

}
