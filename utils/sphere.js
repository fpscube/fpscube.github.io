var Sphere;
var SphereShaderProgram;


function SphereInit() 
{
    Sphere = new CSphere;
    SphereShaderProgram = SphereInitShaders(SphereVertexShader,SphereFragmentShader);
}

function SphereInitShaders(vertexShaderStr,fragmentShaderStr) {

    var vertexShader = shaderCompil(vertexShaderStr,gl.VERTEX_SHADER);
    var fragmentShader = shaderCompil(fragmentShaderStr,gl.FRAGMENT_SHADER);

    var outShaderProgram = gl.createProgram();
    gl.attachShader(outShaderProgram, vertexShader);
    gl.attachShader(outShaderProgram, fragmentShader);
    gl.linkProgram(outShaderProgram);

    if (!gl.getProgramParameter(outShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    outShaderProgram.vertexPositionAttribute = gl.getAttribLocation(outShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(outShaderProgram.vertexPositionAttribute);

    outShaderProgram.vertexColorAttribute = gl.getUniformLocation(outShaderProgram, "uVertexColor");
    outShaderProgram.pMatrixUniform = gl.getUniformLocation(outShaderProgram, "uPMatrix");
    outShaderProgram.mvMatrixUniform = gl.getUniformLocation(outShaderProgram, "uMVMatrix");
    outShaderProgram.mvInverseTransposeMatrix = gl.getUniformLocation(outShaderProgram, "uMVInverseTransposeMatrix");

    return outShaderProgram;
}


var SphereFragmentShader = `
precision lowp float;

varying vec3 v_normal;     
uniform vec4 uVertexColor;   

void main() {
  float light;

  light = dot(v_normal, vec3(0.0,1.0,0.0))*0.5 +0.5; 
  
  gl_FragColor = vec4(uVertexColor.x*light,uVertexColor.y*light,uVertexColor.z*light,uVertexColor.a) ;
}`;

var SphereVertexShader = `    
	attribute vec4 aVertexPosition;
	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;
	uniform mat4 uMVInverseTransposeMatrix;    
	varying vec3 v_normal; 
	varying vec4 a_position;   
	void main() {

	a_position= aVertexPosition;

	// Multiply the position by the matrix.
	gl_Position = uPMatrix * uMVMatrix * aVertexPosition;

	// orient the normals and pass to the fragment shader
	v_normal =normalize( mat3(uMVInverseTransposeMatrix) * vec3(aVertexPosition));

	}
`;


class CSphere
{
    GetVec3Position(u,v)
    {
        var x= Math.cos(u)*Math.cos(v);
        var y= Math.sin(u)*Math.cos(v);
        var z= Math.sin(v);
        return [x,y,z]
    }


    constructor()
    {
        var res = 16;
        var stepU = 2*Math.PI/res;
        var stepV = Math.PI/res;

        this.positions=[];
        this.normals=[];
        this.indices=[];

        
        for (var iv=0;iv<=res;iv++)
        {
            for (var iu=0;iu<=res;iu++)
            {
                var u=iu*2*Math.PI/res-Math.PI;
                var v=iv*Math.PI/res-Math.PI/2;

                var pos = this.GetVec3Position(u,v);

                // compute sphere position
                this.positions.push(pos[0]);
                this.positions.push(pos[1]);
                this.positions.push(pos[2]);

                if (((iv+1)<=res) && ((iu+1)<=res))
                {
                  this.indices.push(iu+iv*(res+1));
                  this.indices.push(iu+1+iv*(res+1));
                  this.indices.push(iu+(iv+1)*(res+1));
          
                  this.indices.push(iu+1+iv*(res+1));
                  this.indices.push(iu+1+(iv+1)*(res+1));
                  this.indices.push(iu+(iv+1)*(res+1));
                 
                }
            }
        }
         
        

        // Vertex Buffer
        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = this.positions.length/3;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);	

        // Index Buffer
        this.indiceBuffer = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }



    Draw(pShaderProgram)
    {
        if(gCurrentShaderProgram != pShaderProgram) 
        {
            gl.useProgram(pShaderProgram);
            gCurrentShaderProgram = pShaderProgram;
        }

        if(gCurrentGraphicalObject!=1)   
        {    
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(pShaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
            gCurrentGraphicalObject = 1;
        }        
        
        gl.uniform4fv (pShaderProgram.vertexColorAttribute, shaderVertexColorVector);
        gl.uniformMatrix4fv(pShaderProgram.mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix4fv(pShaderProgram.pMatrixUniform, false, pMatrix);
        mat4.invert(mvInverseMatrix,mvMatrix);
        mat4.transpose(mvInverseTransposeMatrix,mvInverseMatrix);
        gl.uniformMatrix4fv(pShaderProgram.mvInverseTransposeMatrix, false, mvInverseTransposeMatrix);
        
        gl.drawElements(gl.TRIANGLES,this.indices.length, gl.UNSIGNED_SHORT,0);
    }

    IsRayCollisionDetected(rayPoint,rayDir,mvMatrix)
    {
        var tranformRayPoint1 = vec3.create();
        var tranformRayPoint2 = vec3.create();
        var tranformRayPointToTarget = vec3.create();
        var tranformRayDir = vec3.create();
        var mvMatrixInv = mat4.create();
        mat4.invert(mvMatrixInv,mvMatrix);
        vec3.transformMat4(tranformRayPoint1,rayPoint,mvMatrixInv);
        vec3.transformMat4(tranformRayPoint2,[rayPoint[0]+rayDir[0],rayPoint[1]+rayDir[1],rayPoint[2]+rayDir[2]],mvMatrixInv);
        vec3.subtract(tranformRayDir,tranformRayPoint2,tranformRayPoint1);
        vec3.scale(tranformRayPointToTarget,tranformRayPoint1,-1);
        vec3.normalize(tranformRayDir,tranformRayDir);
        
        //rayDist = rayDir(normalize).rayPointToTargetVec
        //squareCollisionDist = rayPointDist^2-rayDist^2
        var rayDist = vec3.dot(tranformRayDir,tranformRayPointToTarget);
        var raySquaredPointDist = vec3.squaredLength(tranformRayPointToTarget);
        var squareCollisionDist =raySquaredPointDist-rayDist**2;

        return ( squareCollisionDist<1 );

    }

    GetCollisionPosUsingMatrixList(pRayPoint1,pRayPoint2,pCollisionMatrixList,pLastCollPt,pDistSquaredOffset,pUserData)
    {
        var collisionPt = pLastCollPt;

        for (var i=0;i<pCollisionMatrixList.length;i++)
        {
            collisionPt = this.GetCollisionPos(pRayPoint1,pRayPoint2,pCollisionMatrixList[i],collisionPt,pDistSquaredOffset,pUserData);
        }  
        return collisionPt;
    }


    GetCollisionPos(pRayPoint1,pRayPoint2,pMvMatrix,pLastCollPt,pDistSquaredOffset,pUserData)
    {
        var tranformRayPoint1 = vec3.create();
        var tranformRayPoint2 = vec3.create();
        var tranformRayDir = vec3.create();
        var mvMatrixInv = mat4.create();

        mat4.invert(mvMatrixInv,pMvMatrix);
        vec3.transformMat4(tranformRayPoint1,pRayPoint1,mvMatrixInv);
        vec3.transformMat4(tranformRayPoint2,pRayPoint2,mvMatrixInv);
        vec3.subtract(tranformRayDir,tranformRayPoint2,tranformRayPoint1);
        vec3.normalize(tranformRayDir,tranformRayDir);

        var xa = tranformRayDir[0] ;
        var ya = tranformRayDir[1] ;
        var za = tranformRayDir[2] ;

        var xb = tranformRayPoint1[0] ;
        var yb = tranformRayPoint1[1] ;
        var zb = tranformRayPoint1[2] ;

        var a = xa**2 + ya**2 + za**2;
        var b = 2*(xa*xb + ya*yb + za*zb);
        var c = xb**2 + yb**2 + zb**2 -1 ;
    
        var delta = b**2-4*a*c;

        if(delta<=0) return pLastCollPt;           
                
        var t1 = (-b - Math.sqrt(delta))/2*a
        var t2 = (-b + Math.sqrt(delta))/2*a
        if ( t1 < 0 && t2 < 0) return pLastCollPt;  
        
        
        var transformCollisionPoint =[xa*t1+xb,ya*t1+yb,za*t1+zb];
        var collisionPoint = [];         
        vec3.transformMat4(collisionPoint,transformCollisionPoint,pMvMatrix);

        
        var squaredDistPoint1ToCollision = vec3.squaredDistance(pRayPoint1,collisionPoint); 
        var squaredDistPoint1ToPoint2 = vec3.squaredDistance(pRayPoint1,pRayPoint2);

        /* No collision if dist to collision is lower than dist to the new position */
        if ((squaredDistPoint1ToPoint2+pDistSquaredOffset) < squaredDistPoint1ToCollision) return pLastCollPt;

      
        if (pLastCollPt!=null)
        {
            var squaredDistLastCollision = vec3.squaredDistance(pRayPoint1,pLastCollPt);  
            if (squaredDistLastCollision  < squaredDistPoint1ToCollision) return pLastCollPt;
        } 

        collisionPoint[3]=pUserData;

        return collisionPoint;
        
        
        // var collisionNormal = vec3.create();
        // var mvInverseTransposeMatrix = mat4.create();
        // mat4.transpose(mvInverseTransposeMatrix,mvMatrixInv);
        // mat3.fromMat4(mvMatrix,pMvMatrix);
        // vec3.transformMat3(collisionNormal,transformCollisionPoint,mvMatrix);        
        // vec3.normalize(collisionNormal,collisionNormal);
        
        // return {"pos":collisionPoint,"normal":collisionNormal,"inside":( t1 < 0 ||  t2 < 0),"squaredDist":squaredist};  

          
    }

}

