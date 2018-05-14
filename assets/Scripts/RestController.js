export function getRoomPlayers(roomId, callback){
	axios.get('/rooms/'+roomId+'/players')
	.then(function(response){
		callback.onSuccess(response);
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function joinRoom(playerId, xPosition, yPosition, roomId, callback){
	axios.put('/rooms/'+roomId+'/players', {id:playerId, x:xPosition, y:yPosition})
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function createRoom(roomId, callback){
	axios.post('/rooms', {id:roomId})
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};

export function deleteRoom(roomId, callback){
	axios.delete('/rooms/'+roomId)
	.then(function(){
		callback.onSuccess();
	})
	.catch(function(error){
		callback.onFailed(error);
	});
};