cc.Class({
    extends: cc.Component,

    properties: {
        speed: 2000,
        targetX: 0,
        targetY: 0
    },

    // use this for initialization
    onLoad: function () {
        /*this.target.x = x;
        this.target.y = y;*/
        //cc.log("X:  " + this.targetX);
        //cc.log("Y:  " + this.targetY);
    },

    onCollisionEnter: function (other, self) {
        if (other.node.name != "Kit"){
            this.node.destroy();
        }

    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        var angle = Math.atan2(this.targetX, this.targetY);
        //cc.log("allalala:  " + this.targetX);
        this.node.x += this.speed * dt * Math.sin(angle);
        this.node.y += this.speed * dt * Math.cos(angle);
        //this.node.x += this.speed *
    },
});
