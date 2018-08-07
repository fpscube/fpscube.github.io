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
