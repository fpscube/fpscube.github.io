
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
    }

    update()
    {

    }

    draw()
    {
        
	mat4.identity(mvMatrix);
        shaderVertexColorVector = [0.82,0.82,0.82,1.0];
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,20.0,0.0]); 
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(10), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[80.0,10.0,80.0]); 
            Sphere.Draw(this.shaderProgram);  
        mvPopMatrix();

        
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[-20.0,-5.0,-50.0]);  
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(120), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[20.0,20.0,30.0]); 
            Sphere.Draw(this.shaderProgram);  
        mvPopMatrix();
    }



}