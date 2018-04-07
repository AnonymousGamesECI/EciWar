
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
        player2: {
            default : null,
            type: cc.Node,
        },
        healthBar: {
            default : null,
            type: cc.ProgressBar,
        },
		ammoBar:{
			default: null,
			type:cc.ProgressBar,
		},
		usernameLabel: {
		    default: null,
		    type: cc.Label,
		}

    },

    // use this for initialization
    onLoad: function () {
        //private variables declaration
        this.isDead = false;
        this.health = 100;
		this.ammo=10;
        this.stompClient = null;
        this.pi = 3.141516;
        this.id = Math.floor(Math.random()*10000000);
        //console.log(cc.find("form").getComponent("MenuController").username);
        this.username = cc.find("form").getComponent("MenuController").username;
        this.room = cc.find("form").getComponent("MenuController").room;
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

        if(other.node.name == "Bullet" ){
            //console.log("this id: " + this.id + "   bulletId: " + other.node.getComponent('Bullet').idBullet );
            this.onShootBegan(other);
        
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
			this.ammo+=6;
			this.ammoBar.progress = this.ammo/50;			
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
		
		console.log(this.ammo);
        if(!this.isDead && this.ammo>0){
            var touchLoc = event.touch.getLocation();
            //this.bullet = cc.instantiate(this.bullet);
            //this.stompClient.send("/room/newshot", {}, JSON.stringify({ id: this.id, "touchLocX": touchLoc.x, "touchLocY": touchLoc.y, "bulletP":this.bullet.position, "bulletX":this.bullet.getComponent('Bullet').targetX, "bulletY":this.bullet.getComponent('Bullet').targetY, "bulletActive":this.bullet.active}));
            cc.log(this.node.position);
			
            this.stompClient.send('/room.' + this.room + '/newshot', {}, JSON.stringify({ id: this.id, "touchLocX": touchLoc.x, "touchLocY": touchLoc.y, "position": this.node.position}));
			this.ammo-=1;
			this.ammoBar.progress = this.ammo/50;
        }
   

    },

	onShootBegan: function(other){
		this.health -= 10;
        this.healthBar.progress = this.health/100;
		if (this.health<=0){

			this.die();
			//this.stompCliend.send('/app/room.'+this.room + '/newdead',{}, JSON.stringify({Bullet.Shooter}));    
		}
	},


	die : function () {
				
				alert("You have died!");
                this.isDead = true;
                this.node.color = cc.Color.RED;
				this.active=false;
	},



    addBulletToScene: function (bulletEvent,bullet, idd) {
		
			var scene = cc.director.getScene();

			var bullet = cc.instantiate(bullet);

			bullet.x = bulletEvent.position.x;
			bullet.y = bulletEvent.position.y;
			bullet.getComponent('Bullet').targetX = bulletEvent.touchLocX - bulletEvent.position.x;
			bullet.getComponent('Bullet').targetY = bulletEvent.touchLocY - bulletEvent.position.y;
			bullet.getComponent('Bullet').idBullet = idd;
            //console.log("BULLEEEET: " + bullet.getComponent("Bullet").idBullet);
			bullet.active = true;
			scene.addChild(bullet);
			
			
    },

    registerInServer: function(){
        
        //axios.put
    },

    connectAndSubscribe: function(){
		//PARA PROBARLO LOCALMENTE:

        //var socket = new SockJS('http://localhost:8080//stompendpoint');
        
		//PARA CONSTRUIRLO 
		var socket = new SockJS('/stompendpoint');
		
		
		cc.log('Connecting to WS....');
        this.stompClient = Stomp.over(socket);
        //console.log(this.stompClient);
        var tempStompClient = this.stompClient;
		
		var position = this.position;
		var rotation = this.rotation;
		var addBullet = this.addBullet;
		var bull = this.bullet;
		//cc.log(addBullet);
		
        var p2 = this.player2;
        var idd = this.id;
        var rm = this.room
        this.stompClient.connect({}, function (frame) {
               console.log('Connected: ' + frame);
               var subscriptionPoint = tempStompClient.subscribe('/room.' + rm + '/movement', function (eventbody) {

                   var move = JSON.parse(eventbody.body);
                   if(idd != move.id ){
                       p2.position = move.ps;
                       p2.rotation = move.rt;
                   }
               });

               var subscriptionPoint = tempStompClient.subscribe('/room.' + rm + '/newshot', function (eventbody) {
                   var bulletEvent = JSON.parse(eventbody.body);
                   addBullet(bulletEvent,bull,idd);
                   console.log("bullet new shot");
                   
               });

			  var subscriptionPoint = tempStompClient.subscribe('/room.' + rm + '/newdead', function(eventbody){
					var deadEvent = JSON.parse(eventbody.body);
					die();
			  });
               
        });

    }


});
