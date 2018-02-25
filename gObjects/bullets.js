

var gBulleFireTimer=0;
var gBulletList = [];

function bulletsInit()
{

	gBulletList = [];
}

function bulletsNew()
{
    gBulleFireTimer += gElapsed*50;
    if (gBulleFireTimer > 10) 
    {
        gBulleFireTimer=0;
        mvVector =  vec3.create();
        vec3.cross(mvVector,gDir,[0,1,0]);
        gBulletList.push([[gPos[0] + gDir[0]*6 + mvVector[0]*2,gPos[1]+gDir[1]*6 ,gPos[2]+gDir[2]*6  + mvVector[2]*2],[gDir[0],gDir[1],gDir[2]]]);
        gBulletList.push([[gPos[0] + gDir[0]*6 - mvVector[0]*2,gPos[1]+gDir[1]*6 ,gPos[2]+gDir[2]*6  - mvVector[2]*2],[gDir[0],gDir[1],gDir[2]]]);

        if (gBulletList.length > 20) { gBulletList.shift(); gBulletList.shift();}
    }
}

function bulletsDraw()
{
	
	shaderVertexColorVector = [1.0,1.0,1.0,1.0];
	for (var id in gBulletList) {
		bulletPos = gBulletList[id][0];
		bulletDir = gBulletList[id][1];
		bulletPos[0] += gElapsed*100*bulletDir[0];
		bulletPos[1] += gElapsed*100*bulletDir[1];
		bulletPos[2] += gElapsed*100*bulletDir[2];
        mat4.identity(mvMatrix)
		mat4.translate(mvMatrix,mvMatrix, bulletPos);
		mat4.rotate(mvMatrix,mvMatrix, degToRad(gAnim)*5, [1, 1, 1]);
		mat4.scale(mvMatrix,mvMatrix,[0.2,0.2,0.2]);
		cubeDraw(shaderProgram);
	}
}