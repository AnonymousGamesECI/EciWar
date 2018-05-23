
cc.Class({
    extends: cc.Component,

    properties: {
		
    },



    onCollisionEnter: function (other) {
        if(other.node.name == "Player"){
			this.node.destroy();
        }

    },
});
