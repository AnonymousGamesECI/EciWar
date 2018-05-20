
cc.Class({
    extends: cc.Component,

    properties: {
		lado:{
			default:0,
			type: cc.Integer,
		},
		rooty: {
            default: null,
            type: cc.Node,
        },
		camarina: {
            default: null,
            type: cc.Node,
        },
		player:{
			default:null,
			type:cc.Node,
		},
		
    },

	    
    onCollisionEnter: function (other) {
		
		if (other.node.name=="Player"){
			
			if (this.lado==1){
				
				cc.find("root").position= cc.p({x:this.rooty.position.x, y: this.rooty.position.y-360});	
				other.node.position = cc.p({x:other.node.position.x, y: 360});
				other.getComponent('HeroControl').multiY+=1;
				
			}
			else if (this.lado==2){
			
				cc.find("root").position= cc.p({x: this.rooty.position.x-640, y: this.rooty.position.y});
				other.node.position = cc.p({x:640, y: other.node.position.y});		
				other.getComponent('HeroControl').multiX+=1;	
			}
			else if(this.lado==3){
		
				cc.find("root").position= cc.p({x: this.rooty.position.x, y: this.rooty.position.y+360});	
				other.node.position=cc.p({x:other.node.position.x, y: 360});
				other.position = cc.p({x:other.node.position.x, y: 0});
				other.getComponent('HeroControl').multiY-=1;
			}
			else if(this.lado==4){
				cc.find("root").position= cc.p({x: this.rooty.position.x+640, y: this.rooty.position.y});	
				other.node.position = cc.p({x:640, y: other.node.position.y});		
				
				other.getComponent('HeroControl').multiX-=1;
			}
			
			
		}
    },
});
