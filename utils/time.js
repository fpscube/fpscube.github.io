
var gTimeDateInitMs;
var gTimeElapsedS;
var gTimeElapsedMs;
var gTimeMs;
var gTimeS;
var gTimeLastMs;
var gTimeAnimDeg;
var gTimeAnimRad;
var gTimeAnimTab=[];

function timeInit()
{
	gTimeDateInitMs=  new Date().getTime();
	gTimeElapsedS=0;
	gTimeElapsedMs=0;
	gTimeMs=0;
	gTimeS=0;
	gTimeLastMs=0;
	gTimeAnimDeg=0;
	gTimeAnimRad=0;
	gTimeAnimTab=[];
}

function timeUpdate()
{
	//Time counter update
	gTimeMs=  new Date().getTime() - gTimeDateInitMs;
	gTimeS=  gTimeMs/1000;
	gTimeElapsedMs = (gTimeMs - gTimeLastMs); 
	gTimeElapsedS = gTimeElapsedMs/1000; 
	gTimeLastMs = gTimeMs; 	
	gTimeAnimDeg = (gTimeAnimDeg + gTimeElapsedS )% 360;
	gTimeAnimRad = (gTimeAnimRad + gTimeElapsedS )% (2*Math.PI);

	for (var id in gTimeAnimTab)
	{
		var timeAnimInst = gTimeAnimTab[id];
		if (timeAnimInst.running)
		{
			var coef = (gTimeMs-timeAnimInst.startTimeMs)/timeAnimInst.duration;
			if (coef > 1.0)
			{
				timeAnimInst.running = false;
				timeAnimInst.coef= 1.0;
			}
			else
			{
				
				timeAnimInst.coef= coef;
			}
		}
	}
}


function timeGetAnimDeg() {return gTimeAnimDeg;}
function timeGetAnimRad() {return gTimeAnimRad;}
function timeGetCurrentInMs() {return gTimeMs;}
function timeGetCurrentInS() {return gTimeS;}
function timeGetElapsedInMs() {return gTimeElapsedMs;}
function timeGetElapsedInS() {return gTimeElapsedS;}




class CTimeAnim
{

	constructor() {
		this.running = false;
		this.coef = 1.0;
		this.startTimeMs = 0;
		this.duration = 0;
		this.startVal = 0;
		this.endVal = 0;
		gTimeAnimTab.push(this);
	}

	start(pAnimDurationInMs,pStartValue,pEndValue)
	{
		this.running = true;
		this.coef = 0.0;
		this.startTimeMs = gTimeMs;
		this.duration = pAnimDurationInMs;
		this.startVal = pStartValue;
		this.endVal = pEndValue;
	}

	getValue()
	{
		var coef = this.coef;
		var start = this.startVal;
		var end =  this.endVal ;
		return (start * (1-coef) + end * coef);
	}

	getVec3Value()
	{
		var coef = this.coef;
		var vecStart = this.startVal;
		var vecEnd =  this.endVal ;
		return [vecStart[0] * (1-coef) + vecEnd[0] * coef,vecStart[1] * (1-coef) + vecEnd[1] * coef, vecStart[2] * (1-coef) + vecEnd[2] * coef];
	}

}
