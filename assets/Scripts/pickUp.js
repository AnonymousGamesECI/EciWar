
cc.Class({
    extends: cc.Component,

    properties: {
		time: {
            default: 5
        }
    },


    onLoad: function () {
		this.x = this.node.position.x;
		this.y = this.node.position.y
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
				this.time = 5;
				//this.node.active = true;
				//this.node.position.x = this.x;
				//this.node.position.y = this.y;
			}
        }
	},

    onCollisionEnter: function (other, self) {
        if(other.node.name != "Bullet"){
			this.node.destroy();
            //this.node.position.x = 0;
			//this.node.position.y = 0;
			this.counting = true;	
        }

    },
});
