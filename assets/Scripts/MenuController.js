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
		id:null,
		stompClient:null,
		player: {
            default: null,
            type: cc.Node,
        },
		
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
		this.id = Math.floor(Math.random()*10000000);
		this.prueba = 34;
		this.prueba2 = 31;
		this.prueba3 = {abs:adsdsa}
		
	},

	EditBoxDidEndEditing: function(sender) {
		this.username = this.inputName.string;
		this.room = this.inputRoom.string;
    },
	
	beginOrWait: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				if(response.data.length >= 3){
					self.stompClient.send("/room/start." + self.room, {}, JSON.stringify({playersLoaded:response.data}));
				}
				else{
					cc.director.loadScene("waitingScreen", function(){
						self.node.active = false;
					});
				}
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
		joinRoom(self.id, self.room, callback);
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
			getStompClient()
			.then((stpClient) => {
				self.stompClient = stpClient;
				subscribeTopic(self.stompClient, "/room/start." +  self.room, function(eventBody){
					cc.director.loadScene("game", function(){
						self.node.active = false;
					});
				});
				self.createOrJoin();
			});
			
				
        }

    },

});
