
// var ctxAud  = new AudioContext();

	
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
var enVehiculCollision = [[0.3,300,8.0]];

var configList=[fireGunConfig , fireBazGunConfig,expConfig,enVehiculCollision];
var durationList=[2.0,2.0,3.0,2.0];
var filerCoefList=[7.0,7.0,10.0,7.0];
var wavList=[[],[],[],[]];

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
  var buf = new Float32Array(wav.length);
  for (var i = 0; i < wav.length; i++) buf[i] = wav[i];
  var buffer = ctxAud.createBuffer(1, buf.length, ctxAud.sampleRate);
  buffer.copyToChannel(buf, 0);
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