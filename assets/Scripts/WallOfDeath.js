
cc.Class({
    extends: cc.Component,

    properties: {
		time: {
            default: 10
        },
		onMovement:false,
		m1:{
			default:null,
			type: cc.Node,
		},
		m2:{
			default:null,
			type: cc.Node,
		},
		m3:{
			default:null,
			type: cc.Node,
		},
		m4:{
			default:null,
			type: cc.Node,
		},
		m4:{
			default:null,
			type: cc.Node,
		},
		m5:{
			default:null,
			type: cc.Node,
		},
		m6:{
			default:null,
			type: cc.Node,
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
			
			if(this.avance<400){
				this.m1.position.x+=5;
				this.m2.position.x+=5;
				this.m3.position.x+=5;
				this.m4.position.x-=5;
				this.m5.position.x-=5;
				this.m6.position.x-=5;
				this.avance+=5;
			}
			else{
				this.onMovement=false;
				this.avance=0;
				this.node.destroy();
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
