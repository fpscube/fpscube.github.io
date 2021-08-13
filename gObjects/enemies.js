
var CEnemiesInst;

class CEnemies
{

    constructor(pGame)
    {
        this.humans=[];
        this.NbALive=0;
        this.IsInTarget = null;
        

        CEnemiesInst = this;
        if (pGame.Level["enemies"]==null)
        {
            pGame.Level["enemies"]=[];
        }
        else
        {
            this.updateCreation()
        }
    }

    updateCreation()
    {   
        var levelInfo = GameInst.Level.enemies;

        for(i=0;i<levelInfo.length;i++)
        {
            var nPos=[levelInfo[i].position[0],levelInfo[i].position[1],levelInfo[i].position[2]];
            if(this.humans[i]==null)
            {
                this.humans[i]= new CHuman(nPos,Math.random()*8,[Math.random()*8,0,Math.random()*8],false,"Bot_" + i);
            }
            else
            {
                this.humans[i].Pos = nPos;
                this.humans[i].reInit();
            }
        }
        this.NbALive=levelInfo.length;
        this.humans.length=levelInfo.length;
    }


    update(pCamPos,pCamDir,pHeroPos)
    {

        var bestTargetSquaredDist = null;
        if(GameInst.HumanInTarget != null)
        {
            bestTargetSquaredDist = vec3.squaredDistance(pHeroPos,GameInst.HumanInTarget.CamRayCollisionPos);
        }

        this.NbALive=0;
        
        for(var i =0 ;i<this.humans.length;i++){
            this.humans[i].UpdateEnemie(pCamPos,pCamDir,pHeroPos);
            if(!(this.humans[i].IsDead()))
            { 
                this.NbALive++;
            }
            if (this.humans[i].CamRayCollisionPos==null) continue;
            
            var targetSquaredDist = vec3.squaredDistance(pHeroPos,this.humans[i].CamRayCollisionPos);

            if(GameInst.HumanInTarget==null || (targetSquaredDist < bestTargetSquaredDist))
            {
                GameInst.HumanInTarget =  this.humans[i];
                bestTargetSquaredDist = targetSquaredDist;
            }
		} 
    }

    draw()
    {
        for(var i =0 ;i<this.humans.length;i++){
            this.humans[i].draw()
		} 

    }

    getCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
    {
        var collision = pLastCollPt;
        for(var i =0 ;i<this.humans.length;i++){
            collision = this.humans[i].getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
        }
        return collision;
    }

    
    getHumansInSphere(pCenter,pRadius)
    {
        var humanList = [];
        var squaredRadius = pRadius*pRadius;

        for(var i =0 ;i<this.humans.length;i++){
            if (vec3.squaredDistance(this.humans[i].Pos,pCenter) < squaredRadius)
            {
                humanList.push(this.humans[i]);
            }
        }
        return humanList;
    }

}