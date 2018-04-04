
var gMediaKeyPressed={};
var gMediaTouchStartPos={};
var gMediaMouseCamMvVec=[0,0];
var gMediaTouchCamMvVec=[0,0];
var gMediaTouchMvInProgress=0;

// ######### Event Handler ##############// 

function mediaMouseMove(event) {
	var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	if (!isChrome || ( Math.abs(event.movementX) < 150 && Math.abs(event.movementY)< 150))
	{
        speedCoef = 2.5
        gMediaMouseCamMvVec[0] += speedCoef*event.movementX/screen.width;
		gMediaMouseCamMvVec[1] += speedCoef*event.movementY/screen.height;
	}
}

function mediaSetKeyDownFct(event)
{
    if (event.key=="ArrowUp" || event.key=="z" ){
      gMediaKeyPressed["Up"]=1;
      gMediaKeyPressed["Down"]=0;
    }
    else if (event.key=="ArrowDown" || event.key=="s" ){
        gMediaKeyPressed["Up"]=0;
        gMediaKeyPressed["Down"]=1;
    }
    else if (event.key=="ArrowRight" || event.key=="d" ){
        gMediaKeyPressed["Left"]=0;
        gMediaKeyPressed["Right"]=1;
    }
    else if (event.key=="ArrowLeft" || event.key=="q" ){
        gMediaKeyPressed["Left"]=1;
        gMediaKeyPressed["Right"]=0;
    }
    gMediaKeyPressed[event.key]=1;
}

function mediaSetKeyUpFct(event)
{
    if (event.key=="ArrowUp" || event.key=="z" ){gMediaKeyPressed["Up"]=0;}
    else if (event.key=="ArrowDown" || event.key=="s" ){gMediaKeyPressed["Down"]=0;}
    else if (event.key=="ArrowRight" || event.key=="d" ){gMediaKeyPressed["Right"]=0;}
    else if (event.key=="ArrowLeft" || event.key=="q" ){gMediaKeyPressed["Left"]=0;}
    gMediaKeyPressed[event.key]=0;
}

function mediaIsKey(name)
{
    return (gMediaKeyPressed[name]==1);
}

function mediaSetMouseUpFct(event){
	if (event.button==0) 
	gMediaKeyPressed["Fire"]=0;
}

function mediaSetMouseDownFct(event){	
	if (event.button==0)
    gMediaKeyPressed["Fire"]=1;
}

function mediaGetMouseCamMvVector()
{
    var out = gMediaMouseCamMvVec;
    gMediaMouseCamMvVec=[0,0];
    return out;
}

function mediaGetTouchCamMvVector()
{
    return gMediaTouchCamMvVec;
}

function mediaIsRunning(){

    return (
        gMediaKeyPressed["Up"]==1 || 
        gMediaKeyPressed["Down"]==1 ||
        gMediaKeyPressed["Right"]==1 || 
        gMediaKeyPressed["Left"]==1 ||
        gMediaTouchMvInProgress
    );
}


function mediaGetRunAngle()
{
    var angle = 0;
    if (gMediaKeyPressed["Up"] && gMediaKeyPressed["Left"]) {angle = Math.PI/4;}
    else if (gMediaKeyPressed["Up"] && gMediaKeyPressed["Right"]){angle = -Math.PI/4;}
    else if (gMediaKeyPressed["Down"] && gMediaKeyPressed["Left"]) {angle = 3*Math.PI/4;}
    else if (gMediaKeyPressed["Down"] && gMediaKeyPressed["Right"]) {angle = -3*Math.PI/4;}
    else if (gMediaKeyPressed["Up"]) {angle = 0;}
    else if (gMediaKeyPressed["Down"]) {angle = Math.PI;}
    else if (gMediaKeyPressed["Left"]) {angle = Math.PI/2;}
    else if (gMediaKeyPressed["Right"]) {angle = -Math.PI/2;}
    else if (gMediaTouchMvInProgress) {angle = gMediaTouchMvAngle;}
    return angle;
}

function mediaSetTouchStart(evt){	
    var touches = evt.changedTouches;
    for (var i=0; i<touches.length; i++) {
      var id = touches[i].identifier;
      gMediaTouchStartPos[id] = [touches[i].pageX,touches[i].pageY];
    }
}


function mediaSetTouchMove(evt){	
    var touches = evt.changedTouches;
    for (var i=0; i<touches.length; i++) {
        var id = touches[i].identifier;
        var startPos = gMediaTouchStartPos[id];
        var touchDir =[event.touches[0].clientX-startPos[0],event.touches[0].clientY-startPos[1]];
        if (startPos[0]>(screen.width/2))
        { 
            gMediaTouchMvInProgress=1;
            gMediaTouchMvAngle = Math.atan2(-touchDir[0],-touchDir[1]);
        }
        else
        {
            
            speedCoef = 10;
            gMediaTouchCamMvVec[0] = speedCoef*touchDir[0]/screen.width;
		    gMediaTouchCamMvVec[1] = speedCoef*touchDir[1]/screen.height;
        }
    }
}

function mediaSetTouchEnd(evt){	
    var touches = evt.changedTouches;
    for (var i=0; i<touches.length; i++) {
        var id = touches[i].identifier;
        var startPos = gMediaTouchStartPos[id];
        if (startPos[0]>(screen.width/2))
        { 
            gMediaTouchMvInProgress=0;
        }
        else
        {
            gMediaTouchCamMvVec=[0,0];
        }
    }
}


