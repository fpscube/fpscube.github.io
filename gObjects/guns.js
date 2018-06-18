

var gunsFragmentShader= `
precision lowp float;

varying vec3 v_normal;     
uniform vec4 uVertexColor;   

void main() {
  float light;

  light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 

  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
}
`;

var gunsVertexShader = `    
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

var gunsShaderProgram;
var gunPos;
var gunDir;
var gunCollisionMatrix;

function gunsInit()
{
    gunsShaderProgram = initShaders(gunsVertexShader,gunsFragmentShader);
    gunPos = [-100.0,groundGetY(-100.0,20.0)+5.0,10];
    gunCollisionMatrix = mat4.create();

}

function gunSetPosAndDir(pPos,pDir)
{
    vec3.copy(gunPos,pPos);
    vec3.copy(gunDir,pDir);
}


function gunFire()
{  

}

function gunCheckCollision(pPos1,pPos2)
{
    return (Sphere.GetCollisionPos(pPos1,pPos2,gunCollisionMatrix,null,0));
}

function gunsDraw()
{

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix,mvMatrix,gunPos); 
    mat4.rotate(mvMatrix,mvMatrix, timeGetAnimRad(), [0 , 1, 0]);

    //Process collision matrix
    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[0.5,0.0,0.0]); 
        mat4.scale(mvMatrix,mvMatrix,[5.0,1.0,1.0]);
        mat4.copy(gunCollisionMatrix,mvMatrix) ;
    mvPopMatrix();   


    for (var i=0;i<360;i+=45)
    {

            shaderVertexColorVector[0] +=0.01;
            shaderVertexColorVector[1] +=0.02;
            shaderVertexColorVector[2] +=0.02;
        mvPushMatrix();
            mat4.rotate(mvMatrix,mvMatrix,  degToRad(i), [1, 0, 0]); 

            mat4.translate(mvMatrix,mvMatrix,[0.5,0.0,0.5]); 
                mat4.scale(mvMatrix,mvMatrix,[3.8,0.7,0.2]);
                Sphere.Draw(gunsShaderProgram);   
        mvPopMatrix(); 
    }

    mvPushMatrix();
        mat4.translate(mvMatrix,mvMatrix,[3.2,0.0,0.0]); 
        mat4.scale(mvMatrix,mvMatrix,[0.6,0.6,0.6]);
        Sphere.Draw(gunsShaderProgram);   
    mvPopMatrix();   

}


