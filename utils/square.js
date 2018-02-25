var squarePositions = [
    // Front face
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
  ];


var squareNormals = [
    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

  ];

var squareIndices = [
    0,  1,  2,      0,  2,  3,    // front
  ];

var squareVertexBuffer;
var squareNormalBuffer;
var squareIndiceBuffer;


function squareInit()
{

  // Vertex Buffer
  squareVertexBuffer = gl.createBuffer();
  squareVertexBuffer.itemSize = 3;
  squareVertexBuffer.numItems = 4;	
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squarePositions), gl.STATIC_DRAW);	

  // Normal Buffer	
  squareNormalBuffer = gl.createBuffer();
  squareNormalBuffer.itemSize = 3;
  squareNormalBuffer.numItems = 4;	
  gl.bindBuffer(gl.ARRAY_BUFFER, squareNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareNormals), gl.STATIC_DRAW);	
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, squareNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
  // Index Buffer
  squareIndiceBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndiceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareIndices), gl.STATIC_DRAW);
}


function squareDraw(pShaderProgram)
{

    gl.useProgram(pShaderProgram);
    setMatrixUniforms(pShaderProgram);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
    gl.vertexAttribPointer(pShaderProgram.vertexPositionAttribute, squareVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareNormalBuffer);
    gl.vertexAttribPointer(pShaderProgram.vertexNormalAttribute, squareNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndiceBuffer);

    
    gl.drawElements(gl.TRIANGLES,6, gl.UNSIGNED_SHORT,0);
}