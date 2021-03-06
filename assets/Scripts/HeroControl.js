import { getStompClient, subscribeTopic, getStompClientsSize, unsubscribeTopic} from './StompHandler.js';
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
		kills:0,
        bullet: {
            default: null,
            type: cc.Node,
        },
        loadedPlayers: {
            default : [],
            type: [cc.Node],
        },
		killsLabel: {
			default : null,
			type: cc.Label,
		},
		leftPlayersLabel: {
			default : null,
			type: cc.Label,
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
		muerte:{
			default:null,
			type: cc.Node,
        },
		enemy:{
			default:null,
			type: cc.Node,
        },
        disparo: cc.AudioClip,
        dolor: cc.AudioClip,
        noBalas: cc.AudioClip,
		player:{
			default:null,
			type:cc.Node,
		},
		pain:{
			default:null,
			type:cc.Node,
		},
		realPosition:cc.p({x:0, y:0}),
		multiX:0,
		multiY:0,
		
    },
	    onLoad: function () {

			cc.audioEngine.stopAll();
			//private variables declaration
			this.room = cc.find("form").getComponent("MenuController").room;
			this.username = cc.find("form").getComponent("MenuController").username;
			this.id = cc.find("form").getComponent("MenuController").id;
			var canvas = cc.find("Camera");
			this.node.position=cc.p({x:640, y:360});
			this.realPosition=cc.p({x:640, y:360});
			this.position = cc.p({x:0, y:0});
			this.player.rotation = this.node.rotation;
			/*this.node.x = cc.find("form").getComponent("MenuController").xPos;
			this.node.y = cc.find("form").getComponent("MenuController").yPos;*/
			this.isDead = false;
			this.health = 100;
			this.ammo=100;
			this.stompClient = null;
			this.pi = 3.141516;
			
			this.players = null;
			
			this.usernameLabel.string = this.username;
			
			this.killsLabel.string = this.kills;
       
 
			cc.director.getCollisionManager().enabled = true;
			cc.director.getCollisionManager().enabledDebugDraw = false;
			
			canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
			
			
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
                    break;
                case cc.KEY.s:
                case cc.KEY.down:
                    this.directiony = -1;
                    break;
            }
        }

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
        var diff =  {
                    'x' : n - this.node.position.x,
                    'y': m - this.node.position.y
                    };
        var angle = Math.atan2(diff.x, diff.y);
        this.node.rotation = angle * (180/this.pi);

    },

    onCollisionEnter: function (other, self) {
		
        if(other.node.name == "Bullet"){
            console.log(other.node.getComponent('Bullet').idBullet);
			console.log(other.node.getComponent('Bullet').shooter);
			this.onShootBegan(other);
			this.node.color = cc.Color.RED;
			
	
			
			
        
        }else if(other.node.name == "Wall" || other.node.name == "p2"|| other.node.name == "CameraZone"){
            
			
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
                this.health += 50;
            }
            this.healthBar.progress = this.health/100;
        }else if (other.node.name== "Ammo"){
			this.ammo+=15;
			
			this.ammoBar.string = this.ammo;			
		}else if (other.node.name=="Death"){
			this.ammo+=30;
			this.ammoBar.string = this.ammo;
			this.health+=40;
			this.healthBar.progress = this.health/100;
		}
		
		
		this.node.color= cc.Color.WHITE;
		
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
		var n1 = this.node.position.x+(640*this.multiX);
		var n2 = this.node.position.y+(360*this.multiY);
		this.realPosition=cc.p({x:n1, y:n2});
		if(this.speed.y !== 0 || this.speed.x !== 0 ){
            this.stompClient.send('/app/movement/' + this.room , {}, JSON.stringify( {
																		id: this.id,
																		position: this.realPosition,
																		rotation: this.node.rotation
																	}));
        }
    },



    onTouchBegan: function (event) {
        
        if(!this.isDead && this.ammo>0){
			cc.audioEngine.playEffect(this.disparo);
            var touchLoc = event.touch.getLocation();	
			
			
			var self = this;
			
			var numX = touchLoc.X+(640*this.multiX)- this.realPosition.x;
			var numY = touchLoc.Y-(360*this.multiY) - this.realPosition.y;
			var radio = 98;
			var sumDir = Math.abs(numX) + Math.abs(numY);
			
			var perX = numX/sumDir;
			var perY = numY/sumDir;
			

			var scene = cc.find("root");

			var bullet = cc.instantiate(this.bullet);
			
			bullet.x= this.node.position.x + (radio*perX);
			bullet.y= this.node.position.y + (radio*perY);
			bullet.getComponent('Bullet').targetX = numX;
			bullet.getComponent('Bullet').targetY = numY;
			bullet.getComponent('Bullet').idBullet = this.id;

			scene.addChild(bullet);
			bullet.active = true;
			
			
			
			
			
						
            this.stompClient.send('/app/newshot/' + this.room, {}, JSON.stringify({
																					idShooter: this.id,
																					"touchLocX": touchLoc.x+(640*this.multiX),
																					"touchLocY": touchLoc.y+(360*this.multiY),
																					"position": this.realPosition
																					}));
			this.ammo-=1;
			this.ammoBar.string = this.ammo;
        }else if(this.ammo == 0){
            cc.audioEngine.playEffect(this.noBalas);
        }
   

    },

	onShootBegan: function(other){
		var self = this;
		this.health -= 20;
        this.healthBar.progress = this.health/100;
		var pain = cc.instantiate(this.pain);
		cc.director.getScene().addChild(pain);
		//cc.audioEngine.playEffect(this.dolor);
		pain.active=true;
		var idShooter = other.node.getComponent('Bullet').idBullet;
		
		if (this.health==0){
			axios.put('/rooms/' + this.room + '/players/remove', {id : self.id})
			.then(function(){
				axios.get('/rooms/'+self.room+'/players')
				.then(function(response){
					if(response.data.length == 1){
						self.stompClient.send('/app/winner/' + self.room, {}, JSON.stringify({id: idShooter}));
					}
				});
				self.stompClient.send('/app/newdeath/' + self.room,{}, JSON.stringify({id : self.id})); 
				self.stompClient.send('/app/kill/' + self.room, {}, JSON.stringify({id: idShooter}));
			})
			.catch(function(error){
				console.log(error);
			});			 
		}
		this.node.color = cc.Color.WHITE;
		
	},


	die : function () {
		var self = this;
		alert("You have died!");
		this.isDead = true;
        this.node.active = false;
        //unsubscribe();
		cc.game.removePersistRootNode(cc.find('form'));
		cc.director.loadScene("menu", function(){
            
            console.log(cc.find('Player'));
            
		});
	},



    addBulletToScene: function (bulletEvent,bullet, idd) {
			
			var self = this;
			
			var numX = bulletEvent.touchLocX - bulletEvent.position.x;
			var numY = bulletEvent.touchLocY - bulletEvent.position.y;
			var radio = 50;
			var sumDir = Math.abs(numX) + Math.abs(numY);
			
			var perX = numX/sumDir;
			var perY = numY/sumDir;
			

			var scene = cc.find("root");

			var bullet = cc.instantiate(this.bullet);
			
			
			bullet.x= bulletEvent.position.x + (radio*perX);
			bullet.y= bulletEvent.position.y + (radio*perY);
			//}
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
			}*/
			
			

			bullet.getComponent('Bullet').targetX = numX;
			bullet.getComponent('Bullet').targetY = numY;
			bullet.getComponent('Bullet').idBullet = bulletEvent.idShooter;
			
			
			scene.addChild(bullet);
			bullet.active = true;
			
			
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
				subscribeTopic(self.stompClient, "/topic/room-movement-" + self.room, function(eventBody){
					var move = JSON.parse(eventBody.body);
				
					
					self.loadedPlayers.forEach(
						function(player){
							if(move.id == player.id && player.id != self.id){
								
								player.position = move.position;
								player.rotation = move.rotation;
							}
						}
					);
					
				});
				subscribeTopic(self.stompClient, "/topic/room-newshot-" + self.room, function(eventBody){
					var bulletEvent = JSON.parse(eventBody.body);
					
					if(bulletEvent.id != self.id){
						self.addBullet(bulletEvent,self.bullet,self.id);
						console.log("bullet new shot");
					}
					
                    
                    
				});
				
				subscribeTopic(self.stompClient, "/topic/room-newdeath-" + self.room, function(eventBody){
					var deathEvent = JSON.parse(eventBody.body);
					if(deathEvent.id != self.id){
						self.deletePlayer(deathEvent.id);
					}
					else{
                        
                        self.die();
                        unsubscribeTopic();
					}			
				});
				subscribeTopic(self.stompClient, "/topic/room-winner-" + self.room, function(eventBody){
					var winnerEvent = JSON.parse(eventBody.body);
					if(winnerEvent.id == self.id){
                        self.noticeWinner(winnerEvent.id);
                        unsubscribeTopic();
					}	
				});
				subscribeTopic(self.stompClient, "/topic/room-kill-" + self.room, function(eventBody){
					var killEvent = JSON.parse(eventBody.body);
					console.log(killEvent.id);
					console.log("***************************************************************************************");
					console.log(self.id);
					if(killEvent.id == self.id){
						self.kills ++;
						self.killsLabel.string = self.kills;
					}	
				});
			});

    },
	
	noticeWinner: function(id){
		var self = this;
		alert("YOU HAVE WON");
		this.node.active = false;
		cc.game.removePersistRootNode(cc.find('form'));
		axios.delete('/rooms/'+self.room)
		.then(function(){
			cc.director.loadScene("menu", function(){
                
				console.log("ya");
			});
		})
		
	},
	
	deletePlayer: function(id){
		
		
		
		
		var self = this;
		var tomb= cc.instantiate(this.muerte);
		self.loadedPlayers = self.loadedPlayers.filter(function( player ) {
			if(player.id==id){
				
				tomb.x= player.x;
				tomb.y= player.y;
				
				if(player.id == id){
					player.destroy();
				}
			}
			
			return player.id != id;
		});
		this.leftPlayersLabel.string = this.loadedPlayers.length;
		var scene = cc.find("root");
		scene.addChild(tomb);
		tomb.active=true;
		
	},
	
	loadAllPlayers: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				console.log(self.position);
				var cont = 2;
				response.data.forEach(
					function(player){
						if(player.id != self.id){
							
							var plr = cc.instantiate(self.enemy);
							self.loadedPlayers.push(plr);
							
							plr.x = player.x;
							plr.y = player.y;
							console.log(player.x + "," + player.y);
							plr.id = player.id;
							
							cont++;
							var scene= cc.find("root");
							scene.addChild(plr);
							plr.active = true;
							
							self.leftPlayersLabel.string = self.loadedPlayers.length;
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
	
	onWallOfDeath: function(){
		var self = this;
		this.health = 0;
        this.healthBar.progress = 0;
		var pain = cc.instantiate(this.pain);
		cc.director.getScene().addChild(pain);
		//cc.audioEngine.playEffect(this.dolor);
		pain.active=true;
		
		
		
		axios.put('/rooms/' + this.room + '/players/remove', {id : self.id})
		.then(function(){
			self.stompClient.send('/app/newdeath/' + self.room,{}, JSON.stringify({id : self.id})); 
		})
		.catch(function(error){
			console.log(error);
		});			 
		
		
		
	},
	
	


});
