
class CStone
{

    constructor(){
        var fragmentShader= `
        precision lowp float;
        
        varying vec3 v_normal;     
        uniform vec4 uVertexColor;   
        
        void main() {
          float light;

          light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 
          
          gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
        }
    `;

    
        this.shaderProgram =  initShaders(vertexShader1,fragmentShader);
        this.CollisionMatrixList = [];
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


    update()
    {
    }   

    getCollisionPoint(rayPoint1,rayPoint2,mvMatrix,distSquaredOffset)
    {
        var collision = null ;
        for (var i=0;i<this.CollisionMatrixList.length;i++)
        {
            collision = Sphere.GetCollisionPos(rayPoint1,rayPoint2,this.CollisionMatrixList[i],collision,distSquaredOffset);
        }

        return collision;
    }

    draw()
    {
        this._clearCollisionMatrix();

        mat4.identity(mvMatrix);
        
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,20.0,0.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[80.0,10.0,80.0]); 
            Sphere.Draw(this.shaderProgram);   
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();

        
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-20.0,-5.0,-50.0]);  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(120), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,30.0]); 
            Sphere.Draw(this.shaderProgram); 
        
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();


    
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[150.0,30.0,-500.0])
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-5), [0, 0,1]);;  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(84), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[50.0,200.0,10.0]); 
            Sphere.Draw(this.shaderProgram); 
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();
        

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[150.0,20.0,-350.0]);  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(85), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,25.0]); 
            Sphere.Draw(this.shaderProgram); 
            this._storeCollisionMatrix(mvMatrix);
        mvPopMatrix();

      

    }
    



}