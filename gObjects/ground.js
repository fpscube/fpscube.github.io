
var groundVertexBuffer;
var groundNormalBuffer;
var groundIndiceBuffer;
var groundPositions;
var groundNormals;
var groundIndices;

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


function groundInit()
{
  sizeX = 2500;
  sizeZ = 2500;
  res = 100  ;

  
 groundPositions=[];
 groundNormals=[];
 groundIndices=[];

  for (ix=0;ix<=res;ix+=1)
  {    
    for (iz=0;iz<=res;iz+=1)
    {
      x=-sizeX/2+ix*sizeX/res;
      z=-sizeZ/2+iz*sizeZ/res;
      
      // compute ground position
      groundPositions.push(x);
      groundPositions.push(groundGetY(x,z));
      groundPositions.push(z);

      
        // compute normal position
        normVector = groundGetNormalVec(x,z);
        groundNormals.push(normVector[0]);
        groundNormals.push(normVector[1]);
        groundNormals.push(normVector[2]);

      if (((ix+1)<=res) && ((iz+1)<=res))
      {
        groundIndices.push(iz+ix*(res+1));
        groundIndices.push(iz+1+ix*(res+1));
        groundIndices.push(iz+(ix+1)*(res+1));

        groundIndices.push(iz+1+ix*(res+1));
        groundIndices.push(iz+1+(ix+1)*(res+1));
        groundIndices.push(iz+(ix+1)*(res+1));
       
      }
    }
  }

  
  gl.useProgram(shaderProgram);

  // Vertex Buffer
  groundVertexBuffer = gl.createBuffer();
  groundVertexBuffer.itemSize = 3;
  groundVertexBuffer.numItems = groundPositions.length/3;
  gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPositions), gl.STATIC_DRAW);	

  // Normal Buffer	
  groundNormalBuffer = gl.createBuffer();
  groundNormalBuffer.itemSize = 3;
  groundNormalBuffer.numItems = groundNormals.length/3;
  gl.bindBuffer(gl.ARRAY_BUFFER, groundNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundNormals), gl.STATIC_DRAW);	
    
  // Index Buffer
  groundIndiceBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundIndiceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(groundIndices), gl.STATIC_DRAW);
}


function groundDraw()
{
    shaderWaterY = -28.5;
    shaderVertexColorVector = [1.0,1.0,0.5,1.0];
  	mat4.identity(mvMatrix)
  
    
  
    gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, groundNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundIndiceBuffer);

    
    gl.useProgram(shaderProgram);
    
    //function setMatrixUniforms(pShaderProgram) {
		
    gl.uniform4fv (shaderProgram.vertexColorAttribute, shaderVertexColorVector);
    
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    
    mat4.invert(mvInverseMatrix,mvMatrix);
    mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);

    
    gl.drawElements(gl.TRIANGLES,groundIndices.length, gl.UNSIGNED_SHORT,0);
  
   // gl.drawElements(gl.LINES,groundIndices.length, gl.UNSIGNED_SHORT,0);
}