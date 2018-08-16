function  collisionGetPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
    var collision = pCollision;
    collision = CEnemiesInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = CTreesInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = CStoneInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = groundGetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = groundWaterGetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);

    return collision;
} 



function  collisionObjectAndGroundGetPoint(pRayPoint1,pRayPoint2,pCollision,pDistSquaredOffset)
{
    var collision = pCollision;
    collision = CTreesInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = CStoneInst.getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    collision = groundGetCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
    return collision;
} 

class CHumanPhysical
{
    constructor()
    {
        this.Pos1=[0,0,0];
        this.Pos2=[0,0,0];
        this.Ground1=false;
        this.Ground2=false;
        this.Dist=4.0;
        this.Speed=[0,0,0];
        this.GSpeed1=0;
        this.GSpeed2=0;
    }

    update()
    {
        var elapsed = timeGetElapsedInS();

        var newPos1=[]; 
        var newPos2=[]; 
        var newDir=[]; 
        var collision1; 
        var collision2; 

        if(!this.Ground1)
        {
            // compute speed pos1
            newPos1[0] = this.Pos1[0] + this.Speed[0]*elapsed; 
            newPos1[1] = this.Pos1[1] + this.Speed[1]*elapsed;
            newPos1[2] = this.Pos1[2] + this.Speed[2]*elapsed;

            vec3.subtract(newDir,newPos1,this.Pos2);
            vec3.normalize(newDir,newDir);
            
            newPos2[0] = newPos1[0] - newDir[0]*this.Dist; 
            newPos2[1] = newPos1[1] - newDir[1]*this.Dist; 
            newPos2[2] = newPos1[2] - newDir[2]*this.Dist; 
            
            // check collision
            collision1 = collisionObjectAndGroundGetPoint(this.Pos1,newPos1,null,0);
            collision2 = collisionObjectAndGroundGetPoint(this.Pos2,newPos2,null,0);
            if (collision1 == null && collision2==null)
            {
                vec3.copy(this.Pos1,newPos1);
                vec3.copy(this.Pos2,newPos2);
            } 

            // compute gravity pos1
            this.GSpeed1 += - 150*elapsed;        
            newPos1[0] = this.Pos1[0];
            newPos1[1] = this.Pos1[1] + this.GSpeed1 * elapsed;
            newPos1[2] = this.Pos1[2];

            vec3.subtract(newDir,newPos1,this.Pos2);
            vec3.normalize(newDir,newDir);
            
            newPos2[0] = newPos1[0] - newDir[0]*this.Dist; 
            newPos2[1] = newPos1[1] - newDir[1]*this.Dist; 
            newPos2[2] = newPos1[2] - newDir[2]*this.Dist; 
        
         
            // check collision
            collision1 = collisionObjectAndGroundGetPoint(this.Pos1,newPos1,null,0);
            collision2 = collisionObjectAndGroundGetPoint(this.Pos2,newPos2,null,0);
            if (collision1 == null && collision2==null)
            {
                vec3.copy(this.Pos1,newPos1);
                vec3.copy(this.Pos2,newPos2);
            }
            if(collision1!=null)
            {
                collision1[1] +=1.0;
                this.Ground1 = true;
                vec3.copy(this.Pos1,collision1);
            }   
            if(collision2!=null)
            {
                collision2[1] +=1.0;
                this.Ground1 = true;
                vec3.copy(this.Pos2,collision2);
            }   
        }    
        
        if(!this.Ground2)
        {
        
            // compute gravity pos2
            this.GSpeed2 += - 150*elapsed;        
            newPos2[0] = this.Pos2[0];
            newPos2[1] = this.Pos2[1] + this.GSpeed1 * elapsed;
            newPos2[2] = this.Pos2[2];

            vec3.subtract(newDir,this.Pos1,newPos2);
            vec3.normalize(newDir,newDir);
            
            newPos2[0] = this.Pos1[0] - newDir[0]*this.Dist;
            newPos2[1] = this.Pos1[1] - newDir[1]*this.Dist;
            newPos2[2] = this.Pos1[2] - newDir[2]*this.Dist;
            
            // check collision
            collision2 = collisionObjectAndGroundGetPoint(this.Pos2,newPos2,null,0);
            if (collision2==null)
            {
                vec3.copy(this.Pos2,newPos2);
            } 
            else
            {
                this.Ground2 = true;
                collision2[1] +=1.0;
                vec3.copy(this.Pos2,collision2);

            }
        }      
        

    }

}


class CPhysicalPt
{
    constructor()
    {
        this.Pos=[0,0,0];
        this.NewPos=[0,0,0];
        this.Dir=[0,0,0];
        this.Speed=[0,0,0];
        this.GSpeed=0;
        this.Ground=false;
        this.Power=0;
        this.OffsetY=2.0;
    }


    update()
    {
        var elapsed = timeGetElapsedInS();
        var newPos1;

        if(!this.Ground)  this.Power=0;

        // compute new pos 1 (speed and dir)
        newPos1=[];

        // compute new speed
        this.Speed[0] = (this.Speed[0] +  this.Dir[0]*this.Power*elapsed)*(1-0.25*elapsed);
        this.Speed[1] = (this.Speed[1] +  this.Dir[1]*this.Power*elapsed)*(1-0.25*elapsed);
        this.Speed[2] = (this.Speed[2] +  this.Dir[2]*this.Power*elapsed)*(1-0.25*elapsed);

        // compute new pos
        newPos1[0] = this.Pos[0] +  this.Speed[0]*elapsed;
        newPos1[1] = this.Pos[1] +  this.Speed[1]*elapsed;
        newPos1[2] = this.Pos[2] +  this.Speed[2]*elapsed;
        
        // check collision
        var collision = collisionObjectAndGroundGetPoint(this.Pos,newPos1,null,0);
        if (collision != null)
        {             
            vec3.copy(newPos1,this.Pos); // Undo mv
            vec3.scale(this.Speed,this.Speed,-0.25); //inverse speed
        }

        // compute new pos 2 (gravity)
        var newPos2=[];
        // compute gravity speed
        this.GSpeed += - 150*elapsed;
        
        newPos2[0] = newPos1[0];
        newPos2[1] = newPos1[1] + this.GSpeed * elapsed;
        newPos2[2] = newPos1[2];

        var offsetY = this.OffsetY;
        if (this.Ground) offsetY = offsetY + 1.5;
        var collisionPtGravity = collisionObjectAndGroundGetPoint(newPos1,[newPos2[0],newPos2[1]-offsetY,newPos2[2]],null,0); 
        if (collisionPtGravity != null)
        {
            vec3.copy(newPos2,collisionPtGravity);
            newPos2[1] = newPos2[1] + this.OffsetY;
            this.GSpeed = 0;
            this.Ground = true;     
        }
        else
        {
            this.Ground = false;
        }
        
        // compute out new pos (final collision)
        var collisionPtFinal = collisionObjectAndGroundGetPoint(this.Pos,newPos2,null,0); 
        if (collisionPtFinal != null)
        {
            vec3.scale(this.Speed,this.Speed,-0.25); //inverse speed
        }
        else
        {
            vec3.copy(this.Pos,newPos2);
        }
    }
}
