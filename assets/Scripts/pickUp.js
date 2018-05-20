
cc.Class({
    extends: cc.Component,

    properties: {
		time: {
            default: 5
        }
    },


    onLoad: function () {
		this.x = this.node.position.x;
		this.y = this.node.position.y;
		this.counting = false;
        this.repeat = false;
    },
	
	update: function (dt){
		if (this.counting) {
			if(this.time > 0){
				this.time -= dt;
			}
			else{
				this.counting = false;
				this.node.getComponent(cc.Sprite).enabled = true;
				this.node.getComponent(cc.BoxCollider).enabled = true;
				this.time = 5;
			}
        }
	},

    onCollisionEnter: function (other, self) {
        if(other.node.name=="Player"){
			//this.node.destroy();
			this.counting = true;
			this.node.getComponent(cc.Sprite).enabled = false;
			this.node.getComponent(cc.BoxCollider).enabled = false;
        }

    },
});
