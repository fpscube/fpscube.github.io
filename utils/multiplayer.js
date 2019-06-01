
var CMultiPlayerInst;

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
 

class CMultiPlayer
{

	constructor(pHero) {

        CMultiPlayerInst = this;
        this.PlayersDataModel = null;
        this.NbPlayers = 8;
        this.IsInTarget=null;
        this.RxBinData=null;
        this.Heros = [];

        this.DiscoveryTimeInMs = timeGetCurrentInMs() + 500 + 1000*Math.random(); // discovery time is random in order to limit collision

        this.TxBinData=pHero.GetMultiPlayerData();

        for (var i =0 ;i<8;i++)
        {
           this.Heros.push(new CHuman([0,0,0],2,[1,0,-1],true,"Player " + i));
        }
   

      //  this.url = 'http://192.168.1.12:8080';
        this.url = 'http://127.0.0.1:8080';
        this.xhttp = new XMLHttpRequest(); 
        this.xhttp.onreadystatechange =  this.onChange;
        this.xhttp.responseType = 'arraybuffer';
        this.sendPostRequest();
    }

    sendPostRequest()
    {
        CMultiPlayerInst.xhttp.open("POST", CMultiPlayerInst.url, true);
        CMultiPlayerInst.xhttp.setRequestHeader('Accept', '');
        CMultiPlayerInst.xhttp.setRequestHeader('Accept-Language', '');    
        CMultiPlayerInst.xhttp.send(CMultiPlayerInst.TxBinData);
    }

    onChange()
    {
        if (this.readyState == 4 && this.status == 200 ) {
            
            if(CMultiPlayerInst.RxBinData==null)
            { 
                CMultiPlayerInst.RxBinData = this.response;
            }
           CMultiPlayerInst.sendPostRequest();
		   //setTimeout(CMultiPlayerInst.sendPostRequest,  10) ;
        }
    }
   


    update(pCamPos,pCamDir)
    {
        this.IsInTarget=null; 
        this.TxBinData=GameInst.Hero.GetMultiPlayerData();
        
        if(CMultiPlayerInst.RxBinData!=null)
        {
            
            var int32Array = new Int32Array(CMultiPlayerInst.RxBinData);   
            GameInst.Hero.Id =  int32Array[0];

            for(var heroId=0;heroId<8;heroId++)
            {
                this.Heros[heroId].UpdateMultiPlayerData(this.RxBinData,heroId);  
            }                        
            CMultiPlayerInst.RxBinData = null;
        }

        
        for(var heroId=0;heroId<8;heroId++)
        {
            this.Heros[heroId].UpdateMultiPlayer(GameInst.CamPos,GameInst.CamDir);    
        }

    }

    getCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
    {
        var collision = pLastCollPt;
        for(var i =0 ;i<this.Heros.length;i++){
            collision = this.Heros[i].getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
        }
        return collision;
    }

    getScoreTable(pHero)
    {
        var scoreTab=[];
        for (var i=0;i<this.NbPlayers;i++){     
            var kills=0;
            for (var y=0;y<this.NbPlayers;y++){
                if(i==y) continue; // not count auto kill
                var hero = (pHero.Id==y)?pHero:this.Heros[y];
                var killBy = hero.KillBy;
                if (killBy == null) continue;
                var val = killBy[i];
                if(val != null) kills += val;
            }  
            var hero = (pHero.Id==i)?pHero:this.Heros[i];
            var deaths=0;
            var killBy = hero.KillBy;
            if (killBy != null) {
            for (var k=0;k<killBy.length;k++){
                deaths += killBy[k];
            }}
            scoreTab[i] = [hero.Name,kills,deaths,pHero.Id==i];
        }
        return scoreTab;
    }

    draw ()
    {
        // Draw distant heros
        for(var heroId=0;heroId<8;heroId++)
        {

            if(heroId == GameInst.Hero.Id) continue;
            this.Heros[heroId].draw();	                       
        }
    }
}