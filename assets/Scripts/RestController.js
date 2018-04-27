export function getRoomPlayers(roomId, callback){
	//axios.get("http:://localhost:8080//rooms/"+roomId+ '/players')
	axios.get('/rooms/'+roomId+'/players')
	.then(function(response){
		callback.onSuccess(response);
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function joinRoom(playerId, roomId, callback){
	//axios.put('http:://localhost:8080//rooms/'+roomId+ '/players', {id:playerId})
	axios.put('/rooms/'+roomId+'/players', {id:playerId})
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function createRoom(roomId, callback){
	//axios.post('http:://localhost:8080//rooms/'+{id:roomId})
	axios.post('/rooms', {id:roomId})
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function deleteRoom(roomId, callback){
	//axios.delete('http:://localhost:8080//rooms/'+roomId)
	axios.delete('/rooms/'+roomId)
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};