export function getStompClient() {
	return new Promise((resolve) => {
		//const socket = new SockJS("http://localhost:8080//stompendpoint");
		var socket = new SockJS("/stompendpoint");
		var stompClient = Stomp.over(socket);
		stompClient.connect({}, function(frame) {
			resolve(stompClient);
		});
	});
};

export function subscribeTopic(stompClient, room, callback) {
	stompClient.subscribe(room, callback);
};
