/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

WebGLUtils = function() {

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @param {function:(msg)} opt_onError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs, opt_onError) {
  function handleCreationError(msg) {
    var container = canvas.parentNode;
    if (container) {
      var str = window.WebGLRenderingContext ?
           OTHER_PROBLEM :
           GET_A_WEBGL_BROWSER;
      if (msg) {
        str += "<br/><br/>Status: " + msg;
      }
      container.innerHTML = makeFailHTML(str);
    }
  };

  opt_onError = opt_onError || handleCreationError;

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, false);
  }
  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    if (!window.WebGLRenderingContext) {
      opt_onError("");
    }
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();


var mvMatrixStack = [];

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.copy(copy,mvMatrix);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	mvMatrix = mvMatrixStack.pop();
}


function collisionPushMatrix(pCollisionList,pMvMatrix)
{
    var collMat = mat4.create();
    mat4.copy(collMat,pMvMatrix);
    pCollisionList.push(collMat);
}


function lookAt(pVec3Dir)
{
    var lookAtMatrix = mat4.create();
    var translationVector = vec3.create();
    mat4.getTranslation(translationVector,mvMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix, translationVector);
    mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],[-pVec3Dir[0],-pVec3Dir[1],-pVec3Dir[2]],[0,1,0]);
    mat4.invert(lookAtMatrix,lookAtMatrix);
    mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
}

function lookAtN(pVec3Dir,pNormalDir)
{
    var lookAtMatrix = mat4.create();
    var translationVector = vec3.create();
    mat4.getTranslation(translationVector,mvMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix, translationVector);
    mat4.lookAt(lookAtMatrix,[0.0,0.0,0.0],[-pVec3Dir[0],-pVec3Dir[1],-pVec3Dir[2]],pNormalDir);
    mat4.invert(lookAtMatrix,lookAtMatrix);
    mat4.multiply(mvMatrix,mvMatrix,lookAtMatrix,mvMatrix);
}


var ctxAud  = new AudioContext();

	
var filterBuffer;
var filterSum;
var filterSize;

function filterInit(size)
{
  filterBuffer=[];
  filterSum=0;
  filterSize=size;	
  for (var i=0;i<size;i++)
  {
    filterBuffer.push(0);
  }
}	

function filter(input)
{
  filterBuffer.push(input);
  filterSum+=input;
  var sVal = filterBuffer.shift();
  filterSum-=sVal;
  return filterSum/filterSize;
}	


var fireGunConfig = [[0.1,2,1.0],[0.3,5,0.8],[0.5,8,0.4],[1.0,10,0.1],[2.0,15,0.01]];
var fireBazGunConfig = [[0.1,25,1.0],[0.3,50,0.8],[0.5,50,0.4],[1.0,50,0.1],[2.0,80,0.01]];
var expConfig = [[0.5,8,0.4],[1.0,25,0.3],[2.0,30,0.4],[2.5,40,0.6],[3.0,50,0.4]];

var configList=[fireGunConfig , fireBazGunConfig,expConfig];
var durationList=[2.0,2.0,3.0];
var filerCoefList=[7.0,7.0,10.0];
var wavList=[[],[],[]];

for (var confListI=0;confListI<configList.length;confListI++ )
{
  var duration = durationList[confListI];
  var wav =  wavList[confListI];
  var filterCoef = filerCoefList[confListI];
  var config  =  configList[confListI];
  for (var i = 0; i < ctxAud.sampleRate * duration; i++) 
  {
    wav[i]=0;
  }

    
  for (var confI = 0;confI<config.length;confI++)
  {
    seconds = config[confI][0];
    filterInit(config[confI][1]);
    var count = ctxAud.sampleRate * seconds;
    for (var i = 0; i < count; i++) {
      var sec = i/ctxAud.sampleRate ;
      wav[i] += filter((Math.random() -0.5)*(sec-seconds)/seconds)*config[confI][2];
    }	
  }
  filterInit(filterCoef);
  for (var i = 0; i < ctxAud.sampleRate * 2.0; i++) 
  {
    wav[i]=filter(wav[i]);
  }
}





function playSound(wav) {
  var buf = new Float32Array(wav.length)
  for (var i = 0; i < wav.length; i++) buf[i] = wav[i]
  var buffer = ctxAud.createBuffer(1, buf.length, ctxAud.sampleRate)
  buffer.copyToChannel(buf, 0)
  var source = ctxAud.createBufferSource();
  source.buffer = buffer;
  source.connect(ctxAud.destination);
  source.start(0);
}

// create Oscillator node
var oscillator = ctxAud.createOscillator();
var gainMaster = ctxAud.createGain();
var biquadFilter = ctxAud.createBiquadFilter();

oscillator.type = 'sawtooth';
oscillator.start();
oscillator.frequency.setValueAtTime(0,0); // value in hertz

gainMaster.gain.value = 0.0;

biquadFilter.type = "lowpass";
biquadFilter.frequency.setValueAtTime(250,0);
biquadFilter.gain.setValueAtTime(25, 0);

oscillator.connect(biquadFilter);
biquadFilter.connect(gainMaster);
gainMaster.connect(ctxAud.destination);

function playCarSound(freq)
{
    oscillator.frequency.setValueAtTime(freq,0); // value in hertz
    gainMaster.gain.value = (freq==0)?  0.0:0.5;
    
}