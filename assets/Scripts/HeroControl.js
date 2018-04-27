import { getStompClient, subscribeTopic } from './StompHandler.js';
import { getRoomPlayers, joinRoom, createRoom } from './RestController.js';
cc.Class({
    extends: cc.Component,

    properties: {
        speed: cc.v2(0, 0),
        maxSpeed: cc.v2(400, 400),
        drag: 1000,
        direction: 0,
        directiony: 0,
        jumpSpeed: 0,
		health:0,
		ammo:0,
        bullet: {
            default: null,
            type: cc.Node,
        },
        loadedPlayers: {
            default : [],
            type: [cc.Node],
        },
        healthBar: {
            default : null,
            type: cc.ProgressBar,
        },
		ammoBar:{
			default: null,
			type:cc.Label,
		},
		usernameLabel: {
		    default: null,
		    type: cc.Label,
		},
		
    },
	    onLoad: function () {
        //private variables declaration
		this.room = cc.find("form").getComponent("MenuController").room;
		this.username = cc.find("form").getComponent("MenuController").username;
		this.id = cc.find("form").getComponent("MenuController").id;
        this.isDead = false;
        this.health = 100;
		this.ammo=16;
        this.stompClient = null;
        this.pi = 3.141516;
		
		this.players = null;
		
        
        
        this.usernameLabel.string = this.username;

        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        var canvas = cc.find('Camera');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
		
		
		this.position = this.node.position;
		this.rotation = this.node.rotation;
		this.addBullet = this.addBulletToScene;

        this.connectAndSubscribe();

        //add keyboard input listener to call turnLeft and turnRight
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.onKeyPressed.bind(this),
            onKeyReleased: this.onKeyReleased.bind(this),
        }, this.node);
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove: this.onMouseMove.bind(this),
        }, this.node);


        this.collisionX = 0;
        this.collisionY = 0;

        this.prePosition = cc.v2();
        this.preStep = cc.v2();

        this.touchingNumber = 0;
		
		
		
		
		this.loadAllPlayers();
		
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    },
    
    onKeyPressed: function (keyCode, event) {
        if(!this.isDead){
            switch(keyCode) {
                case cc.KEY.a:
                case cc.KEY.left:
                    this.direction = -1;
                    break;
                case cc.KEY.d:
                case cc.KEY.right:
                    this.direction = 1;
                    break;
                case cc.KEY.w:
                case cc.KEY.up:
                    this.directiony = 1;
                    /*if (!this.jumping) {
                        this.jumping = true;
                        this.speed.y = this.jumpSpeed;
                    }*/
                    break;
                case cc.KEY.s:
                case cc.KEY.down:
                    this.directiony = -1;
                    break;
            }
        }
        //console.log("posx: " + this.node.position);

    },
    
    onKeyReleased: function (keyCode, event) {
        switch(keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
            case cc.KEY.d:
            case cc.KEY.right:
                this.direction = 0;
                break;
            case cc.KEY.w:
            case cc.KEY.up:
            case cc.KEY.s:
            case cc.KEY.down:
                this.directiony = 0;
                break;
        }
    },

    onMouseMove: function(event){
        var n = Math.floor(event.getLocationX());
        var m = Math.floor(event.getLocationY());
        //cc.log("x: " + n + "y: " + m);
        var diff =  {
                    'x' : n - this.node.position.x,
                    'y': m - this.node.position.y
                    };
        var angle = Math.atan2(diff.x, diff.y);
        this.node.rotation = angle * (180/this.pi);

    },

    onCollisionEnter: function (other, self) {
        //console.log(this.healthBar.progress);

        if(other.node.name == "Bullet" && other.Bullet.Shooter!=this ){
            //console.log("this id: " + this.id + "   bulletId: " + other.node.getComponent('Bullet').idBullet );
			this.onShootBegan(other);
			this.node.color = cc.Color.RED;
			
        
        }else if(other.node.name == "Wall"){
            //this.healthBar.getComponent("ProgressBar").progress;
            this.touchingNumber ++;

            // 1st step
            // get pre aabb, go back before collision
            var otherAabb = other.world.aabb;
            var otherPreAabb = other.world.preAabb.clone();
            var selfAabb = self.world.aabb;
            var selfPreAabb = self.world.preAabb.clone();

            // 2nd step
            // forward x-axis, check whether collision on x-axis
            selfPreAabb.x = selfAabb.x;
            otherPreAabb.x = otherAabb.x;
            console.log("col");
            if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
                if ((selfPreAabb.xMax > otherPreAabb.xMax)) {
                    //this.node.x = otherPreAabb.xMax - this.node.parent.x;
                    this.collisionX = -1;
                }
                else if ((selfPreAabb.xMin < otherPreAabb.xMin)) {
                    //this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                    this.collisionX = 1;
                }

                //this.speed.x = 0;
                other.touchingX = true;
                //return;
            }

            // 3rd step
            // forward y-axis, check whether collision on y-axis
            selfPreAabb.y = selfAabb.y;
            otherPreAabb.y = otherAabb.y;

            if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
                if ((selfPreAabb.yMax > otherPreAabb.yMax)) {
                    //this.node.y = otherPreAabb.yMax - this.node.parent.y;
                    //this.jumping = false;
                    this.collisionY = -1;
                }
                else if ((selfPreAabb.yMin < otherPreAabb.yMin)) {

                    //this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                    this.collisionY = 1;
                }

                //this.speed.y = 0;
                other.touchingY = true;
                //return;
            }

        }else if(other.node.name == "Kit"){
            if(this.health >= 70){
                this.health = 100;
            }else{
                this.health += 30;
            }
            this.healthBar.progress = this.health/100;
        }else if (other.node.name== "Ammo"){
			this.ammo+=15;
			
			this.ammoBar.string = this.ammo;			
		}
		else if (other.node.name=="p2"){
			
		}
		
    },

    
    onCollisionExit: function (other) {
        this.touchingNumber --;
        if (this.touchingNumber === 0) {
            this.node.color = cc.Color.WHITE;
        }

        if (other.touchingX) {
            this.collisionX = 0;
            other.touchingX = false;
        }
        if (other.touchingY) {
            other.touchingY = false;
            this.collisionY = 0;
            //this.jumping = true;
        }
    },
    
    update: function (dt) {

        if (this.direction === 0) {
            if (this.speed.x > 0) {

                this.speed.x -= this.drag * dt;
                if (this.speed.x <= 0) this.speed.x = 0;
            }
            else if (this.speed.x < 0) {
                this.speed.x += this.drag * dt;
                if (this.speed.x >= 0) this.speed.x = 0;
            }
        }
        else {
            this.speed.x += (this.direction > 0 ? 1 : -1) * this.drag * dt;
            if (Math.abs(this.speed.x) > this.maxSpeed.x) {
                this.speed.x = this.speed.x > 0 ? this.maxSpeed.x : -this.maxSpeed.x;
            }
        }

        if (this.directiony === 0) {
            if (this.speed.y > 0) {
                this.speed.y -= this.drag * dt;
                if (this.speed.y <= 0) this.speed.y = 0;
            }
            else if (this.speed.y < 0) {
                this.speed.y += this.drag * dt;
                if (this.speed.y >= 0) this.speed.y = 0;
            }
        }
        else {
            this.speed.y += (this.directiony > 0 ? 1 : -1) * this.drag * dt;
            if (Math.abs(this.speed.y) > this.maxSpeed.y) {
                this.speed.y = this.speed.y > 0 ? this.maxSpeed.y : -this.maxSpeed.y;
            }
        }

        if(this.speed.y !== 0 || this.speed.x !== 0 ){
			//console.log("IDDDDDDDDDDDDDDDDDDDDDD"+this.id);
            this.stompClient.send('/room.' + this.room + '/movement', {}, JSON.stringify({id: this.id, ps: this.node.position, rt: this.node.rotation}));
        }

        if(this.collisionY < 0){
            if(this.speed.y>0){
                this.node.y += this.speed.y * dt;
            }
        }else if(this.collisionY > 0){
            if(this.speed.y<0){
                this.node.y += this.speed.y * dt;
            }
        }else{
            this.node.y += this.speed.y * dt;
        }

        if(this.collisionX < 0){
            if(this.speed.x>0){
                this.node.x += this.speed.x * dt;
            }
        }else if(this.collisionX > 0){
            if(this.speed.x<0){
                this.node.x += this.speed.x * dt;
            }
        }else{
            this.node.x += this.speed.x * dt;
        }


    },



    onTouchBegan: function (event) {
		//console.log(cc.director.getScene());
		//console.log(this.ammo);
        if(!this.isDead && this.ammo>0){
            var touchLoc = event.touch.getLocation();
            //this.bullet = cc.instantiate(this.bullet);
            //this.stompClient.send("/room/newshot", {}, JSON.stringify({ id: this.id, "touchLocX": touchLoc.x, "touchLocY": touchLoc.y, "bulletP":this.bullet.position, "bulletX":this.bullet.getComponent('Bullet').targetX, "bulletY":this.bullet.getComponent('Bullet').targetY, "bulletActive":this.bullet.active}));
            cc.log(this.node.position);
			
            this.stompClient.send('/room.' + this.room + '/newshot', {}, JSON.stringify({ id: this.id, "touchLocX": touchLoc.x, "touchLocY": touchLoc.y, "position": this.node.position}));
			this.ammo-=1;
			this.ammoBar.string = this.ammo;
        }
   

    },

	onShootBegan: function(other){
		this.health -= 20;
        this.healthBar.progress = this.health/100;
		if (this.health<=0){

			this.die();
			
			//this.stompCliend.send('/app/room.'+this.room + '/newdead',{}, JSON.stringify({Bullet.Shooter}));    
		}
		this.node.color = cc.Color.WHITE;
		
	},


	die : function () {
				
				alert("You have died!");
                this.isDead = true;
                this.node.destroy();
				cc.director.loadScene("menu");
	},



    addBulletToScene: function (bulletEvent,bullet, idd) {
		
		
			var numX = bulletEvent.touchLocX - bulletEvent.position.x;
			var numY = bulletEvent.touchLocY - bulletEvent.position.y;
			var radio = 90;
			var sumDir = Math.abs(numX) + Math.abs(numY);
			
			var perX = numX/sumDir;
			var perY = numY/sumDir;
			
			var scene = cc.director.getScene();

			var bullet = cc.instantiate(bullet);
			
			bullet.x= bulletEvent.position.x + (radio*perX);
			bullet.y= bulletEvent.position.y + (radio*perY);
			
/*
			if (numX>=0 && numY>=0){
				bullet.x= bulletEvent.position.x + (radio*perX);
				bullet.y= bulletEvent.position.y + (radio*perY);
			}
			else if(numX>=0 && numY<0){
				bullet.x= bulletEvent.position.x + (radio*perX);
				bullet.y= bulletEvent.position.y-(radio*perY);
			}
			else if(numX<0 && numY>=0){
				bullet.x= bulletEvent.position.x - (radio*perX);
				bullet.y= bulletEvent.position.y + (radio*perY);
			}
			else if(numX<0 && numY<0){
				bullet.x= bulletEvent.position.x - (radio*perX);
				bullet.y= bulletEvent.position.y - (radio*perY);
			}
			
			*/

			bullet.getComponent('Bullet').targetX = numX ;
			bullet.getComponent('Bullet').targetY = numY;
			bullet.getComponent('Bullet').idBullet = idd;
            //console.log("BULLEEEET: " + bullet.getComponent("Bullet").idBullet);
			
			scene.addChild(bullet);
			bullet.active = true;
			
			
    },


	
    registerInServer: function(){
        
        //axios.put
    },

    connectAndSubscribe: function(){
		//PARA PROBARLO LOCALMENTE:

        //var socket = new SockJS('http://localhost:8080//stompendpoint');
        
		//PARA CONSTRUIRLO 
		//socket = new SockJS('/stompendpoint');
		
		var self = this;
		
		getStompClient()
			.then((stpClient) => {
				self.stompClient = stpClient;
				subscribeTopic(self.stompClient, "/room." + self.room + "/movement", function(eventBody){
					var move = JSON.parse(eventBody.body);
					
					//console.log("ID: "+move.id+" PS: "+move.ps)
					
					self.loadedPlayers.forEach(
						function(player){
							console.log("MOVE ID: "+move.id+"="+player.id+"?--------------------------------->X: "+move.ps.x+" Y: "+move.ps.y);
							if(move.id == player.id && player.id != self.id){
								
								player.position = move.ps;
								player.rotation = move.rt;
							}
						}
					);
					
				});
				subscribeTopic(self.stompClient, "/room." + self.room + "/newshot", function(eventBody){
					var bulletEvent = JSON.parse(eventBody.body);
                    self.addBullet(bulletEvent,self.bullet,self.id);
                    console.log("bullet new shot");
				});
				subscribeTopic(self.stompClient, "/room." + self.room + "/newdead", function(eventBody){
					var deadEvent = JSON.parse(eventBody.body);
					self.die();
				});
			});

    },
	
	loadAllPlayers: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				//console.log("DATA: "+JSON.stringify(response));
				var cont = 2;
				response.data.forEach(
					function(player){
						if(player.id != self.id){
							var plr = cc.instantiate(cc.find("p2"));
							self.loadedPlayers.push(plr);
							
							//console.log("ID: "+player.id+", players: "+self.loadedPlayers.length);
							cc.director.getScene().addChild(plr);
							
							plr.x = self.position.x;
							plr.y = self.position.y + (cont*10);
							plr.id = player.id;
							
							cont++;
							plr.active = true;
						}
						
					}
				);
				
			},
			onFailed: function(error){
				console.log(error);
			}
		};
		getRoomPlayers(self.room, callback);
	},
	


});
