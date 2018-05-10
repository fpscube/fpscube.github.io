var cubePositions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];


var cubeNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

var cubeIndices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

var cubeVertexBuffer;
var cubeNormalBuffer;
var cubeIndiceBuffer;


function cubeInit()
{

  // Vertex Buffer
  cubeVertexBuffer = gl.createBuffer();
  cubeVertexBuffer.itemSize = 3;
  cubeVertexBuffer.numItems = 24;	
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePositions), gl.STATIC_DRAW);	

  // Normal Buffer	
  cubeNormalBuffer = gl.createBuffer();
  cubeNormalBuffer.itemSize = 3;
  cubeNormalBuffer.numItems = 24;	
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);	
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
    cubePositions
  // Index Buffer
  cubeIndiceBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndiceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
}


function cubeDraw(pShaderProgram)
{
    gl.useProgram(pShaderProgram);
    
    //function setMatrixUniforms(pShaderProgram) {
    gl.uniform4fv (pShaderProgram.vertexColorAttribute, shaderVertexColorVector);
    gl.uniformMatrix4fv(pShaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(pShaderProgram.pMatrixUniform, false, pMatrix);
    mat4.invert(mvInverseMatrix,mvMatrix);
    mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
    gl.uniformMatrix4fv(pShaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(pShaderProgram.vertexPositionAttribute, cubeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.vertexAttribPointer(pShaderProgram.vertexNormalAttribute, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndiceBuffer);

    
    gl.drawElements(gl.TRIANGLES,36, gl.UNSIGNED_SHORT,0);
}

function cubeIsRayCollisionDetected(rayPoint,rayDir,mvMatrix)
{
    tranformRayPoint1 = vec3.create();
    tranformRayPoint2 = vec3.create();
    tranformRayDir = vec3.create();
    mvMatrixInv = mat4.create();
    mat4.invert(mvMatrixInv,mvMatrix);
    vec3.transformMat4(tranformRayPoint1,rayPoint,mvMatrixInv);
    vec3.transformMat4(tranformRayPoint2,[rayPoint[0]+rayDir[0],rayPoint[1]+rayDir[1],rayPoint[2]+rayDir[2]],mvMatrixInv);
    vec3.subtract(tranformRayDir,tranformRayPoint2,tranformRayPoint1);
    vec3.normalize(tranformRayDir,tranformRayDir);

    xb=tranformRayPoint1[0];
    yb=tranformRayPoint1[1];
    zb=tranformRayPoint1[2];

    xa=tranformRayDir[0];
    ya=tranformRayDir[1];
    za=tranformRayDir[2];    
    
    z = 1;
    t = ((z-zb)/za);
    x = xa * t + xb;
    y = ya * t + yb;
    c0 = (x>-1 && x<1 && y>-1 && y<1);
    
    z = -1;
    t = ((z-zb)/za);
    x = xa * t + xb;
    y = ya * t + yb;
    c1 = (x>-1 && x<1 && y>-1 && y<1);
    
    y = 1;
    t = ((y-yb)/ya);
    x = xa * t + xb;
    z = za * t + zb;
    c2 = (x>-1 && x<1 && z>-1 && z<1);
    
    y = -1;
    t = ((y-yb)/ya);
    x = xa * t + xb;
    z = za * t + zb;
    c3 = (x>-1 && x<1 && z>-1 && z<1);
    
    x = 1;
    t = ((x-xb)/xa);
    y = ya * t + yb;
    z = za * t + zb;
    c4 = (y>-1 && y<1 && z>-1 && z<1);
    
    x = -1;
    t = ((x-xb)/xa);
    y = ya * t + yb;
    z = za * t + zb;
    c5 = (y>-1 && y<1 && z>-1 && z<1);

    return ( c0 || c1 || c2 || c3 || c4 || c5 );

}