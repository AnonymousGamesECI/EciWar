import { getStompClient, subscribeTopic, unsubscribe } from './StompHandler.js';
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
		xPos:null,
		yPos:null,
		stompClient:null,
		player: {
            default: null,
            type: cc.Node,
		},
		
		url: cc.AudioClip,
		url2: cc.AudioClip,
		soundtrack: cc.AudioClip,
		
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
		this.id = Math.floor(Math.random()*10000000);
		this.xPos = Math.floor(Math.random()*1000);
		this.yPos = Math.floor(Math.random()*600);
				
	},

	start: function(){
		//cc.audioEngine.stopAll();
		cc.audioEngine.play(this.soundtrack);

	},

	EditBoxDidEndEditing: function(sender) {
		
		this.username = this.inputName.string;
		//this.room = this.inputRoom.string;
		//console.log("ROOOM: " + this.room);
    },
	
	beginOrWait: function(){
		var self = this;
		var callback = {
			onSuccess: function(response){
				if(response.data.length >= 3){
					self.stompClient.send("/app/start/" + self.room, {}, null);
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
				cc.audioEngine.playEffect(self.url);
			},
			onFailed: function(error){
				cc.audioEngine.playEffect(self.url2);
				alert("Room " + self.room + " game has already started ");
			}
		};
		joinRoom(self.id, self.xPos, self.yPos, self.room, callback);
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
				subscribeTopic(self.stompClient, "/topic/room-start-" + self.room, function(eventBody){
					
					//console.log(eventBody.body);
					cc.director.loadScene("game", function(){
						self.node.active = false;
					});
				});
				self.createOrJoin();
			});
			
				
        }

	},
	
	setRoom: function(event, roomId){
		console.log(roomId);
		this.room = roomId;
	}

});
