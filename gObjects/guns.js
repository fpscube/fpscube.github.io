

var gunsFragmentShader= `
precision lowp float;

varying vec3 v_normal;     
uniform vec4 uVertexColor;   

void main() {
  float light;

  light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 

  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
}
`;


var gunsBulletFragmentShader= `
precision lowp float;

uniform vec4 uVertexColor;   

void main() {
  gl_FragColor = uVertexColor;
}
`;

var gunsVertexShader = `    
	attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
    uniform mat4 uMVInverseTransposeMatrix;    
    
    varying vec3 v_normal; 
    
	void main() {


	// Multiply the position by the matrix.
	gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	// orient the normals and pass to the fragment shader
	v_normal =normalize( mat3(uMVInverseTransposeMatrix) * aVertexNormal);

	}
`;

var gunsShaderProgram;
var gunsExpShaderProgram;
var gunPos;
var gunDir;
var gunControlled;
var gunCollisionMatrix;
var gunBulletList;

function gunsInit()
{
    gunsShaderProgram = initShaders(gunsVertexShader,gunsFragmentShader);
    gunsExpShaderProgram = initShaders(gunsVertexShader,gunsBulletFragmentShader);
   // gunPos = [-50.0,35,0]; 
    gunPos = [10.0,groundGetY(10.0,20.0)+20.0,20];
    gunCollisionMatrix = mat4.create();
    gunControlled =false;
    gunDir = []; 
    gunBulletList = [];
}

function gunsUpdate(pVal)
{
    var deleteList=[];
    for(var i =0 ;i<gunBulletList.length;i++){
        
        if (gunBulletList[i].hasExplosed())
        {
            deleteList.push(i);
        }
        else
        {
            gunBulletList[i].update();
        }
    }  
    for(var i =0 ;i<deleteList.length;i++){
            gunBulletList.splice(deleteList[i],1 );
    }
    
}

function gunsControl(pVal)
{
    gunControlled = pVal;
}


function gunsCheckCollision(pPos1,pPos2)
{
    return (Sphere.GetCollisionPos(pPos1,pPos2,gunCollisionMatrix,null,0));

}

function gunsDraw(dist)
{   

    mat4.identity(mvMatrix);

    for(var i =0 ;i<gunBulletList.length;i++){
        
        gunBulletList[i].draw();
    }

    if (gunControlled)   return;
    

               this.Color = [0.9,0.9,0.0,1.0]; 
    mat4.translate(mvMatrix,mvMatrix,gunPos); 
    mat4.rotate(mvMatrix,mvMatrix, timeGetAnimRad(), [0 , 1, 0]);    
    mvPushMatrix();
    mat4.translate(mvMatrix,mvMatrix,[0.0,0.0,0.5]); 
    mat4.scale(mvMatrix,mvMatrix,[3.0,3.0,3.0]);
    mat4.scale(mvMatrix,mvMatrix,[3.0,5.0,5.0]);
    mat4.copy(gunCollisionMatrix,mvMatrix) ;
    //  Sphere.Draw(gunsShaderProgram);   
    mvPopMatrix(); 
    
    mat4.scale(mvMatrix,mvMatrix,[3.0,3.0,3.0]);
    gunsDrawFct();
    
}

function gunsDrawFct(pPos)
{     
   
    var toogle=0;
    //Process collision matrix
    for (var i=0;i<360;i+=20)
    {    
    	toogle = !toogle;
		shaderVertexColorVector[0] +=0.01;
		shaderVertexColorVector[1] +=0.02;
		shaderVertexColorVector[2] +=0.02;
		mvPushMatrix();
        shaderVertexColorVector = [0.2,0.2,0.4,1.0];
        if (toogle)shaderVertexColorVector = [0.2,0.2,0.8,1.0];
		mat4.rotate(mvMatrix,mvMatrix,  degToRad(i), [0, 0, 1]);
		mat4.translate(mvMatrix,mvMatrix,[0.4,0.0,0.0]); 
			mat4.scale(mvMatrix,mvMatrix,[0.2,0.6,2.5]);
			Sphere.Draw(gunsShaderProgram);   
		mvPopMatrix(); 
    }
    
    
    
    if (!gunControlled)   return;

    mvPushMatrix();
    mat4.translate(mvMatrix,mvMatrix,[0.0,0.2,0.7]); 
        mat4.scale(mvMatrix,mvMatrix,[0.2,1.0,0.2]);
        Sphere.Draw(gunsShaderProgram);   
    mvPopMatrix(); 

    
    mvPushMatrix();
    mat4.translate(mvMatrix,mvMatrix,[1.2,0.6,0.7]); 
		mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 0, 1]);
        mat4.scale(mvMatrix,mvMatrix,[1.5,0.2,0.2]);
        Sphere.Draw(gunsShaderProgram);   
    mvPopMatrix(); 




}

function gunsFire(pSize,pSpeed,pDir,pPos)
{

    this.Scale = pSize;
    gunBulletList.push(new CBullet(pPos,pDir,pSize,pSpeed));

}


class CBullet
{

