isAPILoaded = false;
isPlayerLoaded = false;
isMultiSearchDone = false;

(function($){
    $.getQuery = function( query ) {
        query = query.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var expr = "[\\?&]"+query+"=([^&#]*)";
        var regex = new RegExp( expr );
        var results = regex.exec( window.location.href );
        if( results !== null ) {
            return results[1];
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        } else {
            return false;
        }
    };
})(jQuery);

function loadAPIClientInterfaces() {
    gapi.client.load("youtube", "v3", handleAPILoaded)
}

googleApiClientReady = function() {
    loadAPIClientInterfaces();
};

function handleAPILoaded() {
    gapi.client.setApiKey("{YOUTUBE API KEY}");

    isAPILoaded = true;

    if (isPlayerLoaded && (!isMultiSearchDone))
    {
	    multiSearch();
    }

}

function onYouTubeIframeAPIReady()
{
    player = new YT.Player("player",{
        height: "394",
        width: "700",
        events: {
            onReady: onPlayerReady,
            onError: onPlayerError,
            onStateChange: onPlayerStateChange,
        },
        playerVars: {
            modestbranding: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            theme: "dark",
            color: "white",
            showinfo: 1,
            playsinline: 1,
	    origin: "https://www.youtube.com"
        }
    })
}

var search = function(query,counter) {
	var q = query;
	var c = counter;

	var request = gapi.client.youtube.search.list({
	q: q,
	part: 'snippet',
	maxResults: 20
	//order: 'viewCount'
	});
  
  request.execute(function(response) {
	var searchObj = response.result;
	//these arrays will hold the top 20 results of each one in the loop
	var vIdArr=[], vTitleArr=[], vThumbArr=[];

	$.each(searchObj.items, function(i,x) {
		var vId = x.id.videoId;
		var vTitle = x.snippet.title;
		if (x.snippet.thumbnails.default.url !=undefined) var vThumb = x.snippet.thumbnails.default.url;
		if (vId===undefined) {
			vId="Not Found"; vTitle="Not Found. Try version refresh button: "; vThumb="img/notfound.png"; 
		}

		vIdArr.push(vId);
		vTitleArr.push(vTitle);
		vThumbArr.push(vThumb);

		//display list, use only first result of each
		if (i === 0) {
			player.topvIdArray.push(vId);	
			player.topvTitleArray.push(vTitle);
			player.topvThumbArray.push(vThumb);
			//start the first video right away while the playlist loads

			if (player.topvIdArray.length == 1) {
				if (isMultiSearchDone) loadVid(player.topvIdArray[0], 0, "medium"); 
			} 

			renderPlaylist(c,vThumb,vId,vTitle);
			c++;
		}
	});
  });	
};

function multiSearch() {
        player.topvIdArray = []; 
        player.topvTitleArray =[]; 
        player.topvThumbArray = []; 
        player.listArray = [];
        player.vidcount = 0; 
        player.done = false; 
        
        if (player.topvIdArray) {
            player.topvIdArray.length = 0; player.topvTitleArray.length = 0; player.topvThumbArray.length = 0;
            player.listArray.length = 0;
        }
   
        var searchTerm = $.getQuery('searchTerm');

        $.getJSON(
            'http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist='+searchTerm +'&autocorrect=1&api_key={LASTFM API KEY}&limit=20&format=json',
            function(data)
            {
				var artistName = data.toptracks['@attr'].artist
                $.each( data.toptracks.track, function(i,item) {
                    player.listArray.push(artistName + ' - ' + item.name);                        
                });

                var x = 0;
                var searchnum = player.listArray.length;
        
                (function setInterval_afterDone(){
            
                    /* do search function */
                    if (player.listArray[x])
                        { search(player.listArray[x],x); } 
                    x++;            
                    
                    var waittime = 600; 
                    var timerId = setTimeout(setInterval_afterDone, waittime);
                    if(x==searchnum) {
            
                        player.done = true;
                        clearTimeout(timerId);
                    }
                })();
                isMultiSearchDone = true;
            }
        );        
    }
    
function renderPlaylist(c,vThumb,vId,vTitle) {
    $("#search-container").append("<div class='searchresult'>"+createPlaylistItem(c,vThumb,vId,vTitle)+"</div>");
}
function createPlaylistItem(c,vThumb,vId,vTitle) {
    var vclick = "loadVid(\""+vId+"\"); player.vidcount="+c+";";
    var notFoundString = '';
    if (vId == "Not Found") {
        vclick = "#";
        notFoundString = "<input id='not-found' value='"+ player.listArray[c] +"'> ";
    }

    return "<div class='searchresult-div'><img id='thumb' src='"+ vThumb +"'></div> <div class='searchresult-title'>"+ notFoundString +"<a id='link' onclick='"+ vclick + "' title='"+ vTitle +"'>" + vTitle + 
        "</a></div>";
}


function playPause() {
    if (player.getPlayerState() != 1) {
            player.playVideo();
            $("#playpause").text("Pause");
    } else {
        player.pauseVideo();
        $("#playpause").text("Play");
    }
}

function nextVideo(next) {
    var totalvids = player.topvIdArray.length;
    if (next===true) {
        player.vidcount++; 
        if (player.vidcount >= totalvids) 
            player.vidcount = 0;
        $('#search-container').append($('#search-container div.searchresult:first'));
    } else { 
        player.vidcount--; 
        if ((player.vidcount < 0) || (player.vidcount=='undefined')) 
            player.vidcount = totalvids-1;
        $('#search-container').prepend($('#search-container div.searchresult:last'));
    }
    
    var thevideoid = player.topvIdArray[player.vidcount];
    if (thevideoid) loadVid(thevideoid);
}

function loadVid(vidId) {
    if (player.loadVideoById) {
        player.loadVideoById(vidId);
        if (player.topvTitleArray[player.vidcount]) document.title = player.topvTitleArray[player.vidcount];
    } 
}

function onPlayerStateChange(e) {
    if (e.data != 1) 
        $("#playpause").text("Play")
    else 
        $("#playpause").text("Pause")
    
	if (e.data === 0) {
        nextVideo(true);
    }
}

function onPlayerError(e) {
}

function onPlayerReady() {
    $("#prevbutton").click(function() {
        nextVideo(false)
    }),
    $("#playpause").click(function() {
        playPause()
    }),
    $("#nextbutton").click(function() {
        nextVideo(true)
    })


    isPlayerLoaded = true;

    if (isAPILoaded && (!isMultiSearchDone))
    {
	multiSearch();
    }    
}

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
