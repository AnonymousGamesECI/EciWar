export function getRoomPlayers(roomId, callback){
	axios.get('/rooms/'+roomId+'/players')
	.then(function(response){
		callback.onSuccess(response);
	})
	.catch(function(error){
		callback.onfailed(error);
	});
};

export function joinRoom(playerId, roomId, callback){
	axios.put('/rooms/'+roomId+'players', {id:playerId})
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onfailed(error);
	});
}

export function createRoom(roomId, callback){
	axios.post('/rooms/'+roomId)
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onfailed(error);
	});
}

export function deleteRoom(roomId, callback){
	axios.delete('/rooms/'+roomId)
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onfailed(error);
	});
}