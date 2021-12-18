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
        this.SelectedObjectId = 0
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


        if(this.MenuLevel == 1)
        {
            var objName;

    
    
            if(mediaIsKeyOnce('1')) {this.ObjName="stones";   this.MenuLevel=2;}
            if(mediaIsKeyOnce('2')) {this.ObjName="trees";    this.MenuLevel=3;} 
            if(mediaIsKeyOnce('3')) {this.ObjName="enemies";  this.MenuLevel=3;}
            if(mediaIsKeyOnce('4')) {this.ObjName="vehicules";this.MenuLevel=3;}
            if(mediaIsKeyOnce('5')) {this.levelGeneration(GameInst)}
            if(mediaIsKeyOnce('6')) {this.levelClear(GameInst)}

            if(mediaIsKeyOnce("7"))
            {
                try{
                    navigator.clipboard.readText().then(
                        clipText => GameInst.Level = JSON.parse(clipText));
                }
                catch (e) {
                    alert("you need a valid json in your clipboard")
                }
            }
            if(mediaIsKeyOnce("9")) navigator.clipboard.writeText(JSON.stringify(GameInst.Level , null, 2));

            this.SelectedObjectId = -1;
            this.PrevMenuLevel = 1;

            this.SelectedObjectType = GameInst.Level[this.ObjName];
        }
        else if(this.MenuLevel == 2 && this.ObjName=="stones")
        {
            this.PrevObjName = this.ObjName;
            if(mediaIsKeyOnce('1')) {this.ObjName="stone1";  this.MenuLevel=3}
            if(mediaIsKeyOnce('2')) {this.ObjName="stone2";  this.MenuLevel=3} 
            if(mediaIsKeyOnce('3')) {this.ObjName="stone3";  this.MenuLevel=3}
            if(mediaIsKeyOnce('4')) {this.ObjName="tower1";  this.MenuLevel=3}
            if(mediaIsKeyOnce('5')) {this.ObjName="tower2";  this.MenuLevel=3}
            if(mediaIsKeyOnce('9')) {this.MenuLevel = 1}   
            this.SelectedObjectId = -1;

            this.PrevMenuLevel = 2;
            this.SelectedObjectType = GameInst.Level[this.ObjName];
        }
        else if(this.MenuLevel == 3)
        {

            
            if( this.SelectedObjectId!=-1)
            {
                this.SelectedObjectType[this.SelectedObjectId].position = [GameInst.CamPos[0] +  GameInst.CamDir[0]*this.CameraDist,
                                                    GameInst.CamPos[1] +  GameInst.CamDir[1]*this.CameraDist,
                                                    GameInst.CamPos[2] +  GameInst.CamDir[2]*this.CameraDist];
            }                

            var deltaWheel = mediaWheelEvt();
            if(deltaWheel<0 && this.SelectedObjectId!=-1) 
            {
                this.CameraDist*=0.75;
                if(this.CameraDist<50) this.CameraDist=50;
                this._mvCamToSelectedObject();
            }  
            if(deltaWheel>0 && this.SelectedObjectId!=-1)
            {
                this.CameraDist*=1.5;
                if(this.CameraDist>500) this.CameraDist=500;
                this._mvCamToSelectedObject();
            } 
    

            if(mediaIsKeyOnce('1') )//|| mediaIsKeyOnce("Mouse1"))// CREATE Obj
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
            else if(mediaIsKeyOnce('2')) // DELETE Obj
            {
                if(this.SelectedObjectId != -1)
                {
                    this.SelectedObjectType.splice(this.SelectedObjectId,1)  
                    this.SelectedObjectId = -1;
                }
      
        
            }            
            else if(mediaIsKeyOnce("3")) // Unselect Object
            {
                this.SelectedObjectId=-1
            }
            else if(mediaIsKeyOnce("4")) // Prev Object
            {
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectId = (this.SelectedObjectId-1)
                    if(this.SelectedObjectId <0) this.SelectedObjectId = (this.SelectedObjectType.length -1)
                }
                this._mvCamToSelectedObject();

            }
            else if(mediaIsKeyOnce("5")) // Next Object
            {
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectId = (this.SelectedObjectId+1) % this.SelectedObjectType.length
                }
                this._mvCamToSelectedObject();
            }

            else if(mediaIsKeyOnce("9")) // Return 
            {
                this.MenuLevel=this.PrevMenuLevel;
                this.ObjName = this.PrevObjName;
                this.SelectedObjectId = -1;
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
            if(this.MenuLevel!=3 && this.ObjDisplayType!=0)
            {
                this.ObjName = this.ObjDisplayPos[3][1];
                this.PrevMenuLevel = 2;
                this.SelectedObjectType = GameInst.Level[this.ObjDisplayType];
                this.SelectedObjectId = this.ObjDisplayId;
                this.MenuLevel=3;
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

        
        if (this.MenuLevel==1)
        {
             
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("  1 : Stone",50,offset + 30*1);
            ctx2d.fillText("  2 : Tree",50,offset + 30*2);
            ctx2d.fillText("  3 : Enemie",50,offset + 30*3);
            ctx2d.fillText("  4 : Vehicule",50,offset + 30*4);
            ctx2d.fillText("  5 : Gen Level",50,offset + 30*5);
            ctx2d.fillText("  6 : Clear Level",50,offset + 30*6);
            ctx2d.fillText("  7 : Load from clipboard ",50,offset + 30*7);
            ctx2d.fillText("  9 : Save to clipboard ",50,offset + 30*8);
            ctx2d.fillText("-/+ : Move Speed",50,offset + 30*9);
        }
        else if(this.MenuLevel == 2 && this.ObjName=="stones")
        {          
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("  1 : Stone 1",50,offset + 30*1);
            ctx2d.fillText("  2 : Stone 2",50,offset + 30*2);
            ctx2d.fillText("  3 : Stone 3",50,offset + 30*3);
            ctx2d.fillText("  4 : Tower 1",50,offset + 30*4);
            ctx2d.fillText("  5 : Tower 2",50,offset + 30*5);
            ctx2d.fillText("  9 : Exit",50,offset + 30*6);
        }
        else if (this.MenuLevel==3)
        {   
            var title = this.ObjName + " " + this.SelectedObjectType.length + "/" +  CreationConf[this.ObjName].MaxObject
            if(this.SelectedObjectId!=-1)
            {
                title +=  " (selected:" + this.SelectedObjectId + ")"
            }
            
            ctx2d.fillText(title,50,offset);
            ctx2d.fillText("  1 : New Object",50,offset + 30*1);
            ctx2d.fillText("  2 : Delete",50,offset + 30*2);
            ctx2d.fillText("  3 : Unselect",50,offset + 30*3);
            ctx2d.fillText("  4 : Select Previous",50,offset + 30*4);
            ctx2d.fillText("  5 : Select Next",50,offset + 30*5);
            ctx2d.fillText("  9 : Exit",50,offset + 30*6);
            ctx2d.fillText("wheel: Zoom",50,offset + 30*7);
            ctx2d.fillText("-/+  : Move Speed",50,offset + 30*8);

        }
        		
		// Cross Display
		ctx2d.fillStyle = 'white';
        if(this.MenuLevel==3)  ctx2d.fillStyle = 'cyan';	
		ctx2d.font = "14px Arial";
		ctx2d.fillText(this.ObjDisplayName,canvas2D.width/2.0 + 14,canvas2D.height/2.0);

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
