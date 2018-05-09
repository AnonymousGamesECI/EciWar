export function getStompClient() {
	//Scalability app CloudAmqp configuration
	return new Promise((resolve) => {
		var socket = new SockJS("/stompendpoint");
		var stompClient = Stomp.over(socket);
		stompClient.connect("tkownfax", "UJ4YP9jVSniRrhGMVLdMev0EOY6EphFa",
			function(frame) {
				resolve(stompClient);
			}
			,
			function(error){
				console.info("error: " + error);
			}
			, "tkownfax");
	});
};

export function subscribeTopic(stompClient, room, callback) {
	stompClient.subscribe(room, callback);
};
