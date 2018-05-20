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
	stompClient.subscribe(room, callback);
};
