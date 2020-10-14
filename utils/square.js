

var SquareVertexShader = `    
	attribute vec4 aVertexPosition;
	uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;    
	void main() {
  
	gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	}
`;

var SquareFragmentShader = `
precision lowp float;
   
uniform vec4 uVertexColor;   

void main() {
  gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}`;


var SquareShaderProgram;

function SquareInitShaders(vertexShaderStr,fragmentShaderStr) {

  var vertexShader = shaderCompil(vertexShaderStr,gl.VERTEX_SHADER);
  var fragmentShader = shaderCompil(fragmentShaderStr,gl.FRAGMENT_SHADER);

  var outShaderProgram = gl.createProgram();
  gl.attachShader(outShaderProgram, vertexShader);
  gl.attachShader(outShaderProgram, fragmentShader);
  gl.linkProgram(outShaderProgram);

  if (!gl.getProgramParameter(outShaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  outShaderProgram.vertexPositionAttribute = gl.getAttribLocation(outShaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(outShaderProgram.vertexPositionAttribute);

  outShaderProgram.screenRatioUniform = gl.getUniformLocation(outShaderProgram, "uScreenRatio");
  outShaderProgram.vertexColorAttribute = gl.getUniformLocation(outShaderProgram, "uVertexColor");
  outShaderProgram.pMatrixUniform = gl.getUniformLocation(outShaderProgram, "uPMatrix");
  outShaderProgram.mvMatrixUniform = gl.getUniformLocation(outShaderProgram, "uMVMatrix");
  outShaderProgram.texture = gl.getUniformLocation(outShaderProgram, 'uTexture');

  return outShaderProgram;
}

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

  SquareShaderProgram = SquareInitShaders(SquareVertexShader,SquareFragmentShader);

  // Vertex Buffer
  squareVertexBuffer = gl.createBuffer();
  squareVertexBuffer.itemSize = 3;
  squareVertexBuffer.numItems = 4;	
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squarePositions), gl.STATIC_DRAW);	


  // Index Buffer
  squareIndiceBuffer = gl.createBuffer ();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndiceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareIndices), gl.STATIC_DRAW);
}



function squareDraw(pShaderProgram)
{

    if(gCurrentShaderProgram != pShaderProgram) 
    {
        gl.useProgram(pShaderProgram);
        gCurrentShaderProgram = pShaderProgram;
    }
    

    if(gCurrentGraphicalObject!=2) 
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
      gl.vertexAttribPointer(pShaderProgram.vertexPositionAttribute, squareVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndiceBuffer);
      gCurrentGraphicalObject = 2;
    }  

    gl.uniform1f(pShaderProgram.screenRatioUniform, GameInst.Screen.windowRatio);
    gl.uniform4fv (pShaderProgram.vertexColorAttribute, shaderVertexColorVector);
    gl.uniformMatrix4fv(pShaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(pShaderProgram.pMatrixUniform, false, pMatrix);
    


    gl.drawElements(gl.TRIANGLES,6, gl.UNSIGNED_SHORT,0);
}