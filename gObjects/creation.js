var CreationInt;

var CreationConf=
{
    "stone1":{"MaxObject":1000,"genNbZones":0,"genNbPZ":0,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "stone2":{"MaxObject":1000,"genNbZones":0,"genNbPZ":2,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "stone3":{"MaxObject":1000,"genNbZones":3,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":5,"genSizeX":1500,"genSizeZ":1500},
    "tower1":{"MaxObject":1000,"genNbZones":5,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "tower2":{"MaxObject":1000,"genNbZones":4,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":100,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "trees":{"MaxObject":1000,"genNbZones":4,"genNbPZ":7,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":-5,"genSizeX":1500,"genSizeZ":1500},
    "enemies":{"MaxObject":1000,"genNbZones":3,"genNbPZ":10,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":500,"genSizeX":1500,"genSizeZ":1500},
    "vehicules":{"MaxObject":1,"genNbZones":1,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":100,"genYGroundOffset":20,"genSizeX":100,"genSizeZ":100}
};



class CCreation
{
    constructor()
    {
		this.CamSpeed = 50;
        this.MenuLevel = 1;
        this.PrevMenuLevel = 1;
        this.SelectedObject = ""
        this.SelectedObjectId = -1
        this.CameraDist = 50.0;
        this.ObjName = "none";
        this.PrevObjName = "none";
        this.ObjDisplayName = "";
        this.ObjDisplayPos= null;
        CreationInt=this;
    }

    _mvCamToSelectedObject()
    {
        if(this.SelectedObjectId!=-1)
        {

            GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*this.CameraDist;
            GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*this.CameraDist;
            GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*this.CameraDist;
        }
    }

    

    _mvCamToSelectedObjectToCam()
    {
        if(this.SelectedObjectId!=-1)
        {

           this.SelectedObjectType[this.SelectedObjectId].position[0] = GameInst.CamDir[0]*this.CameraDist;
           this.SelectedObjectType[this.SelectedObjectId].position[2] = GameInst.CamDir[2]*this.CameraDist;
           this.SelectedObjectType[this.SelectedObjectId].position[1] = GameInst.CamDir[1]*this.CameraDist;
        }
    }


    
    levelClear(pGame)
    {
        for( var key in CreationConf)
        {
            pGame.Level[key]=[];
        }
    }
 

    levelGeneration(pGame)
    {
        for( var key in CreationConf)
        {
            this.objectGeneration(pGame,key);
        }
    }
 

    objectGeneration(pGame,pObjectName)
    {
        var conf = CreationConf[pObjectName];

        pGame.Level[pObjectName]=[];
        for (var lZone=0;lZone<conf.genNbZones;lZone++)
        {

            var lZoneSizeX = Math.random()*(conf.genZoneSizeMax-conf.genZoneSizeMin)+conf.genZoneSizeMin;
            var lZoneSizeZ = Math.random()*(conf.genZoneSizeMax-conf.genZoneSizeMin)+conf.genZoneSizeMin;
            var lZonePosX = (Math.random()-0.5)*conf.genSizeX;
            var lZonePosZ = (Math.random()-0.5)*conf.genSizeZ;

            
            for(var lObjId=0;lObjId<(conf.genNbPZ);lObjId++)
            {

                var x = (Math.random()-0.5)*lZoneSizeX + lZonePosX;
                var z = (Math.random()-0.5)*lZoneSizeZ + lZonePosZ;
                var y = groundGetY(x,z) + conf.genYGroundOffset;

                pGame.Level[pObjectName].push({
                    "position":[x,y,z],
                    "color":[0,0,0]
                })
    
            }
        }

    }


    update()
    {

		var gElapsed = timeGetElapsedInS();
        if(mediaIsMvtAsked())
        {
            var mvDir = [0,0,0];
            vec3.rotateY(mvDir,GameInst.CamDir,[0,0,0],mediaGetMvAngle());
            
            GameInst.CamPos[0] = GameInst.CamPos[0] +  mvDir[0]*gElapsed*this.CamSpeed;
            GameInst.CamPos[2] = GameInst.CamPos[2] +  mvDir[2]*gElapsed*this.CamSpeed;
            GameInst.CamPos[1] = GameInst.CamPos[1] +  mvDir[1]*gElapsed*this.CamSpeed;
        }
        if(mediaIsKey(" "))//jump
        {

            GameInst.CamPos[1] +=gElapsed*this.CamSpeed;
        }


        {

            var deltaWheel = mediaWheelEvt();
            if(deltaWheel<0 && this.SelectedObjectId!=-1) 
            {
                this.CameraDist*=0.75;
                if(this.CameraDist<50) this.CameraDist=50;
            }  
            if(deltaWheel>0 && this.SelectedObjectId!=-1)
            {
                this.CameraDist*=1.5;
                if(this.CameraDist>2500) this.CameraDist=2500;
            } 
    
            
            if( this.SelectedObjectId!=-1)
            {
                console.log(this.SelectedObjectType)
                this.SelectedObjectType[this.SelectedObjectId].position = [GameInst.CamPos[0] +  GameInst.CamDir[0]*this.CameraDist,
                                                    GameInst.CamPos[1] +  GameInst.CamDir[1]*this.CameraDist,
                                                    GameInst.CamPos[2] +  GameInst.CamDir[2]*this.CameraDist];
            }                


            if(this.SelectedObjectId!=-1 && (mediaIsKeyOnce('1') || mediaIsKeyOnce("Mouse2")))// CREATE Obj
            {
                var lMaxObject = CreationConf[this.ObjName].MaxObject;
                if(this.SelectedObjectType.length<= lMaxObject)
                {
                    this.SelectedObjectType.push(
                        {   
                            "position":
                                [GameInst.CamPos[0] +  GameInst.CamDir[0]*this.CameraDist,
                                GameInst.CamPos[1] +  GameInst.CamDir[1]*this.CameraDist,
                                GameInst.CamPos[2] +  GameInst.CamDir[2]*this.CameraDist],
                            "color":[0.52,0.7,1.0,0.6],
                        }
                    );
                    this.SelectedObjectId = this.SelectedObjectType.length-1
                    this._mvCamToSelectedObject();
                }
            } 
            else if(this.SelectedObjectId!=-1 && (mediaIsKeyOnce('2') || mediaIsKeyOnce("Mouse3"))) // DELETE Obj
            {
                if(this.SelectedObjectId != -1)
                {
                    this.SelectedObjectType.splice(this.SelectedObjectId,1)  
                    this.SelectedObjectId = -1;
                }      
        
            }            

        }

        if(mediaIsKeyOnce("+"))this.CamSpeed*=2.0;
        if(mediaIsKeyOnce("-"))this.CamSpeed/=2.0;

        if(this.CamSpeed>2000) this.CamSpeed=2000;
        if(this.CamSpeed<10) this.CamSpeed=10;

        if(GameInst.CamPos[0]>3000.0) GameInst.CamPos[0]=3000.0
        if(GameInst.CamPos[0]<-3000.0) GameInst.CamPos[0]=-3000.0
        if(GameInst.CamPos[2]>3000.0) GameInst.CamPos[2]=3000.0
        if(GameInst.CamPos[2]<-3000.0) GameInst.CamPos[2]=-3000.0
        if(GameInst.CamPos[1]>2000.0) GameInst.CamPos[1]=2000.0
        if(GameInst.CamPos[1]<-50.0) GameInst.CamPos[1]=-50.0


        // detect the first object point by mouse dir (limited 2000)
        {
            this.ObjDisplayPos = collisionGetPoint(GameInst.CamPos,[GameInst.CamPos[0]+GameInst.CamDir[0]*2000,GameInst.CamPos[1]+GameInst.CamDir[1]*2000,GameInst.CamPos[2]+GameInst.CamDir[2]*2000],mvMatrix,0);
       
            if(this.ObjDisplayPos[3]!=null && this.ObjDisplayPos[3][1]!=null)
            {
                this.ObjDisplayName=this.ObjDisplayPos[3][1] + "-" + this.ObjDisplayPos[3][2] ;
                this.ObjDisplayType =  this.ObjDisplayPos[3][1];
                this.ObjDisplayId = this.ObjDisplayPos[3][2];            
                console.log( this.ObjDisplayName + "/")        
                console.log( this.ObjDisplayType)
                console.log( this.ObjDisplayId)

            }
            else
            {
                this.ObjDisplayName = "";
                this.ObjDisplayType = 0;
                this.ObjDisplayId  = -1;
            }
        }

        // select/deselect elemnt
        if(mediaIsKeyOnce("Mouse1") )
        {
            if(this.SelectedObjectId==-1 && this.ObjDisplayType!=0)
            {
                this.ObjName = this.ObjDisplayPos[3][1];
                this.PrevMenuLevel = 2;
                this.SelectedObjectType = GameInst.Level[this.ObjDisplayType];
                this.SelectedObjectId = this.ObjDisplayId;
                this.SelectedObjectName = this.ObjDisplayName;
                this.MenuLevel=3;
                var objPos = this.SelectedObjectType[this.SelectedObjectId].position
                var d0 =  objPos[0]- GameInst.CamPos[0]
                var d1 =  objPos[1]- GameInst.CamPos[1]
                var d2 =  objPos[2]- GameInst.CamPos[2]
                this.CameraDist = Math.sqrt(d0*d0 + d1*d1 + d2*d2);
            }
            else if(this.MenuLevel==3)
            {
                this.MenuLevel=1;
                this.PrevMenuLevel = 1;
                this.SelectedObjectId = -1;
                this.SelectedObjectType ="";
            }
        }

       

    }

    

    draw()
    {            
        ctx2d.fillStyle = 'white';
        ctx2d.globalAlpha = 1.0;
        ctx2d.font = "20px Arial";
        var offset = 150;
        		
		// Cross Display
        if(this.MenuLevel==3)  
        {
            ctx2d.fillStyle = 'cyan';	
            ctx2d.font = "bold 16px Arial";            
            ctx2d.fillText(this.SelectedObjectName,canvas2D.width/2.0 + 14,canvas2D.height/2.0);
        }
        else
        {
            ctx2d.fillStyle = 'white';
            ctx2d.font = "14px Arial";
            ctx2d.fillText(this.ObjDisplayName,canvas2D.width/2.0 + 14,canvas2D.height/2.0);
        }

		ctx2d.globalAlpha = 0.8;
		ctx2d.fillRect(canvas2D.width/2.0-2.0,canvas2D.height/2.0-2.0,4.0,4.0);

		// Sphere Display	
        if(this.ObjDisplayName != "")
        {
            shaderVertexColorVector = [0.82,0.82,0.82,1.0];
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,this.ObjDisplayPos);  
                Sphere.Draw(SphereShaderProgram); 
            mvPopMatrix();
        }
    }
}
