
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
var groundHeight;
var groundNormal;
var gGroundShaderNormalProgram=-1;

var groundVertexShader = ` 
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	varying lowp vec4 v_color;  
	void main() {

    // Multiply the position by the matrix.
    gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

    // orient the normals and pass to the fragment shader
    v_color = aVertexColor;

	}
`;
var groundFragmentShader = `
  varying lowp vec4 v_color;       

  void main() {
    gl_FragColor = v_color;
    
  }
`;




function groundGetY(x,z)
{
  y = (Math.sin(x/50)*5+Math.sin(z/50)*5 + Math.sin(x/90)*9 + Math.sin(z/90)*9 + Math.sin(x/150)*15 + Math.sin(z/150)*15 -(x/200)**2 -(z/200)**2 )*1.5+ 30;
  //y = ((x/100)**2)+((z/100)**2);
 
   return(y);

}

function groundGetNormalVec(x,z)
{

  return([0,1,0]);
}

function groundGetCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
  var collision = pCollision;
  var groundYLevel1 = groundGetY(pRayPoint1[0],pRayPoint1[2]);
  var groundYLevel2 = groundGetY(pRayPoint2[0],pRayPoint2[2]);
	if ((pRayPoint1[1]>=groundYLevel1) && (pRayPoint2[1]<groundYLevel2))
	{
    var collision = [pRayPoint2[0],groundYLevel2,pRayPoint2[2],[0,"ground",0]];	
    
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
   var groundColors=[];
   var groundIndices=[];

   if(gGroundShaderNormalProgram == -1)
   {
    gGroundShaderNormalProgram = initShaders(groundVertexShader,groundFragmentShader);
   }
   
   groundShaderNormalProgram = gGroundShaderNormalProgram;
   groundShaderProgram = groundShaderNormalProgram;
  
   groundHeight = [];
   var light = [];

   var trSize = pSize/pRes;

    for (var ix=0;ix<=pRes;ix+=1)
    {    
      groundHeight[ix] = [];
      for (var iz=0;iz<=pRes;iz+=1)
      {
        var x = pPosX + ix*pSize/pRes - pSize/2;
        var z = pPosZ + iz*pSize/pRes - pSize/2;
        groundHeight[ix][iz]=  groundGetY(x,z)
      }
    }
  
    for (var ix=0;ix<=pRes;ix+=1)
    {    
      light[ix] = [];
      for (var iz=0;iz<=pRes;iz+=1)
      {
        var normal = [0,0,0];
        var normalt = [0,0,0];
        var height_11 = groundHeight[ix][iz]
        var vec_00;var vec_01;var vec_02;var vec_10;var vec_12;var vec_20;var vec_21;var vec_22;

        if(ix>0 && iz>0)        vec_00 = [ -trSize,groundHeight[ix-1][iz-1]-height_11,-trSize];
        if(ix>0)                vec_01 = [ -trSize,groundHeight[ix-1][iz+0]-height_11, 0];
        if(ix>0 && iz<pRes)     vec_02 = [ -trSize,groundHeight[ix-1][iz+1]-height_11, trSize];
        if(iz>0)                vec_10 = [ 0,groundHeight[ix+0][iz-1]-height_11,-trSize];
        if(iz<pRes)             vec_12 = [ 0,groundHeight[ix+0][iz+1]-height_11, trSize];        
        if(ix<pRes && iz>0)     vec_20 = [ trSize,groundHeight[ix+1][iz-1]-height_11,-trSize];
        if(ix<pRes)             vec_21 = [ trSize,groundHeight[ix+1][iz+0]-height_11, 0];
        if(ix<pRes && iz<pRes)  vec_22 = [ trSize,groundHeight[ix+1][iz+1]-height_11, trSize];

        if(ix>0 && iz>0) 
        {
          vec3.cross(normalt,vec_10,vec_00);
          vec3.add(normal,normalt,normal);

          vec3.cross(normalt,vec_00,vec_01);
          vec3.add(normal,normalt,normal);
        }
        if(ix>0 && iz<pRes)  
        {
          vec3.cross(normalt,vec_01,vec_02);
          vec3.add(normal,normalt,normal);

          vec3.cross(normalt,vec_02,vec_12);
          vec3.add(normal,normalt,normal);
        }
        if(ix<pRes && iz<pRes) 
        {
          vec3.cross(normalt,vec_12,vec_22);
          vec3.add(normal,normalt,normal);

          vec3.cross(normalt,vec_22,vec_21);
          vec3.add(normal,normalt,normal);
        }
        if(ix<pRes && iz>0)
        {
          vec3.cross(normalt,vec_21,vec_20);
          vec3.add(normal,normalt,normal);

          vec3.cross(normalt,vec_20,vec_10);
          vec3.add(normal,normalt,normal);
        }

        vec3.normalize(normalt,normalt);
        light[ix][iz]  = (vec3.dot([0,1.0,0.0],normalt)-0.5)*2.0

      }
    }

    for (var ix=0;ix<=pRes;ix+=1)
    {    
      for (var iz=0;iz<=pRes;iz+=1)
      {
        var x = pPosX + ix*pSize/pRes - pSize/2;
        var z = pPosZ + iz*pSize/pRes - pSize/2;
        
        // compute ground position
        groundPositions.push(x);
        groundPositions.push(groundHeight[ix][iz]);
        groundPositions.push(z);
  
        
          // compute normal position
          var lightCur = light[ix][iz]
          var color
          if(groundHeight[ix][iz]<-50) color=hexColorToGL("#64ABE3") //deep ocean #64ABE3 
          else if(groundHeight[ix][iz]<-30) color=hexColorToGL("#92C4EE")//deep ocean #92C4EE 
          else if(groundHeight[ix][iz]<0)   color=hexColorToGL("#BBDBF7") //ocean #BBDBF7
          else if(groundHeight[ix][iz]<5)   color=hexColorToGL("#F6E3D4")//beach1  #F6E3D4
          else if(groundHeight[ix][iz]<10)  color=hexColorToGL("#FDD8B5") //beach2  #FDD8B5
          else if(groundHeight[ix][iz]<20)  color=hexColorToGL("#F9D199") //beach3  #F9D199
          else if(groundHeight[ix][iz]<50)  color=hexColorToGL("#8c9e60") //forest  #8c9e60
          else if(groundHeight[ix][iz]<100) color=hexColorToGL("#515038")//forest  #515038
          else if(groundHeight[ix][iz]<200) color=hexColorToGL("#b1ab9a") //forest  #b1ab9a
          else if(groundHeight[ix][iz]<1000) color=hexColorToGL("#757350")//forest  #757350
          else if(groundHeight[ix][iz]<1200)color=hexColorToGL("#79e9bf") //snow  #79e9bf
          else if(groundHeight[ix][iz]<1500)color=hexColorToGL("#e7ebfc") //snow  #e7ebfc
          else if(groundHeight[ix][iz]<5000)color=hexColorToGL("#f6f7fb") //snow  #f6f7fb


          // color=hexColorToGL("#F6E3D4")//beach1  #F6E3D4
          groundColors.push(color[0]*lightCur);
          groundColors.push(color[1]*lightCur);
          groundColors.push(color[2]*lightCur);
  
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
    gCurrentShaderProgram = groundShaderProgram;
  
    // Vertex Buffer
    this.groundVertexBuffer = gl.createBuffer();
    this.groundVertexBuffer.itemSize = 3;
    this.groundVertexBuffer.numItems = groundPositions.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPositions), gl.STATIC_DRAW);	
  
    // Color Buffer	
    this.groundColorBuffer = gl.createBuffer();
    this.groundColorBuffer.itemSize = 3;
    this.groundColorBuffer.numItems = groundColors.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundColors), gl.STATIC_DRAW);	
      
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
    mat4.identity(mvMatrix)    ;
    
    if(gCurrentShaderProgram != groundShaderProgram) 
    {
        gl.useProgram(groundShaderProgram);
        gCurrentShaderProgram = groundShaderProgram;
        gl.uniform1i(groundShaderProgram.texture, 0);
    }

  
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundVertexBuffer);
    gl.vertexAttribPointer(groundShaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundColorBuffer);
    gl.vertexAttribPointer(groundShaderProgram.vertexColorAttributeArray, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.groundIndiceBuffer);
        		    
    gl.uniformMatrix4fv(groundShaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(groundShaderProgram.pMatrixUniform, false, pMatrix);
        
    gl.drawElements(gl.TRIANGLES,this.nbElement, gl.UNSIGNED_SHORT,0);

   // gl.useProgram(groundShaderProgram);
    //gl.drawElements(gl.LINES,this.nbElement, gl.UNSIGNED_SHORT,0);
  }


}


