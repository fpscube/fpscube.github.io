var Sphere;
function SphereInit() {Sphere = new CSphere;}

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
        var res = 4;
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
                
                // compute normal position
                this.normals.push(pos[0]);
                this.normals.push(pos[1]);
                this.normals.push(pos[2]);

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
         
        gl.useProgram(shaderProgram);

        // Vertex Buffer
        this.vertexBuffer = gl.createBuffer();
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = this.positions.length/3;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);	

        // Normal Buffer	
        this.normalBuffer = gl.createBuffer();
        this.normalBuffer.itemSize = 3;
        this.normalBuffer.numItems = this.normals.length/3;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);	
            
        // Index Buffer
        this.indiceBuffer = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    Draw(pShaderProgram)
    {
               
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(pShaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(pShaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indiceBuffer);
    
        
        gl.useProgram(pShaderProgram);
        setMatrixUniforms(pShaderProgram);
        
        gl.drawElements(gl.TRIANGLES,this.indices.length, gl.UNSIGNED_SHORT,0);
    }

 

}

