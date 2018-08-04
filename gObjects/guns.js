var gunsBulletFragmentShader= `
precision lowp float;

uniform vec4 uVertexColor;   

void main() {
  gl_FragColor = uVertexColor;
}
`;

var GunsInst;

class CGuns
{
    constructor()
    {
        this.BulletShaderProgram =  SphereInitShaders(SphereVertexShader,gunsBulletFragmentShader); 
        
        GunsInst = this;
        
        this.BulletList = [];

        this.Bazooka =  new CGunsBazooka();
        this.BazookaPos = [-300.0,5.0,-450.0];
        this.BazookaPos[1] += groundGetY(this.BazookaPos[0],this.BazookaPos[2]);
        this.BazookaCollisionMatrix = mat4.create();

        this.Uzi = new CGunsUzi();
        this.UziPos = [300.0,5.0,450.0];
        this.UziPos[1] += groundGetY(this.UziPos[0],this.UziPos[2]);
        this.UziCollisionMatrix = mat4.create();

        this.No = new CGunsNo();
    }

    update()
    {
        var deleteList=[];
        for(var i =0 ;i<this.BulletList.length;i++){
            
            if (this.BulletList[i].hasExplosed())
            {
                deleteList.push(i);
            }
            else
            {
                this.BulletList[i].update();
            }
        }  
        for(var i =0 ;i<deleteList.length;i++){
            this.BulletList.splice(deleteList[i],1 );
        }
    }

    checkCollision(pCurrentGun,pPos1,pPos2)
    {
        if(!this.Bazooka.Selected && 
            Sphere.GetCollisionPos(pPos1,pPos2,this.BazookaCollisionMatrix,null,0) != null)
        {
            pCurrentGun.Selected = false;
            this.Bazooka.Selected = true;
            this.Bazooka.WeaponsCount = 10;
            return this.Bazooka;
        }
        else if(!this.Uzi.Selected && 
            Sphere.GetCollisionPos(pPos1,pPos2,this.UziCollisionMatrix,null,0) != null)
        {
            pCurrentGun.Selected = false;
            this.Uzi.Selected = true;
            this.Uzi.WeaponsCount = 100  ;
            return this.Uzi;
        }
        return pCurrentGun;
    }

    draw()
    {

        mat4.identity(mvMatrix);

        for(var i =0 ;i<this.BulletList.length;i++){
            
            this.BulletList[i].draw();
        }
    
        if (!this.Bazooka.Selected)  
        {
            mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,this.BazookaPos); 
            mat4.rotate(mvMatrix,mvMatrix, timeGetAnimRad(), [0 , 1, 0]);    
            mvPushMatrix();
                mat4.scale(mvMatrix,mvMatrix,[4.0,6.0,10.0]);
                mat4.copy(this.BazookaCollisionMatrix,mvMatrix) ;
            mvPopMatrix(); 
            
            
            mat4.scale(mvMatrix,mvMatrix,[3.0,3.0,3.0]);
            this.Bazooka.draw();
            mvPopMatrix(); 
        }
            
        if (!this.Uzi.Selected)  
        {
            mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,this.UziPos);   
            mat4.rotate(mvMatrix,mvMatrix, timeGetAnimRad(), [0 , 1, 0]);   
            mat4.rotate(mvMatrix,mvMatrix, degToRad(-90), [ 1, 0, 0]);  
            mvPushMatrix();
                mat4.scale(mvMatrix,mvMatrix,[4.0,4.0,4.0]);
                mat4.copy(this.UziCollisionMatrix,mvMatrix) ;
            mvPopMatrix(); 
            
            mat4.scale(mvMatrix,mvMatrix,[3.0,3.0,3.0]);
            
            mat4.translate(mvMatrix,mvMatrix,[-1,0,0]);
            this.Uzi.draw();
            mat4.translate(mvMatrix,mvMatrix,[2,0,0]); 
            this.Uzi.draw();
            mvPopMatrix(); 
        }
    }
}


class CGunsNo
{   
    constructor()
    {
        this.Selected = false;
        this.WeaponsCount = 1;
    }
    
