


class CScreen
{
    constructor(pCanva3DName,pCanva2DName) {
        this.screenWidth=0;
        this.screenHeight =0;
        this.newScreenWidth=0;
        this.newScreenHeight =0;        
	    this.canvas3D = document.getElementById(pCanva3DName);
        this.canvas2D = document.getElementById(pCanva2DName);

    }


    updateViewPortAndCanvasSize(pGl)
    {
        if ((this.screenWidth == screen.width) && (this.screenHeight == screen.height)) return;
        this.screenWidth = screen.width;
        this.screenHeight = screen.height;

        if(screen.width>1280)
        {
            this.newScreenWidth = 	1280;
            this.newScreenHeight = screen.height * 1280/ screen.width;
        }
        else
        {
            this.newScreenWidth = 	 screen.width;
            this.newScreenHeight = 	 screen.height;
        }
            
        this.canvas3D.width = this.newScreenWidth;
        this.canvas3D.height = this.newScreenHeight;
        this.canvas2D.width = this.screenWidth;
        this.canvas2D.height = this.screenHeight;

        gl.viewportWidth = this.newScreenWidth;
        gl.viewportHeight = this.newScreenHeight;
	

	    pGl.viewport(0, 0, this.newScreenWidth, this.newScreenHeight);
    }
}