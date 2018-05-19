// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
            item:{
                default:null,
                type: cc.Node,
            },
            label:{
                default:null,
                type: cc.Label,
            },
            content:{
                default:null,
                type: cc.Node,
            },
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.posY = -51;
        this.roomNumber = 1;

    },

    buttonClicked: function() {
        if(this.roomNumber < 7){
            var it = cc.instantiate(this.item);
            it.y += this.posY;
            this.roomNumber+=1;
            it.getComponent(cc.Label).string = "Room #" + this.roomNumber;
            it.getChildByName("New Button").getComponent(cc.Button).clickEvents[0].customEventData = this.roomNumber;
            //this.label.string = "vfdvd";
            //console.log("sdfsdf" + st.string);
            this.content.addChild(it);
            this.posY -=51;
        }else{
            alert("Maximun room capacity.");

        }

	},

    // update (dt) {},
});
