cc.Class({
    extends: cc.Component,

    properties: {
		username: null,
        inputName: {
            default: null,
            type: cc.EditBox,
        },
		sendButton: {
			default: null,
			type: cc.Node
		}
    },

    onLoad: function () {
	},

	EditBoxDidEndEditing: function(sender) {
		//console.log(sender.node.name);
		this.username = this.inputName.string;
		//console.log(this.username);
    },
	
	onChangedScene: function(username){
		console.log(username);
	},
	
	buttonClicked: function() {
        cc.director.loadScene("game", this.onChangedScene(this.username));
    }
});
