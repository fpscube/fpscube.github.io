// Game Model
var gHero;
var gHeroPos=[];
var gHeroDir=[];
var gHeroLife=0;
var gHeroSpeed=0;
var gHeroFire=false;
var gHeroRunning=false;
var gMediaRunAngle=0;

var gCamPos=[];
var gCamDir=[];
var gCamMvVec=[];

var gEnemies=[];
var gEnemiesCount;
var gEndAnim;
var gGameState;
var gDetailCoef=1;
var gCScreen;


// ######### Init ##############// 

function initGame() {

	// init time utils
	timeInit();

	// game data Init
 	gHeroPos = [0,0,10]; 
	gHeroDir = [1,0,-1];
	gHeroLife = 10;
	gHeroSpeed = 0;
	gHeroFire=false;
	gHeroRunning=false;
	gMediaRunAngle=0;

	gCamPos = [0,0,10]; 
	gSpeedCoef=50;
	gCamDir = [1,0,-1];
	gGameState = "Play"
	gEndAnim = new CTimeAnim();
	gCScreen = new CScreen("canvas3D","canvas2D");

	// gl init
	gl.clearColor(0x00, 0xbf, 0xff, 1.0);	
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);      

	// init gl object
	info2DInit();
	squareInit();
	cubeInit();

	gEnemies=[];
	for(var i =0 ;i<30;i++){
		gEnemies.push(new CHuman([i*10,0,0],Math.random()*8));
	}	
	gHero = new CHuman([0,0,0],2);
	groundInit();
	waterInit();
		  	
	// Animation init
	gLastTime = new Date().getTime();	

	

}

function updateGame() {

	//update time animation
	timeUpdate();
	var gElapsed = timeGetElapsedInS();
	shaderCounter = timeGetCurrentInS()*10;

	// Get Media Info
	gHeroFire = mediaIsKey("Fire"); 
	gCamMvVec = mediaGetCamMvVector();
	gMediaRunAngle = mediaGetRunAngle();
	gHeroRunning = mediaIsRunning();

	//Update Camera Direction
	var mvVector = vec3.create();
	vec3.cross(mvVector,gCamDir,[0,1,0]);
	gCamDir[0] += mvVector[0]*gCamMvVec[0];
	gCamDir[1] -= gCamMvVec[1] ;
	gCamDir[2] += mvVector[2]*gCamMvVec[0];
	vec3.normalize(gCamDir,gCamDir);

	// Game State Machine
    switch (gGameState) {
		case "Play":

			// Update Hero Direction and HeroSpeed
			if (gHeroRunning){
				vec3.rotateY(gHeroDir,gCamDir,[0,0,0],gMediaRunAngle);
				gHeroSpeed = 50;
			}
			else
			{
				gHeroSpeed = 0;
			}
					
			//Update Hero Position
			gHeroPos[0] += gHeroSpeed*gElapsed*gHeroDir[0];
			gHeroPos[2] += gHeroSpeed*gElapsed*gHeroDir[2];		
			gHeroPos[1] = groundGetY(gHeroPos[0],gHeroPos[2]) + 5.5;		

			//Update Cam Position				
			var projDir = [];
			vec3.rotateY(projDir,gCamDir,[0,0,0],0.125);
			gCamPos[0] = gHeroPos[0] - projDir[0]*15;
			gCamPos[2] = gHeroPos[2] - projDir[2]*15;
			gCamPos[1] = groundGetY(gCamPos[0],gCamPos[2]) + 10.0 ;


			// Update Enemies
			var hitTarget=false;
			var isInTarget=false;
			gEnemiesCount = gEnemies.length;
			for(var i =0 ;i<gEnemies.length;i++){
				gEnemies[i].UpdateEnemie(gCamPos,gCamDir,gHeroPos,gHeroDir,gHeroFire);
				hitTarget =hitTarget || gEnemies[i].HitTarget;
				isInTarget = isInTarget || gEnemies[i].IsInTarget;
				if (gEnemies[i].IsDead()) gEnemiesCount--;
			}	
			if (hitTarget) gHeroLife--;
			
			gHero.UpdateHero(gHeroPos,gHeroDir,gHeroRunning,gHeroFire,gCamDir,gHeroLife<=0);

			if (gHeroLife<=0 )
			{
				gGameState="Lose";
				gEndAnim.start(2000,0,1);
			}	
			else if (gEnemiesCount==0) 
			{
				gGameState="Win";
				gEndAnim.start(2000,0,1);
			}


			break;
		case "Win":
		case "Lose":
			// Update Cam Position
			// Rotate Around Hero
			vec3.rotateY(gCamDir,gCamDir,[0,0,0],gElapsed/4)	
			var projDir = [];
			vec3.rotateY(projDir,gCamDir,[0,0,0],0.125);
			gCamPos[0] = gHeroPos[0] - projDir[0]*15;
			gCamPos[2] = gHeroPos[2] - projDir[2]*15;
			gCamPos[1] = groundGetY(gCamPos[0],gCamPos[2]) + 10.0 ;

			// Update Enemies
			for(var i =0 ;i<gEnemies.length;i++){
				gEnemies[i].UpdateEnemie(gCamPos,gCamDir,gHeroPos,gHeroDir,false);
			}	
			
			gHero.UpdateHero(gHeroPos,gHeroDir,gHeroRunning,gHeroFire,gCamDir,gHeroLife<=0);

			if (gHeroFire && !gEndAnim.running)
			{
				initGame();
			}

			break;
	}

	info2DUpdate(isInTarget,hitTarget,gHeroLife,gEnemiesCount,gGameState);


}

function drawGame() {
	
	updateGame();


	// new viewport and clear Display 
	gCScreen.updateViewPortAndCanvasSize(gl);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Perceptive projection
	mat4.perspective(pMatrix,45, gl.viewportWidth / gl.viewportHeight, 1.0, 1000.0);

	// Camera managment
	var lookAtMatrix = mat4.create();
	viewPos = [gCamPos[0] + gCamDir[0],gCamPos[1] + gCamDir[1],gCamPos[2] + gCamDir[2]];
	mat4.lookAt(lookAtMatrix,gCamPos,viewPos,[0,1,0]);
	mat4.multiply(pMatrix,pMatrix,lookAtMatrix)
	
	groundDraw();
	waterDraw();	
	//enemiesDraw();
	for(var i =0 ;i<gEnemies.length;i++){
		gEnemies[i].Draw();
	}	
	gHero.Draw();

	//Draw Info 2D
	info2DDraw();


}
