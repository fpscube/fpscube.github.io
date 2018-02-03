
var groundVertexBuffer;
var groundNormalBuffer;
var groundIndiceBuffer;
var groundPositions;
var groundNormals;
var groundIndices;

function groundGetY(x,z)
{
 y = (Math.sin(x/50)*5+Math.sin(z/50)*5 + Math.sin(x/100)*10 + Math.sin(z/100)*10);
//  y = (Math.sin(x/100)*10+Math.sin(z/100)*10);
  return(y);
}

function groundGetNormalVec(x,z)
{
  vector1 =  vec3.create();
  vector2 =  vec3.create();
  vector3 =  vec3.create();
  vec3.normalize(vector1,[1.0,  -Math.cos(x/50)-Math.cos(x/100) ,0]);
  
  vec3.normalize(vector2,[0,  -Math.cos(z/50)-Math.cos(z/100) ,-1.0]);
  vec3.cross(vector3,vector1,vector2)   ;

// vec3.normalize(normVector,[1, -Math.cos(x/10)/10   - Math.cos(z/10)/10  ,1]);
  return(vector3);
}


function groundInit()
{
  sizeX = 2000;
  sizeZ = 2000;
  res = 100;


  
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


  // Vertex Buffer
  groundVertexBuffer = gl.createBuffer();
  groundVertexBuffer.itemSize = 3;
  groundVertexBuffer.numItems = groundPositions.length/3;
  gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundPositions), gl.STATIC_DRAW);	

  // Normal Buffer	
  groundNormalBuffer = gl.createBuffer();
  groundNormalBuffer.itemSize = 3;
  groundNormalBuffer.numItems = groundNormals/3;
  gl.bindBuffer(gl.ARRAY_BUFFER, groundNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(groundNormals), gl.STATIC_DRAW);	
    
  // Index Buffer
  groundIndiceBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundIndiceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(groundIndices), gl.STATIC_DRAW);
}


function groundDraw()
{

    gl.bindBuffer(gl.ARRAY_BUFFER, groundVertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, groundNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundIndiceBuffer);

    gl.drawElements(gl.TRIANGLES,groundIndices.length, gl.UNSIGNED_SHORT,0);
  
   // gl.drawElements(gl.LINES,groundIndices.length, gl.UNSIGNED_SHORT,0);
}