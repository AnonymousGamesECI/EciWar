var clients =[];

export function getStompClient() {
	//Scalability app CloudAmqp configuration
	return new Promise((resolve) => {
		var socket = new SockJS("/stompendpoint");
		var stompClient = Stomp.over(socket);
		stompClient.connect("yqbofqdf", "6CMzc5eiNjOdlv9cP9HpqFmHLK3KxUNS",
			function(frame) {
				resolve(stompClient);
			}
			,
			function(error){
				console.info("error: " + error);
			}
			, "yqbofqdf");
	});
};

export function subscribeTopic(stompClient, room, callback) {
	clients.push(stompClient.subscribe(room, callback));
};

export function getStompClientsSize(){
	console.log(clients);
	return clients.length;
}
export function unsubscribeTopic(){
	/*
	for(var cl in clients){
		console.log("ACTIVE CLIENTS-----------------");
		console.log(cl);
		cl.unsubscribe();
	}
	clients = [];*/
	//alert("USNUBSCRIBED SUCCESFULLY ---:  " + clients.length);
}
