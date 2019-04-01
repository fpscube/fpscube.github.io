
var CMultiPlayerInst;


class CMultiPlayer
{

	constructor(pHero) {

        CMultiPlayerInst = this;
        this.PlayersDataModel = null;
        this.NbPlayers = 2;
        this.Heros = [];
        this.IsInTarget=null;
        this.RxBinData=null;
        this.TxBinData=pHero.GetMultiPlayerData();

        for (var i =0 ;i<2;i++)
        {
           this.Heros.push(new CHuman([0,0,0],2,[1,0,-1],"NoName"));
        }
   

        this.url = 'http://192.168.1.12:8080';
        this.xhttp = new XMLHttpRequest(); 
        this.xhttp.onreadystatechange =  this.onChange;
        this.xhttp.responseType = 'arraybuffer';
        this.sendPostRequest('\0' + pHero.Name + '\0');
    }

    sendPostRequest(payload)
    {
        this.xhttp.open("POST", this.url, true);
        this.xhttp.setRequestHeader('Accept', '');
        this.xhttp.setRequestHeader('Accept-Language', '');
        this.xhttp.send(payload);
    }

    onChange()
    {
        if (this.readyState == 4 && this.status == 200) {
            
            var resp = new Uint8Array(this.response);
                if(resp.byteLength==1)     
                {
                    alert(resp[0]);
                    GameInst.Hero.Id  = resp[0];    
                } 
                else
                {
                    CMultiPlayerInst.RxBinData = this.response;
                }

                if(GameInst.Hero.Id >=0)
                {
                    CMultiPlayerInst.sendPostRequest(CMultiPlayerInst.TxBinData);
                }
                
                //    var test = GameInst.Hero.GetHeroMultiPlayerData() ; 
                //   GameInst.Hero. UpdateHeroMultiPlayer(test[0],GameInst.CamPos,GameInst.CamDir);
        }
    }
   


    update(pCamPos,pCamDir)
    {
        
        this.IsInTarget=null; 
        this.TxBinData=GameInst.Hero.GetMultiPlayerData();

        // Update multiplayer hero with distant data
        for(var heroId=0;heroId<2;heroId++)
        {
            if(heroId!=GameInst.Hero.Id)
            {
                this.Heros[heroId].UpdateMultiPlayer(this.RxBinData,GameInst.CamPos,GameInst.CamDir,heroId);
                
                if(this.IsInTarget==null && this.Heros[heroId].IsInTarget)
                {
                    this.IsInTarget = this.Heros[heroId];
                }
            }
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

    draw ()
    {
        // Draw distant heros
        for(var heroId=0;heroId<this.NbPlayers;heroId++)
        {
            if(heroId!=GameInst.Hero.Id)
            {
                this.Heros[heroId].draw();	
            }
        }
    }
}