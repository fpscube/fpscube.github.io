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
 

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.vertexColorAttribute = gl.getUniformLocation(shaderProgram, "uVertexColor");
	shaderProgram.counter = gl.getUniformLocation(shaderProgram, "uCounter");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.worldMatrix = gl.getUniformLocation(shaderProgram, "uWorldMatrix");
	shaderProgram.mvInverseTransposeMatrix = gl.getUniformLocation(shaderProgram, "uMVInverseTransposeMatrix");
	shaderProgram.lightWorldPosition = gl.getUniformLocation(shaderProgram, "uLightWorldPosition");
}

var shaderCounter=0;
var vertexColorVector = [1.0,1.0,0.5,1.0];
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

function setMatrixUniforms() {
	gl.uniform1f (shaderProgram.counter, shaderCounter);
	gl.uniform4fv (shaderProgram.vertexColorAttribute, vertexColorVector);
	gl.uniform3fv (shaderProgram.lightWorldPosition, [0.0,0.0,0.0]);

	mat4.invert(mvInverseMatrix,mvMatrix);
	mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
	


	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);

}

function degToRad(degrees) {return degrees * Math.PI / 180;}


function tick() {
	requestAnimFrame(tick);
	drawGame();
}

function webGLStart() {
	var canvas = document.getElementById("canvas");
	initGL(canvas);
	initShaders();
	initGame();
	tick();
}
