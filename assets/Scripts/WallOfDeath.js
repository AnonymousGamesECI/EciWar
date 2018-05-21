
cc.Class({
    extends: cc.Component,

    properties: {
		time: {
            default: 10
        },
		onMovement:false,
		lado:{
			default:0,
			type: cc.Integer,
		},
		avance:0,
    },


    onLoad: function () {
		
		this.counting = true;
        this.repeat = false;
		this.onMovement=false;
		this.avance=0;
    },
	
	update: function (dt){
		if (this.counting) {
			if(this.time > 0){
				this.time -= dt;
			}
			else{
				this.counting = false;
				this.onMovement = true;
				this.time = 10;
			}
        }
		if (this.onMovement){
			if(this.lado==1 ){
				if(this.avance<300){
					this.x+=5;
					this.avance+=5;
				}
				else{
					this.onMovement=false;
					this.avance=0;
				}
			}
			else{
				if(this.avance<300){
					this.x-=5;
					this.avance+=5;
				}
				else{
					this.onMovement=false;
					this.avance=0;
				}
			}
				
				
		}
	},

    onCollisionEnter: function (other, self) {
        if(other.node.name=="Player"){
			other.getComponent('HeroControl').onWallOfDeath();
			this.counting = true;
			this.node.getComponent(cc.Sprite).enabled = false;
			this.node.getComponent(cc.BoxCollider).enabled = false;
        }

    },
});
