

class CVehicules
{

    constructor()
    {
        this.Pos = [-650,0,180];
        this.GearPos = [];
        this.GearDir= [];
        this.GearSpeed= [];
        for (var i=0;i<4;i++)
        {
            this.GearPos[i] = [0,0,0];
            this.GearDir[i] = [0,0,0];
            this.GearSpeed[i] = [0,0,0];
        }
        this.GearFrontLeft
        this.GearFrontRight

    }

    update()
    {

        this.Pos[1] = groundGetY(this.Pos[0],this.Pos[2]) + 2.0;
        var sLarge = 8;
        var sLong = 13;

        this.GearPos[0][0]  = -sLarge;
        this.GearPos[0][2]  = -sLong;
        this.GearPos[1][0]  = -sLarge;
        this.GearPos[1][2]  = sLong;
        this.GearPos[2][0]  = sLarge;
        this.GearPos[2][2]  = -sLong;
        this.GearPos[3][0]  = sLarge;
        this.GearPos[3][2]  = sLong;
    }

    draw()
    {   
        mat4.identity(mvMatrix);
        shaderVertexColorVector = [1.0,1.0,1.0,1.0]; 

        
        mat4.translate(mvMatrix,mvMatrix,this.Pos); 

        for (var i=0;i<4;i++)
        {
            
            mvPushMatrix();
                mat4.translate(mvMatrix,mvMatrix,this.GearPos[i]); 
                mat4.scale(mvMatrix,mvMatrix,[2.0,5,5]);
                Sphere.Draw(SphereShaderProgram);   
            mvPopMatrix();
            
        }

        shaderVertexColorVector = [0.2,0.2,0.2,1.0]; 

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[2.0,1.0,17.0]);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[2.0,1.0,17.0]);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,13]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,10.0]);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,0,-13]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(90), [0, 1, 0]);  
            mat4.scale(mvMatrix,mvMatrix,[0.8,0.8,10.0]);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();
        

        shaderVertexColorVector = [0.6,0.2,0.2,1.0]; 
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1.0,-10]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-15), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[3.8,2.8,7]);
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,2.9,-4]); ; 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-15), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[0.6,0.6,5.8]); 
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();


        shaderVertexColorVector = [0.2,0.2,0.8,1.0]; 
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,4.2,1.2]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-5), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[1.3,1.3,0.5]); 
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();
         
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1,5]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(0), [1, 0, 0]); 
            mat4.scale(mvMatrix,mvMatrix,[4,1.0,3]); 
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();

        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0,1,7]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-70), [1, 0, 0]); 
            mat4.translate(mvMatrix,mvMatrix,[0,0,3]); 
            mat4.scale(mvMatrix,mvMatrix,[3,1.0,4]); 
            Sphere.Draw(SphereShaderProgram);   
        mvPopMatrix();
    }

}