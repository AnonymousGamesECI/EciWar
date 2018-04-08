import { getStompClient, subscribeTopic } from './StompHandler.js';
import { getRoomPlayers, joinRoom, createRoom } from './RestController.js';
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
		getStompClient()
		.then(function(stompClient){
			this.stompClient = stompClient;
		});
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
		var callback = {
			onSuccess: function(response){
				if(response.data.length >= 2){
					cc.director.loadScene("game", this.onChangedScene(this.username, this.room));
				}
				else(
					alert("The game starts until there are at least 2 participants")
				)
			},
			onFailed: function(error){
				console.log(error);
			}
		};
	},
	
	loadScene: function(){
		
		var callback = {
			onSuccess: function(){
				getRoomPlayers(this.room, this.beginOrWait());
			},
			onFailed: function(error){
				console.log(error);
			}
		};
	},
	
	joinThisRoom: function(){
		var callback = {
			onSuccess: function(){
				joinRoom(this.room, this.loadScene());
			},
			onFailed: function(error){
				console.log(error);
			}
		};
	},
	
	createOrJoin: function(){
		var callback = {
			onSuccess: function(response){
				joinRoom(this.room, this.loadScene());
			},
			onFailed: function(error){
				createRoom(this.room, this.joinThisRoom());
			}
		};
	},
	
	buttonClicked: function() {
	    if(this.username == null || this.username == ""){
            alert("Please enter a username");
        }else if(this.room == null || this.room == ""){
            alert("Please enter a room number");
        }else{
			getRoomPlayers(this.room, this.createOrJoin())   
        }

    },

});
