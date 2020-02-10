
var gMediaKeyPressed;
var gMediaTouchStartPos;
var gMediaCamMvVec;
var gMediaTouchMvInProgress;
var gMediaWheelEvt;
var gMediaWheelLastEvt;
var gMediaTouchMode=false;
var gMediaDoubleTapTimer=0;
var gMediaDoubleTapX=0;
var gMediaDoubleTapY=0;

function mediaInit()
{
    gMediaKeyPressed={};
    gMediaTouchStartPos={};
    gMediaCamMvVec=[0,0];
    gMediaTouchMvInProgress=0;
    gMediaWheelEvt=0;
    gMediaWheelLastEvt=0;  
    gMediaDoubleTapTimer=0;
}

// ######### evt Handler ##############// 


function fullScreenRequest()
{
	var container = document.getElementById('game');
	//if(container.webkitRequestFullScreen) container.webkitRequestFullScreen();
	//if(container.mozRequestFullScreen)	container.mozRequestFullScreen();
}

function mediaMouseMove(evt) {
    gMediaTouchMode = false;
	speedCoef = 2.5;
	gMediaCamMvVec[0] += speedCoef*evt.movementX/screen.width;
	gMediaCamMvVec[1] += speedCoef*evt.movementY/screen.height;
}

function mediaSetKeyDownFct(evt)
{
    if (evt.key=="ArrowUp" || evt.key=="z" ){
        gMediaKeyPressed["Up"]=1;
        gMediaKeyPressed["Down"]=0;
    }
    else if (evt.key=="ArrowDown" || evt.key=="s" ){
        gMediaKeyPressed["Up"]=0;
        gMediaKeyPressed["Down"]=1;
    }
    else if (evt.key=="ArrowRight" || evt.key=="d" ){
        gMediaKeyPressed["Left"]=0;
        gMediaKeyPressed["Right"]=1;
    }
    else if (evt.key=="ArrowLeft" || evt.key=="q" ){
        gMediaKeyPressed["Left"]=1;
        gMediaKeyPressed["Right"]=0;
    }
    gMediaKeyPressed[evt.key]=1;
}

function mediaSetKeyUpFct(evt)
{
    if (evt.key=="ArrowUp" || evt.key=="z" ){gMediaKeyPressed["Up"]=0;}
    else if (evt.key=="ArrowDown" || evt.key=="s" ){gMediaKeyPressed["Down"]=0;}
    else if (evt.key=="ArrowRight" || evt.key=="d" ){gMediaKeyPressed["Right"]=0;}
    else if (evt.key=="ArrowLeft" || evt.key=="q" ){gMediaKeyPressed["Left"]=0;}
    gMediaKeyPressed[evt.key]=0;
}

function mediaIsKey(name)
{   
    return (gMediaKeyPressed[name]>0);
}

function mediaSetMouseUpFct(evt){
	if (evt.button==0) 
	gMediaKeyPressed["Fire"]=0;
}

function mediaSetMouseDownFct(evt){	
    fullScreenRequest();
	if (evt.button==0)
    gMediaKeyPressed["Fire"]=1;
}


function mediaWheelFct(evt){
    if((timeGetCurrentInMs() - gMediaWheelLastEvt) > 100)
    {
        gMediaWheelLastEvt = timeGetCurrentInMs();
        gMediaWheelEvt=1;
    }        
   	
}

function mediaWheelEvt(){ 
    var ret = gMediaWheelEvt;
    gMediaWheelEvt = 0;
    return (ret);
}

function mediaGetCamMvVector()
{
    var out = gMediaCamMvVec;
    gMediaCamMvVec=[0,0];
    return out;
}


function mediaIsMvtAsked(){

    return (
        gMediaKeyPressed["Up"]==1 || 
        gMediaKeyPressed["Down"]==1 ||
        gMediaKeyPressed["Right"]==1 || 
        gMediaKeyPressed["Left"]==1 ||
        gMediaTouchMvInProgress
    );
}


function mediaGetMvAngle()
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
    gMediaTouchMode=true;
    var touches = evt.changedTouches;
    currentTime = timeGetCurrentInMs();

    // Convert Double tap to fire
    if (((currentTime-gMediaDoubleTapTimer)<200) &&  
        (touches.length==1)   &&
        (Math.abs(gMediaDoubleTapX - touches[0].pageX)<50) &&
        (Math.abs(gMediaDoubleTapY - touches[0].pageY)<50))
    {
        
        gMediaKeyPressed["Fire"]=1;
    }

    if(touches.length==1)
    {
        gMediaDoubleTapTimer = currentTime;
        gMediaDoubleTapX =touches[0].pageX;
        gMediaDoubleTapY =touches[0].pageY;
    }


    fullScreenRequest();	
    for (var i=0; i<touches.length; i++) {
      var id = touches[i].identifier;
      gMediaTouchStartPos[id] = [ touches[i].pageX,touches[i].pageY];
    }
}


function mediaSetTouchMove(evt){
    gMediaTouchMode=true;
    fullScreenRequest();		
    var touches = evt.changedTouches;
    for (var i=0; i<touches.length; i++) {
        var id = touches[i].identifier;
        var startPos = gMediaTouchStartPos[id];
        var touchDir =[touches[i].clientX-startPos[0],touches[i].clientY-startPos[1]];
        if (startPos[0]<(screen.width/2))
        {
            gMediaTouchMvInProgress=1;
            gMediaTouchMvAngle = Math.atan2(-touchDir[0],-touchDir[1]);
            
        }
        else
        {
            speedCoef = 3.5;
            gMediaCamMvVec[0] += speedCoef*touchDir[0]/screen.width;
            gMediaCamMvVec[1] += speedCoef*touchDir[1]/screen.height;    
            gMediaTouchStartPos[id] = [ touches[i].pageX,touches[i].pageY];
        }
    }
    evt.preventDefault();
    evt.stopPropagation();
}





function mediaSetTouchEnd(evt){	
    var touches = evt.changedTouches;
    for (var i=0; i<touches.length; i++) {
        var id = touches[i].identifier;
        var startPos = gMediaTouchStartPos[id];
        if (startPos[0]<(screen.width/2))
        { 
            gMediaTouchMvInProgress=0;
        }
        else
        {
            gMediaTouchCamMvVec=[0,0];
        }
    }
    
    gMediaKeyPressed["Fire"]=0
}

function mediaIsTouchModeActivated(){ return  gMediaTouchMode};

