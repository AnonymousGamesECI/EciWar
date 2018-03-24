
cc.Class({
    extends: cc.Component,

    properties: {
        speed: cc.v2(0, 0),
        maxSpeed: cc.v2(400, 400),
        drag: 1000,
        direction: 0,
        directiony: 0,
        jumpSpeed: 0,
        bullet: {
            default: null,
            type: cc.Node,
        },
        player2: {
            default : null,
            type: cc.Node,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.stompClient = null;
        this.pi = 3.141516;
        this.id = Math.floor(Math.random()*10000000);
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        var canvas = cc.find('Canvas');
        canvas.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);

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
        cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    },
    
    onKeyPressed: function (keyCode, event) {
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
        this.node.color = cc.Color.RED;

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
        
    },
    
    /*onCollisionStay: function (other, self) {
        if (this.collisionY === -1) {
            if (other.node.group === 'Platform') {
                var motion = other.node.getComponent('PlatformMotion');
                if (motion) {
                    this.node.x += motion._movedDiff;
                }
            }

            // this.node.y = other.world.aabb.yMax;

            // var offset = cc.v2(other.world.aabb.x - other.world.preAabb.x, 0);
            
            // var temp = cc.affineTransformClone(self.world.transform);
            // temp.tx = temp.ty = 0;
            
            // offset = cc.pointApplyAffineTransform(offset, temp);
            // this.node.x += offset.x;
        }
    },*/
    
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

        if(this.speed.y !== 0 || this.speed.x !== 0){
            this.stompClient.send("/topic/newpoint", {}, JSON.stringify({id: this.id, ps: this.node.position, rt: this.node.rotation}));
        }

        /*if (this.speed.x * this.collisionX > 0) {
            this.speed.x = 0;
        }
        if (this.speed.y * this.collisionY > 0) {
            this.speed.y = 0;
        }*/

        
        this.prePosition.x = this.node.x;
        this.prePosition.y = this.node.y;

        this.preStep.x = this.speed.x * dt;
        this.preStep.y = this.speed.y * dt;
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

        var scene = cc.director.getScene();
        var touchLoc = event.touch.getLocation();
        var bullet = cc.instantiate(this.bullet);
        bullet.position = this.node.position;
        bullet.getComponent('Bullet').targetX = touchLoc.x - this.node.position.x;
        bullet.getComponent('Bullet').targetY = touchLoc.y - this.node.position.y;
        //bullet.src.targetX = touchLoc.y;
        //cc.log("AAAAAAAA: " + touchLoc.x + "BBBBBBB: " + touchLoc.y);
        bullet.active = true;
        scene.addChild(bullet);

    },

    connectAndSubscribe: function(){
        var socket = new SockJS('http://localhost:8080//stompendpoint');
        cc.log('Connecting to WS....');
        this.stompClient = Stomp.over(socket);
        //console.log(this.stompClient);
        var tempStompClient = this.stompClient;
        var p2 = this.player2;
        var idd = this.id;
        this.stompClient.connect({}, function (frame) {
               console.log('Connected: ' + frame);
               var subscriptionPoint = tempStompClient.subscribe('/topic/newpoint', function (eventbody) {
                    var obj = JSON.parse(eventbody.body);
                    if(obj.id !== idd){
                        //console.log("RECIEVED: " + obj);
                        p2.position = obj.ps;
                        p2.rotation = obj.rt;
                    }

                    //alert("jodeeeer");

                /*var point = eventbody.body;
                var theObject=JSON.parse(eventbody.body);
                //alert(theObject);
                addPointToCanvas(theObject);
               });
               console.log('Connected: ' + frame);
                          subscriptionPolygon = stompClient.subscribe('/topic/newpolygon.' + number, function (eventbody) {
                          var points = JSON.parse(eventbody.body);
                          console.log("points: " + points);
                          var ctx = canvas.getContext('2d');
                          ctx.fillStyle="#000000";
                          ctx.beginPath();
                          ctx.moveTo(points[0].x, points[0].y);
                          ctx.lineTo(points[1].x,points[1].y);
                          ctx.lineTo(points[2].x, points[2].y);
                          ctx.lineTo(points[3].x, points[3].y);
                          ctx.lineTo(points[0].x, points[0].y);
                          ctx.closePath();
                          ctx.fill();*/
               });
        });

    }


});
