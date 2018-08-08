
var groundVertexBuffer;
var groundNormalBuffer;
var groundIndiceBuffer;
var groundPositions;
var groundNormals;
var groundIndices;
var groundSectorInst;
var groundWaterYLevel=-28.5;
var groundShaderProgram;


var groundVertexShader = `    
	attribute vec4 aVertexPosition;
	attribute vec3 aVertexNormal;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uMVInverseTransposeMatrix;    
	varying vec3 v_normal; 
	varying vec4 a_position;   
	varying vec4 v_position; 
	void main() {

	a_position= aVertexPosition;

	// Multiply the position by the matrix.
	v_position = uMVMatrix * aVertexPosition;
	gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	// orient the normals and pass to the fragment shader
	v_normal =normalize( mat3(uMVInverseTransposeMatrix) * aVertexNormal);

	}
`;
var groundFragmentShader = `
    precision lowp float;
    
    varying vec3 v_normal;   
    varying vec4 v_position;   
	varying vec4 a_position;    
    uniform vec4 uVertexColor;    
    uniform float uCounter; 
    uniform float uWaterY;
    
    void main() {
      float light;
      float lightWater;
      float waterIndex=0.0;
      vec4 colorGround;
      vec4 colorWater;

      waterIndex = 0.0 -(v_position.y - uWaterY) ;
      if (waterIndex>1.0) waterIndex = 1.0;
      if (waterIndex<0.0) waterIndex = 0.0;

      float dist = sqrt(v_position.x*v_position.x + v_position.z*v_position.z);
      float x = sin((dist+ 2.0*uCounter)/17.0)/2.0+ 0.50 + sin((dist+ 3.0*uCounter)/35.0)/2.0+ 0.50 + sin((v_position.x + 10.0*uCounter)/60.0)/2.0+0.50;
      float z = cos((dist+ uCounter)/7.0)/2.0+ 0.50 + cos((dist+ 4.0*uCounter)/15.0)/2.0+0.50 + cos((dist+ 6.0*uCounter)/35.0)/2.0+ 0.50 +  cos((v_position.x + 10.0*uCounter)/60.0)/2.0+0.50;
      lightWater = dot(normalize(vec3(x,8.0,z)), vec3(0.0,1.0,0.0));
  
      light = dot(v_normal, vec3(0.0,1.0,0.0)); 
      
      colorGround = vec4(0.1,0.1,0.1,uVertexColor.a); 
      colorWater = vec4(0.1,0.1,0.1,uVertexColor.a); 
      
     
      colorGround += vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,0.0) ;
      colorWater += vec4(0.108*lightWater,0.409*lightWater,0.627*lightWater,0.0) ;
      

      
      gl_FragColor = mix(colorGround,colorWater,waterIndex);
    }
`;



function groundGetY(x,z)
{
 y = Math.sin(x/50)*5+Math.sin(z/50)*5 + Math.sin(x/90)*9 + Math.sin(z/90)*9 + Math.sin(x/150)*15 + Math.sin(z/150)*15 -(x/200)**2 -(z/200)**2;
 //y = ((x/100)**2)+((z/100)**2);

  return(y);
}

function groundGetNormalVec(x,z)
{
  vector1 =  vec3.create();
  vector2 =  vec3.create();
  vector3 =  vec3.create();
  vec3.normalize(vector1,[-0.15,(5*50*Math.cos(x/50))/(50**2)+(9*90*Math.cos(x/90))/(90**2)+(15*150*Math.cos(x/150))/(150**2),0.0]);
  vec3.normalize(vector2,[0,(5*50*Math.cos(z/50))/(50**2)+(9*90*Math.cos(z/90))/(90**2)+(15*150*Math.cos(z/150))/(150**2),0.15 ]);
  //vec3.normalize(vector1,[-0.25, (2*100*x)/(100**2*100),0.0]);
//  vec3.normalize(vector2,[0,(2*100*z)/(100**2*100),0.25]);
  vec3.cross(vector3,vector1,vector2)   ;

// vec3.normalize(normVector,[1, -Math.cos(x/10)/10   - Math.cos(z/10)/10  ,1]);
  return(vector3);
}

function groundGetCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
  var collision = pCollision;
  var groundYLevel1 = groundGetY(pRayPoint1[0],pRayPoint1[2]);
  var groundYLevel2 = groundGetY(pRayPoint2[0],pRayPoint2[2]);
	if ((pRayPoint1[1]>=groundYLevel1) && (pRayPoint2[1]<groundYLevel2))
	{
    var collision = [pRayPoint2[0],groundYLevel2,pRayPoint2[0]];	
    
    if (pCollision!=null)
    {
      var prevSquaredDist = vec3.squaredDistance(pRayPoint1,pCollision);
      var squaredDist = vec3.squaredDistance(pRayPoint1,collision);
      if(prevSquaredDist<squaredDist)
      {
          collision = pCollision;
      }
    }

	}
	return collision;
}



