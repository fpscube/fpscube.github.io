
var CStoneInst;


class CStone
{

    constructor(pGame)
    {
        CStoneInst = this;
        this.CollisionMatrixList = [];this.turn=0;
        if (pGame.Level["stone1"]==null) pGame.Level["stone1"]=[];
        if (pGame.Level["stone2"]==null) pGame.Level["stone2"]=[];
        if (pGame.Level["stone3"]==null) pGame.Level["stone3"]=[];
        if (pGame.Level["tower1"]==null) pGame.Level["tower1"]=[];
        if (pGame.Level["tower2"]==null) pGame.Level["tower2"]=[];

        this.updateCreation(pGame)

    }

    _clearCollisionMatrix()
    {
        this.CollisionMatrixList = [];
    }

    _storeCollisionMatrix(pMvMatrix)
    {
        var collMat = mat4.create();
        mat4.copy(collMat,pMvMatrix);
        this.CollisionMatrixList.push(collMat);
    }


    updateCreation(pGame)
    {

    }

    getCollisionPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
    {
        var collision = pCollision ;
        for (var i=0;i<this.CollisionMatrixList.length;i++)
        {
            collision = Sphere.GetCollisionPos(pRayPoint1,pRayPoint2,this.CollisionMatrixList[i],collision,pDistSquaredOffset);
        }

        return collision;
    }

    draw()
    {
        this._clearCollisionMatrix();

        mat4.identity(mvMatrix);

        //stone1
        var levelInfo = GameInst.Level.stone1;
        for(i=0;i<levelInfo.length;i++)
        {
            shaderVertexColorVector = levelInfo[i].color;
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,levelInfo[i].position); 
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(0), [1, 0, 0]);   
                mat4.scale(mvMatrix,mvMatrix,[40.0,3.0,40.0]); 
                Sphere.Draw(SphereShaderProgram);   
                this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix();
        }

        //stone2
        var levelInfo = GameInst.Level.stone2;
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        for(i=0;i<levelInfo.length;i++)
        {

            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,levelInfo[i].position);  
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(85), [1, 0, 0]);   
                mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,25.0]); 
                Sphere.Draw(SphereShaderProgram); 
                this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix();
    
        }

        //stone3
        var levelInfo = GameInst.Level.stone3;
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        for(i=0;i<levelInfo.length;i++)
        {
    
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,levelInfo[i].position);
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(-5), [0, 0,1]);
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(84), [1, 0, 0]);   
                mat4.scale(mvMatrix,mvMatrix,[50.0,200.0,10.0]); 
                Sphere.Draw(SphereShaderProgram); 
                this._storeCollisionMatrix(mvMatrix);
            mvPopMatrix();


        }

        //Tower 1
        var levelInfo = GameInst.Level.tower1;
        for(var iLevel=0;iLevel<levelInfo.length;iLevel++)
        {
            mvPushMatrix();          
            mat4.translate(mvMatrix,mvMatrix,levelInfo[iLevel].position);       

            for (var i=70;i<(360);i+=45)
            {
                var c = (i%17)/17.0+0.5;
                
                shaderVertexColorVector = [c,c,0.2,1.0]; 
                mvPushMatrix();   
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(i+180), [0, 1, 0]);  
                mat4.translate(mvMatrix,mvMatrix,[0.0,50.0,-60.0]); 
                mat4.rotate(mvMatrix,mvMatrix,  degToRad(115), [1, 0, 0]);   
                mat4.scale(mvMatrix,mvMatrix,[60.0,6.0,350]); 
                Sphere.Draw(SphereShaderGlowProgram);   
                this._storeCollisionMatrix(mvMatrix);
                mvPopMatrix(); 
            }               
            mvPopMatrix();
        }

        //Tower 2
        var levelInfo = GameInst.Level.tower2;    
        for(var iLevel=0;iLevel<levelInfo.length;iLevel++)
        {     
            mvPushMatrix();       
            mat4.translate(mvMatrix,mvMatrix,levelInfo[iLevel].position);     
                for (var i=70;i<(360);i+=45)
                {
                    var c = (i%17)/17.0+0.5;
                    
                    shaderVertexColorVector = [0.1,c*0.8,c*1.2,1.0]; 
                    mvPushMatrix();   
                    mat4.rotate(mvMatrix,mvMatrix,  degToRad(i+180), [0, 1, 0]);  
                    mat4.translate(mvMatrix,mvMatrix,[0.0,50.0,-60.0]); 
                    mat4.rotate(mvMatrix,mvMatrix,  degToRad(140), [1, 0, 0]);   
                    mat4.scale(mvMatrix,mvMatrix,[60.0,6.0,350]); 
                    Sphere.Draw(SphereShaderGlowProgram);   
                    this._storeCollisionMatrix(mvMatrix);
                    mvPopMatrix(); 
                }   
            mvPopMatrix();          
        }
      
    }





}


