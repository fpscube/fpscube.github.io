


class CScreen
{
    constructor(pCanva3DName,pCanva2DName) {
        this.windowWidth=0;
        this.windowHeight =0;
        this.windowRatio=1;
        this.newwindowWidth=0;
        this.newwindowHeight =0;        
	    this.canvas3D = document.getElementById(pCanva3DName);
        this.canvas2D = document.getElementById(pCanva2DName);
        this.orientation ='landscape';   

    }


  updateViewPortAndCanvasSize(pGl)
    {
		
		var width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

		var height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;	

		var orientation = '';
		switch(screen.orientation) {  
		  case -90 || 90:
			orientation ='landscape';
			break; 
		  default:
			orientation ='portrait';
			break; 
		}	
		
        if ((this.windowWidth == width) && (this.windowHeight == height) && (this.orientation == orientation)) return;
        this.windowWidth = width;
        this.windowHeight = height;
        this.orientation = orientation;

        if(this.windowWidth>1280)
        {
            this.newwindowWidth = 	1280;
            this.newwindowHeight =  this.windowHeight * 1280/ this.windowWidth;
        }
        else
        {
            this.newwindowWidth = 	 this.windowWidth;
            this.newwindowHeight = 	  this.windowHeight;
        }

        if (this.orientation == 'landscape') 
        {
            this.newwindowWidth = this.windowHeight;
            this.newwindowHeight = 	 this.windowWidth;
        }
            
        this.canvas3D.width = this.newwindowWidth;
        this.canvas3D.height = this.newwindowHeight;
        this.canvas2D.width = this.windowWidth;
        this.canvas2D.height = this.windowHeight;

        gl.viewportWidth = this.newwindowWidth;
        gl.viewportHeight = this.newwindowHeight;

        this.windowRatio = this.newwindowWidth/this.newwindowHeight;
	

	    pGl.viewport(0, 0, this.newwindowWidth, this.newwindowHeight);
    }
}