groundSize = 10000;

function groundInit()
{
  groundSectorInst = new CGroundSector(0,0,1000,200);
}


function groundDraw()
{

  groundSectorInst.drawSector();
  
  gl.disable(gl.CULL_FACE);   
  groundWaterDraw(); 
  gl.enable(gl.CULL_FACE);   
}



function groundWaterGetCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
	var collision = pCollision;
	if ((pRayPoint1[1]>=groundWaterYLevel) && (pRayPoint2[1]<groundWaterYLevel))
	{
		var collision = [pRayPoint2[0],groundWaterYLevel,pRayPoint2[0],[0,"water",0]];	
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

  // shaderWaterY = groundWaterYLevel;
  // var offset = Math.cos(shaderCounter/20.0 + 2.0)/2.0+Math.cos(shaderCounter/15.0 +3.0)/4.0;
  // shaderWaterY += offset;
	// mat4.identity(mvMatrix); 
	// mat4.translate(mvMatrix,mvMatrix, [0.0,groundWaterYLevel-32.0 + offset,0.0]);	
	// mat4.scale(mvMatrix,mvMatrix,[9000.0,30.0,9000.0]);	

	// gl.uniform1f (groundShaderProgram.counter, shaderCounter);
	// gl.uniform1f (groundShaderProgram.waterY, shaderWaterY);
	// Sphere.Draw(groundShaderProgram);
  // shaderWaterY = -1000;


  
}