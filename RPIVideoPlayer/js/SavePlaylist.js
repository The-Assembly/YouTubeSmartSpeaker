var playlistID;

function createPlaylist() {
    gapi.auth.authorize({
       client_id: '{YOUTUBE API CLIENT ID}',
       scope: 'https://www.googleapis.com/auth/youtube',
        immediate: false
        }, handleAuthResult);
} 

function handleAuthResult(authResult)
{
    if (authResult && !authResult.error) { 
        var request = gapi.client.youtube.playlists.insert({
            part: 'snippet,status',
            resource: {
              snippet: {
                title: 'Assembly playlist'
              },
              status: {
                privacyStatus: 'public'
              }
            }
          });
          request.execute(function(response) {
            var result = response.result;
            if (result) {
              playlistId = result.id;
              multiAddVideosToPlaylist();
                
            } else {
              alert("Could not create playlist. Make sure you're signed in to Youtube.");
            }
          });
      
    }
}

function multiAddVideosToPlaylist() {
	var x = 0;
	var count = player.topvIdArray.length+1;
	var interval = setInterval(function() {
		addToPlaylist(player.topvIdArray[x]);
		x++;
		if(x==count) {
			clearInterval(interval);
		}
	}, 200);
}


function addToPlaylist(id) {
  var details = {
	videoId: id,
	kind: 'youtube#video'
  }

  var request = gapi.client.youtube.playlistItems.insert({
	part: 'snippet',
	resource: {
	  snippet: {
		playlistId: playlistId,
		resourceId: details
	  }
	}
  });

  request.execute(function(response) {

  });
} 