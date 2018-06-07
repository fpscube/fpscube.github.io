

var treeFragmentShader= `
precision lowp float;

varying vec3 v_normal;     
uniform vec4 uVertexColor;   

void main() {
  float light;

  light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 

  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
}
`;

var treeVertexShader = `    
	attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
    uniform mat4 uMVInverseTransposeMatrix;    
    
    varying vec3 v_normal; 
    
	void main() {


	// Multiply the position by the matrix.
	gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	// orient the normals and pass to the fragment shader
	v_normal =normalize( mat3(uMVInverseTransposeMatrix) * aVertexNormal);

	}
`;

var treeShaderProgram;


function treeInit()
{
    treeShaderProgram = initShaders(treeVertexShader,treeFragmentShader);
}

 
function treeDraw()
{
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix,[-350.0,0.0,60.0]); 


   for (var i=0;i<6;i++)
   {
        shaderVertexColorVector = [0.5+i*0.05,0.25+i*0.05,0.0,1.0]; 
        mvPushMatrix();
            mat4.translate(mvMatrix,mvMatrix,[0.0,i*12+6.0,0.0]);   
          //  mat4.rotate(mvMatrix,mvMatrix,  degToRad(2), [1, 0, 0]);   
            mat4.scale(mvMatrix,mvMatrix,[10.0-i*1.0,12.0,10.0-i*1.0]); 
            Sphere.Draw(treeShaderProgram);   
        mvPopMatrix(); 
   }

   shaderVertexColorVector = [0.35,0.65,0.0,1.0]; 
   for (var i=0;i<360;i+=45)
   {
        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(i), [0, 1, 0]); 
            mat4.translate(mvMatrix,mvMatrix,[20.0,6*12-5.0,0.0]);    
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(-20), [0, 0, 1]);  
            mat4.scale(mvMatrix,mvMatrix,[40.0,2.0,6.0]); 
            Sphere.Draw(treeShaderProgram);   
        mvPopMatrix(); 
   }


}