    constructor(pPos,pDir,pSize,pSpeed)
    {
        this.Pos=[pPos[0],pPos[1],pPos[2]];
        this.Dir=[pDir[0],pDir[1],pDir[2]];
        this.Speed=[pDir[0]*pSpeed,pDir[1]*pSpeed,pDir[2]*pSpeed];
        this.Scale = pSize;
        this.Explosion = false;
        this.Color = [0.9,0.8,0.1,0.8]; 
        this.ExplosionAnim = new CTimeAnim();
        this.StartTimeInS = timeGetCurrentInS();
    }

    hasExplosed()
    {
        return (this.Explosion && this.ExplosionAnim.running==false)
    }

    update()
    {
        var elapsed = timeGetElapsedInS();

        this.Color = [0.9,0.1,0.1,1.0]; 
        var startPos=[];
        var newPos=[];
        var collision ;

        if (!this.Explosion)
        {
            startPos[0] = this.Pos[0] - this.Dir[2]*this.Scale;
            startPos[1] = this.Pos[1];
            startPos[2] = this.Pos[2] + this.Dir[1]*this.Scale;
            newPos[0] = startPos[0] + this.Speed[0]*elapsed;
            newPos[1] = startPos[1] + this.Speed[1]*elapsed;
            newPos[2] = startPos[2] + this.Speed[2]*elapsed;
            collision = CEnemiesInst.getCollisionPoint(startPos,newPos,null,0);
            collision = CStoneInst.getCollisionPoint(startPos,newPos,collision,0);

            startPos[0] = this.Pos[0] + this.Dir[2]*this.Scale;
            startPos[1] = this.Pos[1];
            startPos[2] = this.Pos[2] - this.Dir[1]*this.Scale;
            newPos[0] = startPos[0] + this.Speed[0]*elapsed;
            newPos[1] = startPos[1] + this.Speed[1]*elapsed;
            newPos[2] = startPos[2] + this.Speed[2]*elapsed;
            collision = CEnemiesInst.getCollisionPoint(startPos,newPos,collision,0);
            collision = CStoneInst.getCollisionPoint(startPos,newPos,collision,0);
        

            startPos[0] = this.Pos[0];
            startPos[1] = this.Pos[1] + this.Scale;
            startPos[2] = this.Pos[2];
            newPos[0] = startPos[0] + this.Speed[0]*elapsed;
            newPos[1] = startPos[1] + this.Speed[1]*elapsed;
            newPos[2] = startPos[2] + this.Speed[2]*elapsed;
            collision = CEnemiesInst.getCollisionPoint(startPos,newPos,collision,0); 
            collision = CStoneInst.getCollisionPoint(startPos,newPos,collision,0);
            
            startPos[0] = this.Pos[0];
            startPos[1] = this.Pos[1] - this.Scale;
            startPos[2] = this.Pos[2];
            newPos[0] = startPos[0] + this.Speed[0]*elapsed;
            newPos[1] = startPos[1] + this.Speed[1]*elapsed;
            newPos[2] = startPos[2] + this.Speed[2]*elapsed;
            collision = CEnemiesInst.getCollisionPoint(startPos,newPos,collision,0);
            collision = CStoneInst.getCollisionPoint(startPos,newPos,collision,0);

            newPos[0] = this.Pos[0] + this.Speed[0]*elapsed;
            newPos[1] = this.Pos[1] + this.Speed[1]*elapsed;
            newPos[2] = this.Pos[2] + this.Speed[2]*elapsed
            collision = CEnemiesInst.getCollisionPoint(this.Pos,newPos,collision,0);
            collision = CStoneInst.getCollisionPoint(startPos,newPos,collision,0);

            if (collision != null && collision[3]!=null) 
            {
                var human = collision[3];
                human.BulletCollision();
            }

            if(groundGetY(newPos[0],newPos[2])> newPos[1])
            {
                collision = true;
            }

        
            if ((collision!=null) || ((timeGetCurrentInS()-this.StartTimeInS) > 3.0))  
            {
                this.Scale = 0;
                this.Speed = [0,0,0];
                this.Explosion = true;
                this.ExplosionAnim.start(600,0,1);
                this.Color = [0.9,0.9,0.0,1.0]; 
            }
            else{

                vec3.copy(this.Pos,newPos);
            }
            // this.Speed[1]-=50*elapsed;;
            
        }
        else
        {      
            this.Color = [0.9,0.9,0.0,1.0]; 
            this.Scale =  this.ExplosionAnim.coef**6 *100;
            this.Color[3] = 1.0-(this.ExplosionAnim.coef)**3*0.8;
            if(!this.ExplosionAnim.running)  this.Explosion = false;
            var humanList = CEnemiesInst.getHumansInSphere(this.Pos,this.Scale);
            for(var i =0 ;i<humanList.length;i++){
                humanList[i].BulletCollision();
            }
        }
    }

    draw()
    {
        shaderVertexColorVector = this.Color; 
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,this.Pos); 
        mat4.scale(mvMatrix,mvMatrix,[this.Scale,this.Scale,this.Scale]);        
        Sphere.Draw(this.Explosion?gunsExpShaderProgram:gunsShaderProgram);   
        mvPopMatrix();
    }



}