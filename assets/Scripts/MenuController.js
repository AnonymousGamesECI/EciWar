import { getStompClient, subscribeTopic } from './StompHandler.js';
import { getRoomPlayers, joinRoom, createRoom } from './RestController.js';
var menu = cc.Class({
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
		this.username = this.inputName.string;
		this.room = this.inputRoom.string;
    },
	
	onChangedScene: function(username, room){
		console.log(username);
		console.log(room);
		this.node.active = false;
	},
	
	beginOrWait: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				if(response.data.length >= 2){
					cc.director.loadScene("game", self.onChangedScene(self.username, self.room));
				}
				else(
					alert("The game starts until there are at least 2 participants")
				)
			},
			onFailed: function(error){
				console.log(error);
			}
		};
		getRoomPlayers(self.room, callback);
	},
	
	loadScene: function(){
		var self = this;
		var callback = {
			onSuccess: function(){
				self.beginOrWait();
			},
			onFailed: function(error){
				console.log(error);
			}
		};
		joinRoom(Math.floor(Math.random()*10000000), self.room, callback);
	},
	
	joinThisRoom: function(){
		var self = this;
		var callback = {
			onSuccess: function(){
				self.loadScene();
			},
			onFailed: function(error){
				console.log(error);
			}
		};
		createRoom(self.room, callback);
	},
	
	createOrJoin: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				self.loadScene();
			},
			onFailed: function(error){				
				self.joinThisRoom();
			}
		};
		getRoomPlayers(self.room, callback);
	},
	
	
	
	buttonClicked: function() {
		var self = this;
	    if(self.username == null || self.username == ""){
            alert("Please enter a username");
        }else if(self.room == null || self.room == ""){
            alert("Please enter a room number");
        }else{
			self.createOrJoin();  
        }

    },

});