class CGroundSector
{
  constructor(pPosX,pPosZ,pSize,pRes)
  {
    
   var groundPositions=[];
   var groundNormals=[];
   var groundIndices=[];

   groundShaderProgram = initShaders(groundVertexShader,groundFragmentShader);
  
    for (var ix=0;ix<=pRes;ix+=1)
    {    
      for (var iz=0;iz<=pRes;iz+=1)
      {
        var x = pPosX + ix*pSize/pRes - pSize/2;
        var z = pPosZ + iz*pSize/pRes - pSize/2;
        
        // compute ground position
        groundPositions.push(x);
        groundPositions.push(groundGetY(x,z));
        groundPositions.push(z);
  
        
          // compute normal position
          var normVector = groundGetNormalVec(x,z);
          groundNormals.push(normVector[0]);
          groundNormals.push(normVector[1]);
          groundNormals.push(normVector[2]);
  
        if (((ix+1)<=pRes) && ((iz+1)<=pRes))
        {
          groundIndices.push(iz+ix*(pRes+1));
          groundIndices.push(iz+1+ix*(pRes+1));
          groundIndices.push(iz+(ix+1)*(pRes+1));
  
          groundIndices.push(iz+1+ix*(pRes+1));
          groundIndices.push(iz+1+(ix+1)*(pRes+1));
          groundIndices.push(iz+(ix+1)*(pRes+1));
         
        }
      }
    }
  
    
    gl.useProgram(groundShaderProgram);
  
    // Vertex Buffer
    this.groundVertexBuffer = gl.createBuffer();
    this.groundVertexBuffer.itemSize = 3;
    this.groundVertexBuffer.numItems = groundPositions.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPositions), gl.STATIC_DRAW);	
  
    // Normal Buffer	
    this.groundNormalBuffer = gl.createBuffer();
    this.groundNormalBuffer.itemSize = 3;
    this.groundNormalBuffer.numItems = groundNormals.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundNormals), gl.STATIC_DRAW);	
      
    // Index Buffer
    this.groundIndiceBuffer = gl.createBuffer ();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.groundIndiceBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(groundIndices), gl.STATIC_DRAW);

    this.nbElement = groundIndices.length;
  }
   
  drawSector()
  {

    gCurrentGraphicalObject = 0;

    shaderWaterY = -2008.5;
    shaderVertexColorVector = [1.0,1.0,0.5,1.0];
    mat4.identity(mvMatrix)    
    
    if(gCurrentShaderProgram != groundShaderProgram) 
    {
        gl.useProgram(groundShaderProgram);
        gCurrentShaderProgram = groundShaderProgram;
    }

  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundVertexBuffer);
    gl.vertexAttribPointer(groundShaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundNormalBuffer);
    gl.vertexAttribPointer(groundShaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.groundIndiceBuffer);
        		
    gl.uniform4fv (groundShaderProgram.vertexColorAttribute, shaderVertexColorVector);
    
    gl.uniformMatrix4fv(groundShaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(groundShaderProgram.pMatrixUniform, false, pMatrix);
    
    mat4.invert(mvInverseMatrix,mvMatrix);
    mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
    gl.uniformMatrix4fv(groundShaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);

    
    gl.drawElements(gl.TRIANGLES,this.nbElement, gl.UNSIGNED_SHORT,0);
  }


}


groundSize = 10000;
groundRes = 10;

function groundInit()
{
  groundSectorInst = [];
  for (ix=0;ix<groundRes;ix++)
  {
    groundSectorInst[ix]=[];
    for (iz=0;iz<groundRes;iz++)
    {
      var x = -groundSize/2 +  ix*groundSize/groundRes;
      var z = -groundSize/2 +  iz*groundSize/groundRes;
      groundSectorInst[ix][iz] = new CGroundSector(x,z,groundSize/groundRes,40);

    }
  }
}


function groundDraw(pPosX,pPosZ)
{
  var step = groundSize/groundRes;
  var ix = Math.floor(pPosX/step + 0.5) + groundRes/2;
  var iz = Math.floor(pPosZ/step + 0.5) + groundRes/2;

  groundSectorInst[ix][iz].drawSector();
  groundSectorInst[ix][iz-1].drawSector();
  groundSectorInst[ix][iz+1].drawSector();
  groundSectorInst[ix-1][iz].drawSector();
  groundSectorInst[ix-1][iz-1].drawSector();
  groundSectorInst[ix-1][iz+1].drawSector();
  groundSectorInst[ix+1][iz].drawSector();
  groundSectorInst[ix+1][iz-1].drawSector();
  groundSectorInst[ix+1][iz+1].drawSector();

  groundWaterDraw();
  
}



function groundWaterGetCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
	var collision = pCollision;
	if ((pRayPoint1[1]>=groundWaterYLevel) && (pRayPoint2[1]<groundWaterYLevel))
	{
		var collision = [pRayPoint2[0],groundWaterYLevel,pRayPoint2[0]];	
		if (pCollision!=null)
		{
		  var prevSquaredDist = vec3.squaredDistance(pRayPoint1,pCollision);
		  var squaredDist = vec3.squaredDistance(pRayPoint1,collision);
		  if(prevSquaredDist<squaredDist)
		  {
			  collision = pCollision;
		  }
		}
	}
	return collision;
}

function groundIsUnderWater(y)
{
	return (y<groundWaterYLevel);
}

function groundWaterDraw()
{

  shaderWaterY = groundWaterYLevel;
	mat4.identity(mvMatrix); 
	mat4.translate(mvMatrix,mvMatrix, [0.0,groundWaterYLevel-2.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[10000.0,0.0,10000.0]);	
  mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [1, 0, 0]);  

	gl.uniform1f (groundShaderProgram.counter, shaderCounter);
	gl.uniform1f (groundShaderProgram.waterY, shaderWaterY);
	squareDraw(groundShaderProgram);
  shaderWaterY = -1000;
  
}