
cc.Class({
    extends: cc.Component,

    properties: {
		
    },



    onCollisionEnter: function (other, self) {
        if(other.node.name != "Bullet"){
			this.node.destroy();
        }

    },
});
