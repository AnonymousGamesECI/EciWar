cc.Class({
    extends: cc.Component,

    properties: {
        speed: 2000,
        targetX: 0,
        targetY: 0,
        idBullet: 0,
		shooter: {
            default: null,
            type: cc.Node,
        },
		firingAudio: {
            default: null,
            url: cc.AudioClip
        },
		damage: 0,
		
    },

    onLoad: function () {
		cc.audioEngine.playEffect(this.firingAudio, false);
    },

    onCollisionEnter: function (other, self) {
        if (other.node.name != "Kit" && other.node.name != "Ammo"){
            this.node.destroy();
        }

    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        var angle = Math.atan2(this.targetX, this.targetY);
        this.node.x += this.speed * dt * Math.sin(angle);
        this.node.y += this.speed * dt * Math.cos(angle);
    },


	
});
