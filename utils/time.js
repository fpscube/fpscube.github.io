
var gTimeDateInitMs=0;
var gTimeElapsedS=0;
var gTimeElapsedMs=0;
var gTimeMs=0;
var gTimeS=0;
var gTimeLastMs=0;
var gTimeAnimDeg=0;
var gTimeAnimRad=0;
var gTimeAnimCounter={};

function timeInit()
{
	gTimeDateInitMs=  new Date().getTime();
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

	for (var counterName in gTimeAnimCounter)
	{
		var counter = gTimeAnimCounter[counterName]
		if (counter["running"])
		{
			coef = (gTimeMs-counter["startTimeMs"])/counter["duration"];
			if (coef > 1.0)
			{
				counter["running"] = false;
				counter["coef"] = 1.0;
			}
			else
			{
				
				counter["coef"] = coef;
			}
		}
	}
}

function timeAnimInit(timeAnimName)
{
	/* Time Start ,Duration (gTimeMs,timeAnimDurationInMs)*/
	gTimeAnimCounter[timeAnimName] = {"running":false,"coef":1.0,"startTimeMs":0,"duration":0};
}


function timeAnimStart(timeAnimName,timeAnimDurationInMs,startValue,endValue)
{
	/* Time Start ,Duration (gTimeMs,timeAnimDurationInMs)*/
	gTimeAnimCounter[timeAnimName]= {"running":true,"coef":0.0,"startTimeMs":gTimeMs,"duration":timeAnimDurationInMs,"startValue":startValue,"endValue":endValue};
}

function timeAnimIsRunning(timeAnimName)
{
	return gTimeAnimCounter[timeAnimName]["running"];
}

function timeAnimGetCoef(timeAnimName)
{
	return gTimeAnimCounter[timeAnimName]["coef"];
}


function timeAnimGetIntValue(timeAnimName)
{
	counter = gTimeAnimCounter[timeAnimName];
	coef = counter["coef"];
	valStart = counter["startValue"];
	valEnd = counter["endValue"];
	return (valStart * (1-coef) + valEnd * coef);
}

function timeAnimGetVec3Value(timeAnimName)
{
	counter = gTimeAnimCounter[timeAnimName];
	coef = counter["coef"];
	vecStart = counter["startValue"];
	vecEnd = counter["endValue"];
	return [vecStart[0] * (1-coef) + vecEnd[0] * coef,vecStart[1] * (1-coef) + vecEnd[1] * coef, vecStart[2] * (1-coef) + vecEnd[2] * coef];
}



function timeGetAnimDeg() {return gTimeAnimDeg;}
function timeGetAnimRad() {return gTimeAnimRad;}
function timeGetCurrentInMs() {return gTimeMs;}
function timeGetCurrentInS() {return gTimeS;}
function timeGetElapsedInMs() {return gTimeElapsedMs;}
function timeGetElapsedInS() {return gTimeElapsedS;}
