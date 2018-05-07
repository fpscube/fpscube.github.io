

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
            this.newScreenWidth = screen.height * 1280/ screen.width;
        }
            
        this.canvas3D.width = newWidth;
        this.canvas3D.height = newHeight
        this.canvas2D.width = screen.width;
        this.canvas2D.height = screen.height;

	    pGl.viewport(0, 0, newWidth, newHeight);
    }
}