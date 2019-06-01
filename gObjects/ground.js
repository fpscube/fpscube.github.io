
var groundVertexBuffer;
var groundNormalBuffer;
var groundIndiceBuffer;
var groundPositions;
var groundNormals;
var groundIndices;
var groundSectorInst;
var groundWaterYLevel=-29.5;
var groundShaderProgram;
var groundShaderNormalProgram;


var groundVertexShader = ` 
	attribute vec4 aVertexPosition;
	attribute vec3 aVertexNormal;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uMVInverseTransposeMatrix;    
	varying vec3 v_normal;  
	varying vec4 v_position;  
	void main() {

	v_position = uMVMatrix * aVertexPosition;

	// Multiply the position by the matrix.
  gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	// orient the normals and pass to the fragment shader
	v_normal =normalize( mat3(uMVInverseTransposeMatrix) * aVertexNormal);

	}
`;
var groundFragmentShader = `
precision lowp float;  
    varying vec3 v_normal;   
    varying vec4 v_position;      
    uniform vec4 uVertexColor;    
    uniform float uCounter; 
    uniform float uWaterY;
    

    void main() {
      float light;
      float lightWater=1.0;
      float waterIndex=0.0;
      vec4 colorGround;
      vec4 colorWater;
      vec4 color;

      if(v_position.y < uWaterY) 
      {
        float dist = length(vec3(v_position));
        float dist2 = length(vec3(v_position) - vec3(1000.0,0.0,5000.0));
        float dist3 = length(vec3(v_position) - vec3(5000.0,0.0,300.0));
        waterIndex = 0.0 -(v_position.y - uWaterY) ;
        if (waterIndex>1.0) waterIndex = 1.0;
        if (waterIndex<0.0) waterIndex = 0.0;
        float x = (sin((dist+ 2.0*uCounter)/30.0) + sin((dist2+ 3.0*uCounter)/35.0) + sin((dist3 + 10.0*uCounter)/60.0))/6.0 + 0.5;
        if (dist>5000.0) x=0.2;
        lightWater = x*0.5 ;
      }
  
      light = dot(v_normal, vec3(0.0,1.0,0.0)); 
      
      colorGround = vec4(0.1,0.1,0.1,uVertexColor.a); 
      colorWater = vec4(0.1,0.1,0.1,uVertexColor.a); 
      
      colorGround += vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,0.0) ;
      if(lightWater>0.45) lightWater = 0.45  + (lightWater -0.45) *20.0;
      colorWater += vec4(0.025*lightWater,0.100*lightWater,0.170*lightWater,0.0) ;


      color = mix(colorGround,colorWater,waterIndex);

      
     gl_FragColor = vec4(color.x,color.y,color.z,1.0);
      
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
    var collision = [pRayPoint2[0],groundYLevel2,pRayPoint2[2]];	
    
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

function groundInitShaders(vertexShaderStr,fragmentShaderStr) {

	var vertexShader = shaderCompil(vertexShaderStr,gl.VERTEX_SHADER);
	var fragmentShader = shaderCompil(fragmentShaderStr,gl.FRAGMENT_SHADER);

	var outShaderProgram = gl.createProgram();
	gl.attachShader(outShaderProgram, vertexShader);
	gl.attachShader(outShaderProgram, fragmentShader);
	gl.linkProgram(outShaderProgram);

	if (!gl.getProgramParameter(outShaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.uniform1i(outShaderProgram.texture, 0)

	outShaderProgram.vertexPositionAttribute = gl.getAttribLocation(outShaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(outShaderProgram.vertexPositionAttribute);

	outShaderProgram.vertexNormalAttribute = gl.getAttribLocation(outShaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(outShaderProgram.vertexNormalAttribute);

  outShaderProgram.vertexColorAttribute = gl.getUniformLocation(outShaderProgram, "uVertexColor");
	outShaderProgram.counter = gl.getUniformLocation(outShaderProgram, "uCounter");
	outShaderProgram.waterY = gl.getUniformLocation(outShaderProgram, "uWaterY");
	outShaderProgram.pMatrixUniform = gl.getUniformLocation(outShaderProgram, "uPMatrix");
	outShaderProgram.mvMatrixUniform = gl.getUniformLocation(outShaderProgram, "uMVMatrix");
	outShaderProgram.mvInverseTransposeMatrix = gl.getUniformLocation(outShaderProgram, "uMVInverseTransposeMatrix");

	return outShaderProgram;
}

var gGroundShaderNormalProgram=-1;

class CGroundSector
{
  constructor(pPosX,pPosZ,pSize,pRes)
  {
    
   var groundPositions=[];
   var groundNormals=[];
   var groundIndices=[];

   if(gGroundShaderNormalProgram == -1)
   {
    gGroundShaderNormalProgram = initShaders(groundVertexShader,groundFragmentShader);
   }
   
   groundShaderNormalProgram = gGroundShaderNormalProgram;
   groundShaderProgram = groundShaderNormalProgram;
  
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
    shaderVertexColorVector = [0.8,0.8,0.4,1.0];
    mat4.identity(mvMatrix)    
    
    if(gCurrentShaderProgram != groundShaderProgram) 
    {
        gl.useProgram(groundShaderProgram);
        gCurrentShaderProgram = groundShaderProgram;
        gl.uniform1i(groundShaderProgram.texture, 0);
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
  
  gl.disable(gl.CULL_FACE);   
  groundWaterDraw(); 
  gl.enable(gl.CULL_FACE);   
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
	mat4.translate(mvMatrix,mvMatrix, [0.0,groundWaterYLevel-32.0,0.0]);	
	mat4.scale(mvMatrix,mvMatrix,[9000.0,30.0,9000.0]);	

	gl.uniform1f (groundShaderProgram.counter, shaderCounter);
	gl.uniform1f (groundShaderProgram.waterY, shaderWaterY);
	Sphere.Draw(groundShaderProgram);
  shaderWaterY = -1000;


  
}