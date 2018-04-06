

var gEnemiesList = [];
var gEnemiesMax = 10;
var gEnemiesCollisionId = -1;
var gEnemiesCollisionDist = -1;
var gEnemiesTargetHist = [];

function _enemiesAdd()
{
	if (gEnemiesList.length < gEnemiesMax)
	{	
		angle = Math.random()*2*Math.PI;
		gEnemiesList.push([[Math.cos(angle)*100,20,Math.sin(angle)*100],[0,0,0],10,[0,0,0],[3,0]]);
	}
}


function enemiesInit(pMaxEnemies)
{
	gEnemiesMax = pMaxEnemies;
	gEnemiesList = [];
	gEnemiesTargetHist = [];
	_enemiesAdd();
	setInterval(_enemiesAdd,1000);	
}

function enemiesGetCollisionId()
{
	return gEnemiesCollisionId;
}

function enemiesUpdate()
{
	
	var gElapsed = timeGetElapsedInS();
	
	//Enemies ray collision
	gEnemiesCollisionId = -1;
	gEnemiesCollisionDist = 0xFFFFFFF;
	for (var i=gEnemiesList.length-1;i>=0;i--){
		var enemiePos = gEnemiesList[i][0];		
		var enemieVector =  vec3.create();	
		var fireVector =  vec3.create();
		var distVector  =  vec3.create();
		vec3.subtract(enemieVector,enemiePos,gPos);
		var fireDist = vec3.dot(enemieVector,gDir);
		var enemieDist = vec3.distance(enemiePos,gPos);		
		dist = Math.sqrt(enemieDist**2 - fireDist**2);   
		if (dist < 1 && enemieDist<gEnemiesCollisionDist) gEnemiesCollisionId = i;
	}

	for (var i=gEnemiesList.length-1;i>=0;i--){
		//enemies damage
		lifes = gEnemiesList[i][4];
		if (lifes[1]>0)
		{			
			lifes[1]-= gElapsed;
		}
		
		if(i!=gEnemiesCollisionId) continue;
		if (mediaIsKey("Fire") && (lifes[1]<=0))
		{
			lifes[0]-=1;
			lifes[1]=0.2;
			// delete enemie if no more life
			if (lifes[0]<0)	gEnemiesList.splice(i,1);	
		}
	}


	// Enemies Position
	for (var i=gEnemiesList.length-1;i>=0;i--){
		var enemiePos = gEnemiesList[i][0];
		var enemieDir = gEnemiesList[i][1];
		var enemieSpeed = gEnemiesList[i][2];
		var animCounter = gEnemiesList[i][3];

		//Process history of target position to simulate reaction time of 3s
		var targetPos=[gPos[0],gPos[1],gPos[2]];
		gEnemiesTargetHist.push([timeGetCurrentInS(),targetPos]);
		if ( timeGetCurrentInS() - gEnemiesTargetHist[0][0] > 3) targetPos = gEnemiesTargetHist.shift()[1];
	
		vec3.subtract(enemieDir,targetPos,enemiePos);
		var dist = vec3.length(enemieDir);
		vec3.normalize(enemieDir,enemieDir);

		collision=false 
		for (var y=0;y<gEnemiesList.length;y++)
		{
			if (i==y) continue;
			distVect = vec3.create();
			vec3.subtract(distVect,gEnemiesList[i][0],gEnemiesList[y][0]);
			distEn1En2 = vec3.length(distVect);
			vec3.subtract(distVect,gPos,gEnemiesList[y][0]);		
			distPosEn2 = vec3.length(distVect);	
			vec3.subtract(distVect,gPos,gEnemiesList[i][0]);		
			distPosEn1 = vec3.length(distVect);	
			if(distEn1En2 <4 && distPosEn1>distPosEn2) collision=true ;

		}

		if(collision) continue;
		
		if (dist > 20)
		{
			enemieSpeed = 10;
			animCounter[0] += gElapsed*100
		}
		else
		{			
			enemieSpeed = 0;
			animCounter[1] += gElapsed*200;
			animCounter[2] += gElapsed;
			if (animCounter[2] > 1)
			{
				animCounter[2]=0;
				gBulletList.push([[enemiePos[0]+enemieDir[0]*2,enemiePos[1]+enemieDir[1]*2,enemiePos[2]+enemieDir[2]*2],enemieDir]);
			}

		}
		
		enemiePos[0] += gElapsed*enemieSpeed*enemieDir[0];
		enemiePos[1] += gElapsed*enemieSpeed*enemieDir[1];
		enemiePos[2] += gElapsed*enemieSpeed*enemieDir[2];
		enemiePosGroundY = groundGetY(enemiePos[0] ,enemiePos[2]) + 10.0;
		if (enemiePos[1] < enemiePosGroundY) enemiePos[1]= enemiePosGroundY;

	}

}


function enemiesDraw()
{
	setMatrixUniforms(shaderProgram);

	// Ennemies draw 
	mat4.identity(mvMatrix)
	var lookAtMatrix = mat4.create();	
	for (var id in gEnemiesList) {
		var enemiePos = gEnemiesList[id][0];
		var enemieDir = gEnemiesList[id][1];
		var animCounter = gEnemiesList[id][3];
		var damageCounter = gEnemiesList[id][4][1];
		
		if (damageCounter<=0)
		{
			shaderVertexColorVector = [0.4,0.4,0.4,1.0];
		}
		else
		{
			shaderVertexColorVector = [1.0,0.0,0.0,0.8];
		}

		mvPushMatrix();
		mat4.translate(mvMatrix,mvMatrix, enemiePos);
		mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],enemieDir,[0,1,0]);
		mat4.invert(lookAtMatrix,lookAtMatrix);
		mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
		// mat4.rotate(mvMatrix, degToRad(-angleX), [1, 0, 0]);

		mvPushMatrix();
		mat4.translate(mvMatrix,mvMatrix, [1.25, 0, 0]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(animCounter[1]), [0, 0, 1]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,2.0,0.25]);
		cubeDraw(shaderProgram);
		mvPopMatrix();

		mvPushMatrix();
		mat4.translate(mvMatrix,mvMatrix, [-1.25, 0, 0]);			
		mat4.rotate(mvMatrix,mvMatrix, degToRad(-animCounter[1]), [0, 0, 1]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);
		mat4.scale(mvMatrix,mvMatrix,[0.25,2.0,0.25]);
		cubeDraw(shaderProgram);
		mvPopMatrix();
		
		mvPushMatrix();
		
		mat4.translate(mvMatrix,mvMatrix, [0, 0, 0.5]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(animCounter[0]), [1, 0, 0]);	
		mat4.rotate(mvMatrix,mvMatrix, degToRad(90), [1, 0, 0]);	
		mat4.scale(mvMatrix,mvMatrix,[1.0,1.0,1.0]);	
		cubeDraw(shaderProgram);
		mvPopMatrix();		
		
		
		mvPopMatrix();
		
	}
}