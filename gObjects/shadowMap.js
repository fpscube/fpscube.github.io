
var shadowMapFramebuffer ;
var shadowMapDepthTextureSize = 8192  ;
var shadowMapDepthTexture;

function shadowMapInit()
{

    shadowMapDepthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowMapDepthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB , shadowMapDepthTextureSize, shadowMapDepthTextureSize, 0, gl.RGB , gl.UNSIGNED_BYTE, null);

    shadowMapFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);

    var renderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowMapDepthTextureSize, shadowMapDepthTextureSize)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowMapDepthTexture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)
    

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowMapDepthTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
}

function shadowMapStart () 
{
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapFramebuffer);

}
function shadowMapStop () 
{
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, shadowMapDepthTexture)
}


