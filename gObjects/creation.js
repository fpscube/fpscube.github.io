var CreationInt;


class CCreation
{
    constructor()
    {
		this.CamSpeed = 50;
        this.MenuLevel = 1;
        this.SelectedObject = ""
        this.SelectedObjectId = 0
        this.CameraDist = 50.0;

    }

    _mvCamToSelectedObject()
    {
        if(this.SelectedObjectType.length >0)
        {
            if(this.SelectedObjectId >= this.SelectedObjectType.length)
            {
                this.SelectedObjectId = this.SelectedObjectType.length-1;
            }
            GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*this.CameraDist;
            GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*this.CameraDist;
            GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*this.CameraDist;
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
    
    
            if(mediaIsKeyOnce('1')) {objName="stones";   this.MenuLevel=2; this.MaxObject=100}
            if(mediaIsKeyOnce('2')) {objName="trees";    this.MenuLevel=2; this.MaxObject=20} 
            if(mediaIsKeyOnce('3')) {objName="enemies";  this.MenuLevel=2; this.MaxObject=50}
            if(mediaIsKeyOnce('4')) {objName="vehicules";this.MenuLevel=2; this.MaxObject=1}
            if(mediaIsKeyOnce('5')) {objName="tower1";  this.MenuLevel=2; this.MaxObject=20}
            if(mediaIsKeyOnce('6')) {objName="tower2";  this.MenuLevel=2; this.MaxObject=20}

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

            if(this.MenuLevel==2)
            {
                this.SelectedObjectType = GameInst.Level[objName];
                this.SelectedObjectId = this.SelectedObjectType.length -1
                this._mvCamToSelectedObject();

            }
        }
        else if(this.MenuLevel == 2)
        {
            if(this.SelectedObjectType.length >0)
            {
                this.SelectedObjectType[this.SelectedObjectId].position = [GameInst.CamPos[0] +  GameInst.CamDir[0]*this.CameraDist,
                                                    GameInst.CamPos[1] +  GameInst.CamDir[1]*this.CameraDist,
                                                    GameInst.CamPos[2] +  GameInst.CamDir[2]*this.CameraDist];
            }

            if(mediaIsKeyOnce('+'))
            {
                this.CameraDist*=0.75;
                this._mvCamToSelectedObject();
            }  
            else if(mediaIsKeyOnce('-')) 
            {
                this.CameraDist*=1.5;
                this._mvCamToSelectedObject();
            } 
    

            else if(mediaIsKeyOnce('1'))// CREATE Obj
            {
                if(this.SelectedObjectType.length>= this.MaxObject)
                {
                    alert("Max object is " + this.MaxObject );
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
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectType.splice(this.SelectedObjectId,1)  
                }
                else
                {
                    alert("there is no object to remove")
                }
      
                this._mvCamToSelectedObject();
        
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
            else if(mediaIsKeyOnce("6")) // Return Object
            {
                this.MenuLevel=1
            }
            
        }
    }

    

    draw()
    {
        if (this.MenuLevel==1)
        {
            ctx2d.fillStyle = 'white';
            ctx2d.globalAlpha = 1.0;
            ctx2d.font = "20px Arial";
            var offset = 150;
            
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("  1 : Stone",50,offset + 30*1);
            ctx2d.fillText("  2 : Tree",50,offset + 30*2);
            ctx2d.fillText("  3 : Enemie",50,offset + 30*3);
            ctx2d.fillText("  4 : Vehicule",50,offset + 30*4);
            ctx2d.fillText("  5 : Tower1",50,offset + 30*5);
            ctx2d.fillText("  6 : Tower2",50,offset + 30*6);
            ctx2d.fillText("  7 : Load from clipboard ",50,offset + 30*7);
            ctx2d.fillText("  9 : Save to clipboard ",50,offset + 30*8);
            ctx2d.fillText("-/+ : Move Speed",50,offset + 30*9);
        }
        else if (this.MenuLevel==2)
        {   
            ctx2d.fillStyle = 'white';
            ctx2d.globalAlpha = 1.0;
            ctx2d.font = "20px Arial";
            var offset = 150;
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("  1 : New Object",50,offset + 30*1);
            ctx2d.fillText("  2 : Delete",50,offset + 30*2);
            ctx2d.fillText("  4 : Previous",50,offset + 30*3);
            ctx2d.fillText("  5 : Next",50,offset + 30*4);
            ctx2d.fillText("  6 : Exit",50,offset + 30*5);
            ctx2d.fillText("-/+ : Zoom",50,offset + 30*6);

        }


		
    }
}