    fire(pPos,pDir)
    {

    }
    draw(pFire,pHero)
    {

    }
}

class CGunsUzi
{
    constructor()
    {
        this.Selected = false;
        this.WeaponsCount = 100;
    }

    fire(pPos,pDir)
    {
        GunsInst.BulletList.push(new CBullet([pPos[0]+pDir[2]*1.0 + pDir[0]*5.0  ,pPos[1]+2.5 + pDir[1]*5.0,pPos[2]-pDir[0]*1.0 + pDir[2]*5.0 ],pDir,0.3,1,2000,0.4));
        GunsInst.BulletList.push(new CBullet([pPos[0]-pDir[2]*1.0  + pDir[0]*5.0  ,pPos[1]+2.5 + pDir[1]*5.0,pPos[2]+ pDir[0]*1.0 + pDir[2]*5.0],pDir,0.3,1,2000,0.4));
        //   GunsInst.BulletList.push(new CBullet([pPos[0],pPos[1]+2.5,pPos[2]],pDir,1,10,0));
        this.WeaponsCount--;
     
    }

    draw(pFire,pHero)
    {

        //Gun    
        shaderVertexColorVector = [0.9,0.9,1.0,1.0];
        mvPushMatrix();
        mat4.scale(mvMatrix,mvMatrix,[0.3,1.0,0.3]);
        Sphere.Draw(SphereShaderProgram);
        mvPopMatrix();
        mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix, [0.0,0.4,-0.5]);
        mat4.scale(mvMatrix,mvMatrix,[0.2,0.2,0.6]);        
        Sphere.Draw(SphereShaderProgram);
        mvPopMatrix();   
        
        shaderVertexColorVector = [0.99,0.76,0.67,1.0];  

        if(pFire)
        {
            
            mvPushMatrix();	
            mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
            mat4.scale(mvMatrix,mvMatrix,[0.25,1.0,1.0]);
            (pHero) ? squareDraw(HumanFireHeroShaderProgram) : squareDraw(HumanFireEnemyShaderProgram);
            mvPopMatrix();
            mvPushMatrix();	
            mat4.translate(mvMatrix,mvMatrix, [0.0,-1.1,0.0]);
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [1, 0, 0]);
            mat4.scale(mvMatrix,mvMatrix,[1.2,0.15,1.2]);
            if (pHero)
            {
                gl.uniform1f (HumanFireHeroShaderProgram.counter, shaderCounter);
                squareDraw(HumanFireHeroShaderProgram)
            }   
            else
            {
                squareDraw(HumanFireEnemyShaderProgram);
            }
            mvPopMatrix();
        }
    }

}

class CGunsBazooka
{
    constructor()
    {
        this.Selected = false;
        this.FireReady= true;
        this.WeaponsCount = 10;
    }

    
    fire(pPos,pDir)
    {
        GunsInst.BulletList.push(new CBullet(pPos,pDir,0.6,70,300,3));
        this.WeaponsCount--;
    }

    draw()
    {
        var toogle=0;

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
                Sphere.Draw(SphereShaderProgram);   
            mvPopMatrix(); 
        }

        if(this.Selected)
        {            
            mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,0.2,0.7]); 
                mat4.scale(mvMatrix,mvMatrix,[0.2,1.0,0.2]);
                Sphere.Draw(SphereShaderProgram);   
            mvPopMatrix(); 
        
            
            mvPushMatrix();   
            mat4.translate(mvMatrix,mvMatrix,[1.2,0.6,0.7]); 
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 0, 1]);
                mat4.scale(mvMatrix,mvMatrix,[1.5,0.2,0.2]);
                Sphere.Draw(SphereShaderProgram);   
            mvPopMatrix(); 
        }
    
    
    }
}


function  _gunsAllCollisionGetPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
    var collision = pCollision;
    collision = CEnemiesInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = CTreesInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = CStoneInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = groundGetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = groundWaterGetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);

    return collision;
} 

class CBullet
{

