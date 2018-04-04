cc.Class({
    extends: cc.Component,

    properties: {
		username: null,
        inputName: {
            default: null,
            type: cc.EditBox,
        },
        inputRoom: {
            default: null,
            type: cc.EditBox,
        },
		sendButton: {
			default: null,
			type: cc.Node
		},
		username: null,
		room: null,
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
	},

	EditBoxDidEndEditing: function(sender) {
		//console.log(sender.node.name);
		this.username = this.inputName.string;
		this.room = this.inputRoom.string;
		//console.log(" test : " + this.username);
		//console.log(" test : " + this.room);
    },
	
	onChangedScene: function(username, room){
		console.log(username);
		console.log(room);
		this.node.active = false;
	},
	
	buttonClicked: function() {
	    if(this.username == null || this.username == ""){
            alert("Please enter a username");
        }else if(this.room == null || this.room == ""){
            alert("Please enter a room number");
        }else{
            cc.director.loadScene("game", this.onChangedScene(this.username, this.room));
        }

    }
});
