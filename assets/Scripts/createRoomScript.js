
import { getStompClient, subscribeTopic} from './StompHandler.js';
import { createRoom } from './RestController.js';
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
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.stompClient = null;
        this.connectAndSubscribe();
    },

    start () {
        this.posY = -51;
        this.roomNumber = null;
        var self = this;
        axios.get("/rooms")
            .then(function(response){
                self.roomNumber = response.data;
                //console.log("ROOMZASOS: " + self.roomNumber);
                var i;
                for(i = 0; i < self.roomNumber;i++){
                    //console.log( "index: " + self.roomNumber);
                    self.showRoomItem(i+1);
                }
            });
        
        

    },

    buttonClicked: function() {
        if(this.roomNumber < 7){
            this.createRoomItem();
            
        }else{
            alert("Maximun room capacity.");

        }
        

    },

    createRoomItem: function(){
            //this.roomNumber+=1;
            var self = this;
            var callback = {
                onSuccess: function(){
                    console.log("ROOMMMMMMM--"+ (self.roomNumber + 1) +"--CREATED SUCCESFULLY");
                    self.stompClient.send('/topic/menu-newroom', {}, JSON.stringify({}));
                },
                onFailed: function(error){
                    alert("An error has ocurred creating the room " + (self.roomNumber+1))
                    console.log(error);
                }
            };
            createRoom((this.roomNumber+1), callback);
        
    },

    showRoomItem: function(num){
        
        var it = cc.instantiate(this.item);
        it.y += this.posY;
        
        it.getComponent(cc.Label).string = "Room #" + num;
        it.getChildByName("New Button").getComponent(cc.Button).clickEvents[0].customEventData = num;
        //this.label.string = "vfdvd";
        //console.log("sdfsdf" + st.string);
        this.content.addChild(it);
        this.posY -=51;
    
},
    
    connectAndSubscribe: function(){
		//PARA PROBARLO LOCALMENTE:

        //var socket = new SockJS('http://localhost:8080//stompendpoint');
        
		//PARA CONSTRUIRLO 
		//socket = new SockJS('/stompendpoint');
		
		var self = this;
		
		getStompClient()
			.then((stpClient) => {
				self.stompClient = stpClient;
				subscribeTopic(self.stompClient, "/topic/menu-newroom" , function(eventBody){
                    self.roomNumber +=1;
                    //var move = JSON.parse(eventBody.body);
                    self.showRoomItem(self.roomNumber);
					
				});
                
                
			});

    },

    // update (dt) {},
});
