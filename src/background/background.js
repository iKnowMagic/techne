var background = function() {
  // The helper function to convert XML to JSON
  function parseRSS(url) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&num=-1&q=' + encodeURIComponent(url),
        dataType: 'json',
        success: function success(data) {
          resolve(data.responseData.feed);
        }
      });
    });
  }

  function deleteByKey(data, key) {
    console.log(data);
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === key) {
        data.splice(i, 1);
        return data;
      }
    }
    return data;
  }

  function processAwwwards(json) {
    var imageEntries = [];
    chrome.storage.local.get('imageEntries', function(response) {
      if (typeof response.imageEntries !== 'undefined') {
        imageEntries = response.imageEntries;
      }

      for (var i = 0; i < json.entries.length; i++) {
        var image = json.entries[i].content.match(/img src\=\"((.*\.jpeg)|(.*\.png)|(.*\.jpg))\"/);
        if (typeof image[1] !== 'undefined') {
          var id = md5(image[1]);
          imageEntries = deleteByKey(imageEntries, id);

          imageEntries.push({
            id: id,
            image: image[1],
            source: 'awwwwards',
            seen: false
          });
        }
      }

      chrome.storage.local.set({
        imageEntries: imageEntries
      });

      console.log(imageEntries);
    });
  }

  function processCssda(json) {
    var imageEntries = [];
    chrome.storage.local.get('imageEntries', function(response) {
      if (typeof response.imageEntries !== 'undefined') {
        imageEntries = response.imageEntries;
      }
      for (var i = 0; i < json.entries.length; i++) {
        var image = json.entries[i].content.match(/img src\=\"((.*\.jpeg)|(.*\.png)|(.*\.jpg))\"/);
        console.log(image);
        if (typeof image[1] !== 'undefined') {
          var id = md5(image[1]);
          //imageEntries = deleteByKey(imageEntries, id);

          imageEntries.push({
            id: id,
            image: image[1],
            source: 'cssda',
            seen: false
          });
        }
      }

      chrome.storage.local.set({
        imageEntries: imageEntries
      });


    });
  }

  function main() {
    /*parseRSS('http://feeds.feedburner.com/awwwards-sites-of-the-day').then(function(json) {
      processAwwwards(json);
    });*/
    //parseRSS('http://feeds.feedburner.com/cssda-websites-of-the-day', processCssda);
    //chrome.storage.local.clear();
    Promise.all([
      parseRSS('http://feeds.feedburner.com/awwwards-sites-of-the-day'),
      parseRSS('http://feeds.feedburner.com/cssda-websites-of-the-day')
    ]).then(responses => {
      //processAwwwards(responses[0]);
      processCssda(responses[1]);
    });
  }

  return {
    main: main
  };
}(jQuery);

background.main();
