var gl;

function lockChangeAlert() {
	if (document.pointerLockElement === canvas ||  document.mozPointerLockElement === canvas) {
		document.addEventListener("mousemove", updatePosition, false);} 
	else {   
		document.removeEventListener("mousemove", updatePosition, false); }
}

function initGL(canvas) {
	gl = canvas.getContext("experimental-webgl");
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
	
	canvas.onclick = function() {canvas.requestPointerLock();};
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
	
}

function fullScreen(){
    var el = document.getElementById('canvas');
	el.width = screen.width;
	el.height = screen.height;
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	initGame();
    if(el.webkitRequestFullScreen) {el.webkitRequestFullScreen();}
    if(el.mozRequestFullScreen)	   {el.mozRequestFullScreen();}
}

function smallScreen(){
    var el = document.getElementById('canvas');
	el.width = 1024;
	el.height = 600;
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	initGame();
}
 

function shaderCompil(str,shaderType) {

	shader = gl.createShader(shaderType);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}



var vertexShader1 = `    
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
var fragmentShader1 = `
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

var fragmentShader2 = `

precision lowp float;
      
varying vec4 v_position; 
varying vec4 a_position;      
uniform vec4 uVertexColor;    
uniform float uCounter; 
uniform float uWaterY;

void main()
{
  float dist = a_position.y*a_position.y + a_position.x*a_position.x;
  gl_FragColor = vec4(1.0-dist,1.0-dist,0.0,cos(uCounter*6.0)-dist ); 
  
}`;


var fragmentShader3 = `

precision lowp float;
      
varying vec4 v_position; 
varying vec4 a_position;      
uniform vec4 uVertexColor;    
uniform float uCounter; 
uniform float uWaterY;

void main()
{
  float dist = a_position.y*a_position.y + a_position.x*a_position.x;
  gl_FragColor = vec4(uVertexColor.x,uVertexColor.y,uVertexColor.z,1.0-dist); 
  
}`;


var shaderProgram;
var shaderProgram2;
var shaderProgram3;

function initShaders(vertexShaderStr,fragmentShaderStr) {

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

var shaderCounter=0;
var shaderWaterY=0;
var shaderVertexColorVector = [1.0,1.0,0.5,1.0];
var mvMatrix = mat4.create();
var mvInverseMatrix = mat4.create();
var mvInverseTransposeMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.copy(copy,mvMatrix);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms(pShaderProgram) {
		
	gl.uniform1f (pShaderProgram.counter, shaderCounter);
	 gl.uniform1f (pShaderProgram.waterY, shaderWaterY);
	 gl.uniform4fv (pShaderProgram.vertexColorAttribute, shaderVertexColorVector);

	mat4.invert(mvInverseMatrix,mvMatrix);
	mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);

	gl.uniformMatrix4fv(pShaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(pShaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(pShaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);
}

function degToRad(degrees) {return degrees * Math.PI / 180;}

function tick() {
	requestAnimFrame(tick);
	drawGame();
}

function webGLStart() {
	var canvas = document.getElementById("canvas");
	canvas.addEventListener("touchstart", mediaSetMouseDownFct, false);
	canvas.addEventListener("touchmove", mediaSetMouseDownFct, false);
	canvas.addEventListener("touchend", mediaSetMouseUpFct, false);
	initGL(canvas);
	shaderProgram = initShaders(vertexShader1,fragmentShader1); 
	shaderProgram2 = initShaders(vertexShader1,fragmentShader2);
	shaderProgram3 = initShaders(vertexShader1,fragmentShader3);
	initGame();
	tick();
}
