
var CMultiPlayerInst;

var firebase

class CMultiPlayer
{

	constructor() {

        // Initialize Firebase
       // firebase=null
        firebase.initializeApp({
            apiKey: "AIzaSyCxSOq__bGchn5bJflqTRK2yMytz-YQ-WY",
            authDomain: "fpscube-d229f.firebaseapp.com",
            databaseURL: "https://fpscube-d229f.firebaseio.com",
            projectId: "fpscube-d229f",
            storageBucket: "fpscube-d229f.appspot.com",
            messagingSenderId: "858204774229"
        });


        CMultiPlayerInst = this;
        this.PlayersDataModel = null;
        this.PlayerID = -1;
        this.MaxNbPlayers = 12;
        this.NbPlayers = 1;
        this.Connected = false
        this.Heros = [];
        this.IsInTarget=null; 
        for (var i =0 ;i<8;i++)
        {
            this.Heros.push(new CHuman([0,0,0],2,[1,0,-1],"NoName"));
        }
        
        if(firebase!=null)
        {
            var playerDataRef = firebase.database().ref();
            playerDataRef.on('value',this.onBaseChange)
        }

    }

    getPlayerId(players)
    {
        if(players==null) return 0 ;
        for (i=0;i<this.MaxNbPlayers;i++)
        {
            if(players[i]==undefined ||
                players[i][0] ==undefined ||
                players[i][0] < (Date.now()-(10*1000)))
            {
                CMultiPlayerInst.PlayerID = i;
                return;
            }
        } 
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


    onBaseChange(data)
    {
        CMultiPlayerInst.PlayersDataModel = data.val();
        if(!CMultiPlayerInst.Connected)
        {
            CMultiPlayerInst.getPlayerId(CMultiPlayerInst.PlayersDataModel);
            CMultiPlayerInst.Connected = true;
        }
    }


    update(hero,pCamPos,pCamDir)
    {
        if ( !this.Connected) return;
        if ( CMultiPlayerInst.PlayerID == -1)
        {            
            this.getPlayerId(this.PlayersDataModel)
            return;
        }
        
        hero.Id = this.PlayerID;
        this.IsInTarget=null; 

        // Update multiplayer hero with distant data
        for(var heroId=0;heroId<this.NbPlayers;heroId++)
        {
            if(heroId!=this.PlayerID)
            {
                var distDB = this.PlayersDataModel[heroId];
                var mHeros =  this.Heros[heroId];
                mHeros.UpdateHeroMultiPlayer(distDB,pCamPos,pCamDir,heroId) 
                
                if(this.IsInTarget==null && mHeros.IsInTarget)
                {
                    this.IsInTarget = mHeros;
                }
            }
        }

        // Update NB players
        this.NbPlayers = 0;
        for (var id in this.PlayersDataModel)
        {
            if(this.PlayersDataModel[id] == undefined ||
               this.PlayersDataModel[id][0] == undefined ||
               this.PlayersDataModel[id][0] > (Date.now()-(10*1000)))
            {
                this.NbPlayers  +=1;
            }
        } 


        // Send Local Hero To distant database
        var dataUpdate = {};  
        dataUpdate['/' + this.PlayerID  ] = hero.GetHeroMultiPlayerData()   
        
              
        if(this.NbPlayers<2)
        {  
            if( this.PlayersDataModel == null ||
                this.PlayersDataModel[this.PlayerID] == undefined ||
                this.PlayersDataModel[this.PlayerID][0]  ||
                this.PlayersDataModel[this.PlayerID][0] < (Date.now()-(5*1000)))
            {
                var playerDataRef = firebase.database().ref();
                playerDataRef.update(dataUpdate);
            }
        }
        else 
        {
            var playerDataRef = firebase.database().ref();
            playerDataRef.update(dataUpdate);
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
            if(heroId!=this.PlayerID)
            {
                this.Heros[heroId].draw();	
            }
        }
    }
}