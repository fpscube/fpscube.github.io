var CreationInt;

var CreationConf=
{
    "stone1":{"MaxObject":40,"genNbZones":0,"genNbPZ":0,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "stone2":{"MaxObject":40,"genNbZones":0,"genNbPZ":2,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "stone3":{"MaxObject":40,"genNbZones":3,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":5,"genSizeX":1500,"genSizeZ":1500},
    "tower1":{"MaxObject":20,"genNbZones":5,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "tower2":{"MaxObject":20,"genNbZones":4,"genNbPZ":1,"genZoneSizeMin":100,"genZoneSizeMax":100,"genYGroundOffset":20,"genSizeX":1500,"genSizeZ":1500},
    "trees":{"MaxObject":50,"genNbZones":4,"genNbPZ":7,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":-5,"genSizeX":1500,"genSizeZ":1500},
    "enemies":{"MaxObject":50,"genNbZones":3,"genNbPZ":10,"genZoneSizeMin":100,"genZoneSizeMax":500,"genYGroundOffset":500,"genSizeX":1500,"genSizeZ":1500},
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

            if(mediaIsKeyOnce("+"))this.CamSpeed*=2.0;
            if(mediaIsKeyOnce("-"))this.CamSpeed/=2.0;
    
    
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

            if(mediaIsKeyOnce("+"))this.CamSpeed*=2.0;
            if(mediaIsKeyOnce("-"))this.CamSpeed/=2.0;
                

            var deltaWheel = mediaWheelEvt();
            if(deltaWheel>0 && this.SelectedObjectId!=-1) 
            {
                this.CameraDist*=0.75;
                this._mvCamToSelectedObject();
            }  
            if(deltaWheel<0)
            {
                this.CameraDist*=1.5;
                this._mvCamToSelectedObject();
            } 
    

            else if(mediaIsKeyOnce('1'))// CREATE Obj
            {
                var lMaxObject = CreationConf[this.ObjName].MaxObject;
                if(this.SelectedObjectType.length>= lMaxObject)
                {
                    alert("Max object is " + lMaxObject);
                }
                else
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
                else
                {
                    alert("there is no object to remove")
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

            else if(mediaIsKeyOnce("9")) // Return Object
            {
                this.MenuLevel=this.PrevMenuLevel;
                this.ObjName = this.PrevObjName;
                this.SelectedObjectId = -1;
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
            ctx2d.fillText("  5 : Clear Level",50,offset + 30*5);
            ctx2d.fillText("  6 : Gen Level",50,offset + 30*6);
            ctx2d.fillText("  7 : Load from clipboard ",50,offset + 30*7);
            ctx2d.fillText("  9 : Save to clipboard ",50,offset + 30*8);
            ctx2d.fillText("-/+ : Move Speed",50,offset + 30*9);
        }
        else if(this.MenuLevel == 2 && this.ObjName=="stones")
        {          
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("  1 : Stone 1",50,offset + 30*1);
            ctx2d.fillText("  2 : Stone 2",50,offset + 30*2);
            ctx2d.fillText("  2 : Stone 3",50,offset + 30*3);
            ctx2d.fillText("  3 : Tower 1",50,offset + 30*4);
            ctx2d.fillText("  4 : Tower 2",50,offset + 30*5);
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


		
    }
}
