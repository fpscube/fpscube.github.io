// Game Model
var gPosX ; var gPosY ; var gPosZ ;
var gAngleY=0; var gAngleX=0; 
var gSpeedY;
var gKeyPressed={};
var gLastTime=0;
var gAnim=0;
var gElapsed=0;
var gBulletList = [];
var gEnemieList = [];

// ######### Event Handler ##############// 

function updatePosition(e) {
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	if (!isChrome || ( Math.abs(e.movementX) < 150 && Math.abs(e.movementY)< 150))
	{
		gAngleY += e.movementX*0.1;
		gAngleX += e.movementY*0.1;
	}
}

function mediaSetKeyDownFct(event){gKeyPressed[event.key]=1;}
function mediaSetKeyUpFct(event){gKeyPressed[event.key]=0;}
function mediaIsKey(name){return (gKeyPressed[name]==1);}

function mediaSetMouseUpFct(event){return;}
function mediaSetMouseDownFct(event){
	if (event.button==0)  gBulletList.push([gPosX,gPosY,gPosZ,gAngleY - 90,-gAngleX]);
	if (event.button==2)  gEnemieList.push([0,2 ,-60,gAngleY - 90,-gAngleX]);
	if (gBulletList.length > 20)  gBulletList.shift();	
}


// ######### Init ##############// 

function initGame() {
	// game data Init
	gPosX = 0; gPosY = 6; gPosZ = 40; gAngleY=0; gAngleX=0 ; gSpeedY = 0;
	gBulletList = [];
	gEnemieList = [];	

	// gl init
	gl.clearColor(0.0, 0.0, 0.0, 1.0);	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);

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

}

// ######### Draw ##############// 

function drawGame() {

	//Time counter update
	var timeNow =  new Date().getTime();
	gElapsed = (timeNow - gLastTime)/1000; 
	gLastTime = timeNow; 	
	gAnim += 180 * gElapsed

	// Clear Display
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Deplacement
	if(mediaIsKey("ArrowLeft") || mediaIsKey("Left")){gPosZ-=gElapsed*20*Math.cos(degToRad(-gAngleY+90));gPosX-=gElapsed*20*Math.sin(degToRad(-gAngleY+90));}
	if(mediaIsKey("ArrowRight") || mediaIsKey("Right")){gPosZ-=gElapsed*20*Math.cos(degToRad(-gAngleY-90));gPosX-=gElapsed*20*Math.sin(degToRad(-gAngleY-90));}
	if(mediaIsKey("ArrowUp") || mediaIsKey("Up")){gPosZ-=gElapsed*20*Math.cos(degToRad(-gAngleY));gPosX-=gElapsed*20*Math.sin(degToRad(-gAngleY));}
	if(mediaIsKey("ArrowDown") || mediaIsKey("Down")){gPosZ-=gElapsed*20*Math.cos(degToRad(-gAngleY+180));gPosX-=gElapsed*20*Math.sin(degToRad(-gAngleY+180));}	
	
	// Gravity
	if (gPosX > 50 || gPosX < -50  || gPosZ < -50  || gPosZ > 50  )  gSpeedY = -1000*gElapsed ; 
	gPosY += gSpeedY*gElapsed;
	if (gPosY < -60) {	initGame();}
	
	// Bullets And Enemies Collisions
	for (var i=gBulletList.length-1;i>=0;i--){	 
		for (var y=gEnemieList.length-1;y>=0;y--){
			if 	((Math.abs(gBulletList[i][0]-gEnemieList[y][0]) < 1.0) &&
				(Math.abs(gBulletList[i][1]-gEnemieList[y][1]) < 1.0) &&
				(Math.abs(gBulletList[i][2]-gEnemieList[y][2]) < 1.0)){
					gBulletList.splice(i,1);
					gEnemieList.splice(y,1);
					break
			}			
		}
	}	

	// Camera managment
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
	mat4.rotate(pMatrix,degToRad(gAngleX), [1, 0, 0]);
	mat4.rotate(pMatrix,degToRad(gAngleY), [0, 1, 0]);
	mat4.translate(pMatrix, [-gPosX, -gPosY ,-gPosZ ]);
	
	// init mvMAtrix
	mat4.identity(mvMatrix)
	setMatrixUniforms();
	
	// Center Cube
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);

	// Center Rotation Cube
	mvPushMatrix();	
	mat4.rotate(mvMatrix, degToRad(gAnim)/2, [0, 1, 0]);
	mat4.scale(mvMatrix,[2.0,2.0,2.0])
	mat4.translate(mvMatrix, [10,1,0]);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	// Ground
	mvPushMatrix();	
	mat4.scale(mvMatrix,[50.0,0.1,50.0])
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	// Bullets	
	for (var id in gBulletList) {
		bulletPos = gBulletList[id];
		var angleY = bulletPos[3]
		var angleX = bulletPos[4]
		bulletPos[0] +=  gElapsed*100* Math.cos(degToRad(angleY ))*Math.cos(degToRad(angleX));
		bulletPos[2] +=  gElapsed*100* Math.sin(degToRad(angleY ))*Math.cos(degToRad(angleX));
		bulletPos[1] +=  gElapsed*100* Math.sin(degToRad(angleX));
		mvPushMatrix()	;
		mat4.translate(mvMatrix, bulletPos);
		mat4.rotate(mvMatrix, degToRad(gAnim)*2, [1, 1, 1]);
		mat4.scale(mvMatrix,[0.5,0.5,0.25]);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();
	}

	// Enemies	
	for (var id in gEnemieList) {
		enemiePos = gEnemieList[id];
		var angleY = enemiePos[3]
		var angleX = enemiePos[4]
		enemiePos[0] -=  gElapsed*10*Math.cos(degToRad(angleY ))*Math.cos(degToRad(angleX));
		enemiePos[1] -=  gElapsed*10* Math.sin(degToRad(angleX));
		enemiePos[2] -=  gElapsed*10*Math.sin(degToRad(angleY ))*Math.cos(degToRad(angleX));
		mvPushMatrix();
		mat4.translate(mvMatrix, enemiePos);
		mat4.rotate(mvMatrix, degToRad(-angleY+90), [0, 1, 0]);
		mat4.rotate(mvMatrix, degToRad(-angleX), [1, 0, 0]);
		setMatrixUniforms();
		mvPushMatrix();
		
		mat4.translate(mvMatrix, [0, 0, -0.5]);	
		mat4.rotate(mvMatrix, degToRad(gAnim), [0, 0, 1]);	
		mat4.rotate(mvMatrix, degToRad(90), [1, 0, 0]);
		mat4.scale(mvMatrix,[0.25,1.0,0.25]);
		setMatrixUniforms();	
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();
		
		mvPushMatrix();
		
		mat4.translate(mvMatrix, [0, 0, 0.5]);	
		mat4.rotate(mvMatrix, degToRad((gAnim+45)), [0, 0, 1]);	
		mat4.rotate(mvMatrix, degToRad(90), [1, 0, 0]);	
		mat4.scale(mvMatrix,[1.0,1.0,1.0]);	
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();		
		
		
		mvPopMatrix();
		
	}

}
