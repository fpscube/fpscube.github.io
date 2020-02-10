
var CMultiPlayerInst;

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
 

class CMultiPlayer
{

	constructor(pHero) {

        CMultiPlayerInst = this;
        this.PlayersDataModel = null;
        this.NbPlayers = 1;
        this.NbOnlinePlayers = 1;
        this.RxBinData=null;
        this.Heros = [];

        this.TxBinData=pHero.GetMultiPlayerData();

        for (var i =0 ;i<8;i++)
        {
           this.Heros.push(new CHuman([0,0,0],2,[1,0,-1],true,"Player " + i));
        }
   
        this.url = "http:/" + "/" + location.host + ":8080";
        this.xhttp = new XMLHttpRequest(); 
        this.xhttp.onreadystatechange =  this.onChange;
        this.xhttp.responseType = 'arraybuffer';
        this.sendPostRequest();
    }

    sendPostRequest()
    {
        try{
        CMultiPlayerInst.xhttp.open("POST", CMultiPlayerInst.url, true);       
        CMultiPlayerInst.xhttp.setRequestHeader('Accept', '');
        CMultiPlayerInst.xhttp.setRequestHeader('Accept-Language', '');    
        CMultiPlayerInst.xhttp.send(CMultiPlayerInst.TxBinData); }
        catch(error) {
        }
    
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
   


    update()
    {
        this.TxBinData=GameInst.Hero.GetMultiPlayerData();
        if(GameInst.Hero.Id >=0 ) this.NbPlayers=8;

        if(CMultiPlayerInst.RxBinData!=null)
        {
            
            var int32Array = new Int32Array(CMultiPlayerInst.RxBinData);   
            GameInst.Hero.Id =  int32Array[0];

            for(var heroId=0;heroId<8;heroId++)
            {
               if(GameInst.Hero.Id == heroId) continue;
                this.Heros[heroId].UpdateMultiPlayerData(this.RxBinData,heroId);  
            }                        
            CMultiPlayerInst.RxBinData = null;
        }

        var nbOnlinePlayers=0;
        var bestTargetSquaredDist = null;
        if(GameInst.HumanInTarget != null && GameInst.HumanInTarget.CamRayCollisionPos != null )
        {
            bestTargetSquaredDist = vec3.squaredDistance(GameInst.Hero.Pos,GameInst.HumanInTarget.CamRayCollisionPos);
        }
        for(var heroId=0;heroId<8;heroId++)
        {
            if(this.Heros[heroId].MultiConnexionTime==null) continue;
			nbOnlinePlayers +=1;
            this.Heros[heroId].UpdateMultiPlayer(GameInst.CamPos,GameInst.CamDir);
            
            if (this.Heros[heroId].CamRayCollisionPos==null) continue;
            
            var targetSquaredDist = vec3.squaredDistance(GameInst.Hero.Pos,this.Heros[heroId].CamRayCollisionPos);

            if(GameInst.HumanInTarget==null || (targetSquaredDist < bestTargetSquaredDist))
            {
                GameInst.HumanInTarget =  this.Heros[heroId];
                bestTargetSquaredDist = targetSquaredDist;
            }
		    
        }
		
		this.NbOnlinePlayers = nbOnlinePlayers;


    }

    getCollisionPoint(pRayPoint1,pRayPoint2,pLastCollPt,pDistSquaredOffset)
    {
        var collision = pLastCollPt;
        for(var i =0 ;i<this.Heros.length;i++){
            collision = this.Heros[i].getCollisionPoint(pRayPoint1,pRayPoint2,collision,pDistSquaredOffset);
        }
        return collision;
    }

    getEventTable()
    {
        var timeMs = timeGetCurrentInMs();
        var eventTab=[];
        for (var i=0;i<this.NbPlayers;i++){  
            var distHero = this.Heros[i];              
            if(i ==GameInst.Hero.Id )  continue; 
            if(distHero.MultiConnexionTime!=null && (timeMs-distHero.MultiConnexionTime)<10000)
            {
                eventTab.push(distHero.Name + " - has joined the game");
            }
            if(distHero.MultiDisConnexionTime!=null && (timeMs-distHero.MultiDisConnexionTime)<10000)
            {
                eventTab.push(distHero.Name + " - has quit the game");
            }
        }

        for (var i=0;i<this.NbPlayers;i++){  
      
            var deadHero = this.Heros[i];    
            if(i ==GameInst.Hero.Id )  deadHero = GameInst.Hero; 

            for (var y=0;y<this.NbPlayers;y++){  
                var killTime = deadHero.KillByEventTime[y] ;
                var killNb = deadHero.KillBy[y] ;
                if(killTime == null) continue;
                if((timeMs-killTime)<5000)
                {
                    var winHero = this.Heros[y];
                    if(y == GameInst.Hero.Id ) winHero = GameInst.Hero;
                    if(y==i)
                    {                        
                        eventTab.push(deadHero.Name + " kill himself  (" + killNb + " time(s))");
                    }
                    else
                    {
                        eventTab.push(deadHero.Name + " was killed by " + winHero.Name + " (" + killNb + " time(s))");
                    }
                }
            }
        }

        return eventTab;
    }

	

    getScoreTable(pHero)
    {
        var scoreTab=[];
        for (var i=0;i<this.NbPlayers;i++){                
            if((i !=GameInst.Hero.Id) && this.Heros[i].MultiConnexionTime==null)  continue; 
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
            scoreTab.push([hero.Name,kills,deaths,pHero.Id==i]);
        }
        return scoreTab;
    }

    draw ()
    {
        // Draw distant heros
        for(var heroId=0;heroId<8;heroId++)
        {

            if(heroId == GameInst.Hero.Id) continue;
            if(this.Heros[heroId].MultiConnexionTime==null) continue;
            this.Heros[heroId].draw();	                       
        }
    }
}