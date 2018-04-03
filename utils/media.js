
var gMediaKeyPressed={};
var gMediaTouchStartPos=[];
var gMediaTouchAngle=0;
var gMediaTouchInProgress=0;

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


function mediaIsRunning(event){

    return (
        gMediaKeyPressed["Up"]==1 || 
        gMediaKeyPressed["Down"]==1 ||
        gMediaKeyPressed["Right"]==1 || 
        gMediaKeyPressed["Left"]==1 ||
        gMediaTouchInProgress
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
    else if (gMediaTouchInProgress) {angle = gMediaTouchAngle;}
    return angle;
}

function mediaSetTouchStart(event){	
    gMediaTouchStartPos[0] = event.touches[0].clientX;
    gMediaTouchStartPos[1] = event.touches[0].clientY;
}


function mediaSetTouchMove(event){	
    gMediaTouchInProgress=1;
    touchVector=[event.touches[0].clientX-gMediaTouchStartPos[0],event.touches[0].clientY-gMediaTouchStartPos[1]];

    gMediaTouchAngle = Math.atan2(-touchVector[0],-touchVector[1]);
}

function mediaSetTouchEnd(event){	
    gMediaTouchInProgress=0;
}


