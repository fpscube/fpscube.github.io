
var MultiPlayerInst;

var firebase

class CMultiPlayer
{

	constructor() {

        // Initialize Firebase
        firebase=null
        // firebase.initializeApp({
        //     apiKey: "AIzaSyCxSOq__bGchn5bJflqTRK2yMytz-YQ-WY",
        //     authDomain: "fpscube-d229f.firebaseapp.com",
        //     databaseURL: "https://fpscube-d229f.firebaseio.com",
        //     projectId: "fpscube-d229f",
        //     storageBucket: "fpscube-d229f.appspot.com",
        //     messagingSenderId: "858204774229"
        // });


        MultiPlayerInst = this;
        this.PlayersDataModel = null;
        this.PlayerID = 0;
        this.NbPlayers = 1;
        this.Connected = false
        this.Heros = [];
        for (var i =0 ;i<8;i++)
        {
            this.Heros.push(new CHuman([0,0,0],2,[1,0,-1]));
        }
        
        if(firebase!=null)
        {
            var playerDataRef = firebase.database().ref();
            playerDataRef.on('value',this.onBaseChange)
        }

    }

    getPlayerId(players)
    {
        MultiPlayerInst.PlayerID = 0;
        for (i=(players.length-1);i>=0;i--)
        {
            if(players[i]["time"] < (Date.now()-(10*1000)))
            {
                MultiPlayerInst.PlayerID = i;
            }
        } 
    }



    onBaseChange(data)
    {
        MultiPlayerInst.PlayersDataModel = data.val();
        if(!MultiPlayerInst.Connected)
        {
            MultiPlayerInst.getPlayerId(MultiPlayerInst.PlayersDataModel)
            MultiPlayerInst.Connected = true;
        }
    }


    update(hero,camDir,life)
    {
        if ( !this.Connected) return;

        for(var heroId=0;heroId<this.NbPlayers;heroId++)
        {
            if(heroId!=this.PlayerID)
            {
                var distDB = this.PlayersDataModel[heroId];
                var mHeros =  this.Heros[heroId];
                mHeros.Pos[0] = distDB["x"];
                mHeros.Pos[1] = distDB["y"];
                mHeros.Pos[2] = distDB["z"];
                mHeros.Dir[0] = distDB["dx"];
                mHeros.Dir[1] = distDB["dy"];
                mHeros.Dir[2] = distDB["dz"];
                mHeros.HSpeed = distDB["hs"];
                mHeros.gunSelected = distDB["hs"];
                
                mHeros.GunSelected = (distDB["gs"]==0)?GunsInst.Uzi:GunsInst.Bazooka;

                var fire = (distDB["fc"] > mHeros.FireCount)
                mHeros.UpdateHero(fire,[distDB["cx"],distDB["cy"],distDB["cz"]],distDB["Life"]);	
            }
        }

        //update NB Players
        this.NbPlayers =0;
        for (var id in this.PlayersDataModel)
        {
            if(this.PlayersDataModel[id]["time"] > (Date.now()-(10*1000)))
            {
                this.NbPlayers  +=1;
            }
        } 

        var gunSelected = hero.GunSelected ;

        var dataUpdate = {};  
        dataUpdate['/' + this.PlayerID] = {
            time:Date.now(),
            x: hero.Pos[0],y: hero.Pos[1],z: hero.Pos[2],
            dx:hero.Dir[0],dy:hero.Dir[1],dz:hero.Dir[2],
            cx:camDir[0],cy:camDir[1],cz:camDir[2],
            hs:hero.HSpeed,
            fc:hero.FireCount,
            gs:gunSelected,
            life:life
        };
              
        if(this.NbPlayers<2)
        {  
            if(this.PlayersDataModel[this.PlayerID]["time"] < (Date.now()-(5*1000)))
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

    draw ()
    {
        for(var heroId=0;heroId<this.NbPlayers;heroId++)
        {
            if(heroId!=this.PlayerID)
            {
                this.Heros[heroId].draw();	
            }
        }
    }
}