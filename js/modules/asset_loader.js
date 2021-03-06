(function(){
  App = window.App;
  var contextDeferred = Q.defer();
  window.addEventListener('load', function(){
    assetLoader.init();
  }, false);

  var promises = [];

  function loadAudio(url){
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    var deferred = Q.defer();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      contextDeferred.promise.then(function(context){
        context.decodeAudioData(
          request.response,
          function(buffer) {
            if (!buffer) {
              deferred.reject(new Error('error decoding file data: ' + url));
              return;
            }
            deferred.resolve(buffer);
          },
          function(error) {
            deferred.reject(new Error('error decoding file data: ' + url));
          }
        );
      })

    }

    request.onerror = function() {
      deferred.reject(new Error('error decoding file data: ' + url));
    }

    request.send();
    return deferred.promise;
  }

  function loadImage(url){
    var image = new Image();
    var deferred = Q.defer();
    image.onload = function(){
      deferred.resolve(image);
    };
    image.onerror = function(error){
      deferred.reject(error, url);
    };
    image.src = url;
    return deferred.promise;
  }

  // asset loader public API
  var assetLoader = {
    init: function(){
      // Fix up prefixing
      AudioContext = window.AudioContext || window.webkitAudioContext;
      var context = new AudioContext();
      contextDeferred.resolve(context);
    },

    addAsset: function(url, type){
      var promise;
      if(type == 'audio'){
        promise = loadAudio(url);
      }else if(type == "image"){
        promise = loadImage(url);
      }
      promises.push(promise);
      return promise;
    },

    load: function(){
      return Q.allSettled(promises)
    }
  };
  App.getAssetLoader = function(){
    return assetLoader;
  }
  App.getContext = function(){
    return contextDeferred.promise;
  }
})();
