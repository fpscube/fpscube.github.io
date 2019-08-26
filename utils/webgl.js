var gl;
var ctx2d;
var GameInst;
var gCurrentGraphicalObject = -1;
var gCurrentShaderProgram = -1;

function lockChangeAlert() {
	var canvas = document.getElementById("canvas2D");
	if (document.pointerLockElement === canvas ||  document.mozPointerLockElement === canvas) {
		document.addEventListener("mousemove", mediaMouseMove, false);} 
	else {   
		document.removeEventListener("mousemove", mediaMouseMove, false); }
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
var pMatrix = mat4.create();

function degToRad(degrees) {return degrees * Math.PI / 180;}


function tick() {

	GameInst.update();
	GameInst.draw();
	requestAnimFrame(tick);
}

function getPlayerName() {

	var input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", "Type your name");
	input.setAttribute("class", "inputFields");
	input.addEventListener('change', (event) => {
	  webGLStart(event.srcElement.value);
	});	
	document.body.appendChild(input);

}


function webGLStart(playerName) {
	var body = document.body;
	body.innerHTML= '';
	body.setAttribute("onmousedown", "mediaSetMouseDownFct(event)");
	body.setAttribute("onmouseup", "mediaSetMouseUpFct(event)");
	body.setAttribute("onkeydown", "mediaSetKeyDownFct(event)");
	body.setAttribute("onkeyup", "mediaSetKeyUpFct(event)");
	body.setAttribute("onwheel", "mediaWheelFct(event)");
	var div = document.createElement("div");
	div.setAttribute("class", "container");
	div.setAttribute("id", "game");
	body.appendChild(div);
	var canvas3D = document.createElement("canvas");
	canvas3D.setAttribute("id", "canvas3D");
	canvas3D.setAttribute("style", "border: none;");
	canvas3D.setAttribute("width", "1024");
	canvas3D.setAttribute("height", "600");
	div.appendChild(canvas3D);
	var canvas2D = document.createElement("canvas");
	canvas2D.setAttribute("id", "canvas2D");
	canvas2D.setAttribute("style", "border: none;");
	canvas2D.setAttribute("width", "1024");
	canvas2D.setAttribute("ontouchstart", "mediaSetTouchStart(event)");
	canvas2D.setAttribute("ontouchmove", "mediaSetTouchMove(event)");
	canvas2D.setAttribute("ontouchend", "mediaSetTouchEnd(event)");
	div.appendChild(canvas2D);

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
	var canvas3D = document.getElementById("canvas3D");
	var canvas2D = document.getElementById("canvas2D");

	gl = canvas3D.getContext("experimental-webgl");	

	canvas2D.requestPointerLock = canvas2D.requestPointerLock || canvas2D.mozRequestPointerLock;
	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		
	canvas2D.onclick = function() {canvas2D.requestPointerLock();};
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);


	ctx2d = canvas2D.getContext("2d");

	GameInst = new CGame(playerName);

	tick();
}