    constructor(pPos,pDir,pSize,pSizeExp,pSpeed,pLifeTime)
    {
        this.Pos=[pPos[0],pPos[1],pPos[2]];
        this.Dir=[pDir[0],pDir[1],pDir[2]];
        this.Speed=[pDir[0]*pSpeed,pDir[1]*pSpeed,pDir[2]*pSpeed];
        this.Scale = pSize;
        this.ScaleExp = pSizeExp;
        this.Explosion = false;
        this.Color = [0.9,0.8,0.1,0.8]; 
        this.ExplosionAnim = new CTimeAnim();
        this.StartTimeInS = timeGetCurrentInS();
        this.LifeTime = pLifeTime;
    }

    hasExplosed()
    {
        return (this.Explosion && this.ExplosionAnim.running==false)
    }
    

    update()
    {
        var elapsed = timeGetElapsedInS();

        this.Color = [1.0,1.0,0.0,1.0]; 
        var startPos=[];
        var newPos=[];
        var collision ;

        if (!this.Explosion)
        {
 
            newPos[0] = this.Pos[0] + this.Speed[0]*elapsed;
            newPos[1] = this.Pos[1] + this.Speed[1]*elapsed;
            newPos[2] = this.Pos[2] + this.Speed[2]*elapsed
            collision = _gunsAllCollisionGetPoint(this.Pos,newPos,null,0);

            if(this.scale > 1.0)
            {
               
                startPos[0] = this.Pos[0] - this.Dir[2]*this.Scale;
                startPos[1] = this.Pos[1];
                startPos[2] = this.Pos[2] + this.Dir[1]*this.Scale;
                newPos[0] = startPos[0] + this.Speed[0]*elapsed;
                newPos[1] = startPos[1] + this.Speed[1]*elapsed;
                newPos[2] = startPos[2] + this.Speed[2]*elapsed;
                collision = _gunsAllCollisionGetPoint(startPos,newPos,collision,0);

                startPos[0] = this.Pos[0] + this.Dir[2]*this.Scale;
                startPos[1] = this.Pos[1];
                startPos[2] = this.Pos[2] - this.Dir[1]*this.Scale;
                newPos[0] = startPos[0] + this.Speed[0]*elapsed;
                newPos[1] = startPos[1] + this.Speed[1]*elapsed;
                newPos[2] = startPos[2] + this.Speed[2]*elapsed;
                collision = _gunsAllCollisionGetPoint(startPos,newPos,collision,0);        

                startPos[0] = this.Pos[0];
                startPos[1] = this.Pos[1] + this.Scale;
                startPos[2] = this.Pos[2];
                newPos[0] = startPos[0] + this.Speed[0]*elapsed;
                newPos[1] = startPos[1] + this.Speed[1]*elapsed;
                newPos[2] = startPos[2] + this.Speed[2]*elapsed;
                collision = _gunsAllCollisionGetPoint(startPos,newPos,collision,0);
                
                startPos[0] = this.Pos[0];
                startPos[1] = this.Pos[1] - this.Scale;
                startPos[2] = this.Pos[2];
                newPos[0] = startPos[0] + this.Speed[0]*elapsed;
                newPos[1] = startPos[1] + this.Speed[1]*elapsed;
                newPos[2] = startPos[2] + this.Speed[2]*elapsed;
                collision = _gunsAllCollisionGetPoint(startPos,newPos,collision,0);
            }

            if (collision != null && collision[3]!=null) 
            {
                var human = collision[3];
                human.BulletCollision();
            }

            if ((collision != null) || ((timeGetCurrentInS()-this.StartTimeInS) > this.LifeTime))  
            {
                this.Scale = 0;
                this.Speed = [0,0,0];
                this.Explosion = true;
                this.ExplosionAnim.start(400,0,1);
                this.Color = [0.9,0.5,0.0,0.9]; 
            }
            else{

                vec3.copy(this.Pos,newPos);
            }
        }
        else
        {      
            this.Color = [1.0,1.0,0.0,1.0]; 
            this.Scale =  this.ExplosionAnim.coef**2 *this.ScaleExp;
            this.Color[3] = 1.0-(this.ExplosionAnim.coef)**3*0.4;
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
        Sphere.Draw(GunsInst.BulletShaderProgram);   
        mvPopMatrix();
    }



}