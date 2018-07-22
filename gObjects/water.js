
var waterYLevel=-28.5;

function waterInit()
{

}


function checkCollision(pPos1,pPos2)
{
       
}


function waterGetCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
	var collision = pCollision;
	if ((pRayPoint1[1]>=waterYLevel) && (pRayPoint2[1]<waterYLevel))
	{
		var collision = [pRayPoint2[0],waterYLevel,pRayPoint2[0]];	
	}
	return collision;
}

function waterIsUnder(y)
{
	return (y<waterYLevel);
}

function waterDraw()
{

    shaderWaterY = waterYLevel;
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix,mvMatrix, [0.0,-40.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[2000.0,10.0,2000.0]);
	
	gl.uniform1f (shaderProgram.counter, shaderCounter);
	gl.uniform1f (shaderProgram.waterY, shaderWaterY);
	cubeDraw(shaderProgram);
    shaderWaterY = -1000;
}