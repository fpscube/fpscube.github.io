var CreationInt;


class CCreation
{
    constructor()
    {
		this.CamSpeed = 50;
        this.MenuLevel = 1;
        this.SelectedObject = ""
        this.SelectedObjectId = 0

    }



    update()
    {

		var gElapsed = timeGetElapsedInS();
        if(mediaIsKeyOnce("+"))this.CamSpeed*=2.0;
        if(mediaIsKeyOnce("-"))this.CamSpeed/=2.0;

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
            if(mediaIsKeyOnce('1'))
             {
                 this.SelectedObjectType = GameInst.Level["stones"]; this.MenuLevel=2;
                }
            if(mediaIsKeyOnce('2')) {this.SelectedObjectType = GameInst.Level["trees"]; this.MenuLevel=2;}
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
                this.SelectedObjectId = this.SelectedObjectType.length -1
                if(this.SelectedObjectType.length >0)
                {
                    GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*50.0;
                    GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*50.0;
                    GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*50.0;
                }
            }
        }
        else if(this.MenuLevel == 2)
        {
            if(this.SelectedObjectType.length >0)
            {
                this.SelectedObjectType[this.SelectedObjectId].position = [GameInst.CamPos[0] +  GameInst.CamDir[0]*50.0,
                                                    GameInst.CamPos[1] +  GameInst.CamDir[1]*50.0,
                                                    GameInst.CamPos[2] +  GameInst.CamDir[2]*50.0];
            }


            if(mediaIsKeyOnce('1'))
            {
                this.SelectedObjectType.push(
                    {   
                        "position":
                            [GameInst.CamPos[0] +  GameInst.CamDir[0]*50.0,
                             GameInst.CamPos[1] +  GameInst.CamDir[1]*50.0,
                             GameInst.CamPos[2] +  GameInst.CamDir[2]*50.0],
                        "color":[0.52,0.7,1.0,0.6]
                    }
                );
                this.SelectedObjectId = this.SelectedObjectType.length-1
            } 
            if(mediaIsKeyOnce('2')) 
            {
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectType.splice(this.SelectedObjectId,1)
                }
                else
                {
                    alert("there is no object to remove")
                }
                if(this.SelectedObjectId>=this.SelectedObjectType.length )
                {
                    this.SelectedObjectId = this.SelectedObjectType.length -1
                }


                if(this.SelectedObjectType.length >0)
                {
                    GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*50.0;
                    GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*50.0;
                    GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*50.0;
                }   
            }
            if(mediaIsKeyOnce("4"))
            {
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectId = (this.SelectedObjectId-1)
                    if(this.SelectedObjectId <0) this.SelectedObjectId = (this.SelectedObjectType.length -1)
                    GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*50.0;
                    GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*50.0;
                    GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*50.0;
                }

            }
            if(mediaIsKeyOnce("5")) 
            {
                if(this.SelectedObjectType.length >0)
                {
                    this.SelectedObjectId = (this.SelectedObjectId+1) % this.SelectedObjectType.length
                    GameInst.CamPos[0] = this.SelectedObjectType[this.SelectedObjectId].position[0] - GameInst.CamDir[0]*50.0;
                    GameInst.CamPos[2] = this.SelectedObjectType[this.SelectedObjectId].position[2] - GameInst.CamDir[2]*50.0;
                    GameInst.CamPos[1] = this.SelectedObjectType[this.SelectedObjectId].position[1] - GameInst.CamDir[1]*50.0;
                }
            }
            if(mediaIsKeyOnce("6"))
                this.MenuLevel=1
            
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
            ctx2d.fillText("1 - Stone",50,offset + 30*1);
            ctx2d.fillText("2 - Tree",50,offset + 30*2);
            ctx2d.fillText("8 - LOAD level from clipboard ",50,offset + 30*4);
            ctx2d.fillText("9 - WRITE level to clipboard ",50,offset + 30*5);
        }
        else if (this.MenuLevel==2)
        {
            ctx2d.fillStyle = 'white';
            ctx2d.globalAlpha = 1.0;
            ctx2d.font = "20px Arial";
            var offset = 150;
            ctx2d.fillText("Creation Mode",50,offset);
            ctx2d.fillText("1 - New Object",50,offset + 30*1);
            ctx2d.fillText("2 - Delete",50,offset + 30*2);
            ctx2d.fillText("4 - Previous",50,offset + 30*3);
            ctx2d.fillText("5 - Next",50,offset + 30*4);
            ctx2d.fillText("6 - Exit",50,offset + 30*5);


            if(this.SelectedObjectId>0)
            {
                mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix, this.SelectedObjectType[this.SelectedObjectId-1].position);
                mat4.scale(mvMatrix,mvMatrix,[0.3,1000,0.3]);
                Sphere.Draw(SphereShaderProgram);
                mvPopMatrix();
            }
        }


		
    }
}
