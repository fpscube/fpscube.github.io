// ## transformer code avec la classe vect4 pour les positions et les vitesses ## => download glmatrix


vPos = vec3.create();
vDir = vec3.create();
var hPosX; var hPosY ; var hSpeedY  ;var hPosZ ;var hAngleY=0; var hAngleX=0; var hFire = [];
var gKeyPressed={};
var gLastTime=0;
var gAnim=0;
var hBulletList = [];
var enemieList = [];
var squareTab = [-1.0,0,-1.0,-1.0,0,1.0,1.0,0,-1.0,1.0,0,1.0]

// ######### Media  && Time ##############// 
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

function updatePosition(e) {
	
	if (!isChrome || ( Math.abs(e.movementX) < 150 && Math.abs(e.movementY)< 150))
	{
		hAngleY += e.movementX*0.1;
		hAngleX += e.movementY*0.1;
	}
}
function mediaSetKeyDownFct(event){gKeyPressed[event.key]=1;}
function mediaSetKeyUpFct(event){gKeyPressed[event.key]=0;}
function mediaIsKey(name){return (gKeyPressed[name]==1);}

function time_getAnimCoef(){var timeNow = new Date().getTime();	var elapsedCoef=0;	if (gLastTime != 0) elapsedCoef = (timeNow - gLastTime)/1000; gLastTime = timeNow; return elapsedCoef}
function mediaSetMouseUpFct(event){return;}
function mediaSetMouseDownFct(event){
	if (event.button==0)  hBulletList.push([hPosX,hPosY,hPosZ,hAngleY - 90,-hAngleX]);
	if (event.button==2)  enemieList.push([0,2 ,-60,hAngleY - 90,-hAngleX]);
	if (hBulletList.length > 20)  hBulletList.shift();
	console.log(hBulletList.length);
	
}

function createBuffer(data,itemSize,numItems)
{
	buffer = gl.createBuffer();
	buffer.itemSize = itemSize;
	buffer.numItems = numItems;	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	return buffer;	
}

function initGame() {
	vPos = [0,6,40];
	vDir = [1,0,0];
	console.log (vec3.str(vPos));
	hPosX = 0; hPosY = 6; hPosZ = 40; hAngleY=0; hAngleX=0 ; hSpeedY = 0;
	hBulletList = [];
	enemieList = [];
	mapVertexPositionBuffer 	= createBuffer(gCubePositions,3,24);
	mapVertexNormalBuffer 		= createBuffer(gCubeNormals,3,24);

	// Create and store data into index buffer
	var index_buffer = gl.createBuffer ();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gIndices), gl.STATIC_DRAW);
			  

	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, mapVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	
	//gl init
	gl.clearColor(0.0, 0.0, 0.0, 1.0);	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
	
	
	console.log( gl.viewportWidth);
	console.log( gl.viewportHeight);
}

function drawGame() {

	//init scene
	var elapsed = time_getAnimCoef();
	gAnim += 90 * elapsed
	gAnim += 90 * elapsed
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//hero key move
	if(mediaIsKey("ArrowLeft") || mediaIsKey("Left")){hPosZ-=elapsed*20*Math.cos(degToRad(-hAngleY+90));hPosX-=elapsed*20*Math.sin(degToRad(-hAngleY+90));}
	if(mediaIsKey("ArrowRight") || mediaIsKey("Right")){hPosZ-=elapsed*20*Math.cos(degToRad(-hAngleY-90));hPosX-=elapsed*20*Math.sin(degToRad(-hAngleY-90));}
	if(mediaIsKey("ArrowUp") || mediaIsKey("Up")){hPosZ-=elapsed*20*Math.cos(degToRad(-hAngleY));hPosX-=elapsed*20*Math.sin(degToRad(-hAngleY));}
	if(mediaIsKey("ArrowDown") || mediaIsKey("Down")){hPosZ-=elapsed*20*Math.cos(degToRad(-hAngleY+180));hPosX-=elapsed*20*Math.sin(degToRad(-hAngleY+180));}	
	
	//hero gravity
	if (hPosX > 50 || hPosX < -50  || hPosZ < -50  || hPosZ > 50  )  hSpeedY = -1000*elapsed ; 
	hPosY += hSpeedY*elapsed;
	if (hPosY < -60) {	initGame();}
	
	//bullets and enemies collision
	//hBulletList
	for (var i=hBulletList.length-1;i>=0;i--){	 
		for (var y=enemieList.length-1;y>=0;y--){
			if 	((Math.abs(hBulletList[i][0]-enemieList[y][0]) < 1.0) &&
				(Math.abs(hBulletList[i][1]-enemieList[y][1]) < 1.0) &&
				(Math.abs(hBulletList[i][2]-enemieList[y][2]) < 1.0)){
					hBulletList.splice(i,1);
					enemieList.splice(y,1);
					break
			}			
		}
	}	


	//camera managment
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
	mat4.rotate(pMatrix,degToRad(hAngleX), [1, 0, 0]);
	mat4.rotate(pMatrix,degToRad(hAngleY), [0, 1, 0]);
	mat4.translate(pMatrix, [-hPosX, -hPosY ,-hPosZ ]);
	

	mat4.identity(mvMatrix)
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	
	mvPushMatrix();	
	mat4.rotate(mvMatrix, degToRad(gAnim)/2, [0, 1, 0]);
	mat4.scale(mvMatrix,[2.0,2.0,2.0])
	mat4.translate(mvMatrix, [10,1,0]);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	mvPushMatrix();	
	mat4.scale(mvMatrix,[50.0,0.1,50.0])
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
	mvPopMatrix();	
	
	// draw bullet	
	for (var id in hBulletList) {
		bulletPos = hBulletList[id];
		var angleY = bulletPos[3]
		var angleX = bulletPos[4]
		bulletPos[0] +=  elapsed*100* Math.cos(degToRad(angleY ))*Math.cos(degToRad(angleX));
		bulletPos[2] +=  elapsed*100* Math.sin(degToRad(angleY ))*Math.cos(degToRad(angleX));
		bulletPos[1] +=  elapsed*100* Math.sin(degToRad(angleX));
		mvPushMatrix()	;
		mat4.translate(mvMatrix, bulletPos);
		mat4.rotate(mvMatrix, degToRad(gAnim)*2, [1, 1, 1]);
		mat4.scale(mvMatrix,[0.5,0.5,0.25]);
		setMatrixUniforms();
		gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
		mvPopMatrix();
	}

	// draw enemieshEnemieList
	for (var id in enemieList) {
		enemiePos = enemieList[id];
		var angleY = enemiePos[3]
		var angleX = enemiePos[4]
		enemiePos[0] -=  elapsed*10*Math.cos(degToRad(angleY ))*Math.cos(degToRad(angleX));
		enemiePos[1] -=  elapsed*10* Math.sin(degToRad(angleX));
		enemiePos[2] -=  elapsed*10*Math.sin(degToRad(angleY ))*Math.cos(degToRad(angleX));
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
