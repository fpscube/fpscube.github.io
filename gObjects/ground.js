
var groundVertexBuffer;
var groundNormalBuffer;
var groundIndiceBuffer;
var groundPositions;
var groundNormals;
var groundIndices;
var groundSectorInst;

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


class CGroundSector
{
  constructor(pPosX,pPosZ,pSize,pRes)
  {
    
   var groundPositions=[];
   var groundNormals=[];
   var groundIndices=[];
  
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
  
    
    gl.useProgram(shaderProgram);
  
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

    shaderWaterY = -2008.5;
    shaderVertexColorVector = [1.0,1.0,0.5,1.0];
  	mat4.identity(mvMatrix)    
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.groundNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.groundIndiceBuffer);
    
    gl.useProgram(shaderProgram);
    		
    gl.uniform4fv (shaderProgram.vertexColorAttribute, shaderVertexColorVector);
    
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    
    mat4.invert(mvInverseMatrix,mvMatrix);
    mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);

    
    gl.drawElements(gl.TRIANGLES,this.nbElement, gl.UNSIGNED_SHORT,0);
  }


}


groundSize = 10000;
groundRes = 20;

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
  
}