var newtab = function($) {
  function getNumRows() {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get('numRows', function(result) {
        if (typeof result.numRows === 'undefined') {
          chrome.storage.local.set({
            'numRows': 1
          });
          resolve(1);
        }
        else {
          resolve(result.numRows);
        }
      });
    });
  }

  function isNewImage(currImage) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get('images', function(result) {
        if (typeof result.images === 'undefined') {
          chrome.storage.local.set({
            'images': [currImage]
          });
          resolve(true);
        }
        else {
          if (result.images.indexOf(currImage)) {
            resolve(false);
          }
          else {
            console.log(3);
            result.images.push(currImage);
            chrome.storage.local.set({
              'images': result.images
            });
            resolve(true);
          }
        }
      });
    });
  }

  function setBackground(image) {
    $('body').css({ 'backgroundImage': "url('" + image + "')" });
  }

  function saveImageEntries(imageEntries) {
    chrome.storage.local.set({imageEntries: imageEntries});
  }

  function showOneArticle() {
    chrome.storage.local.get('imageEntries', function(response) {
      console.log(response);
      for (var i = 0; i < response.imageEntries.length; i++) {
        if (!response.imageEntries[i].seen) {
          setBackground(response.imageEntries[i].image);
          response.imageEntries[i].seen = true;
          saveImageEntries(response.imageEntries);
          return;
        }
      }
    });
  }

  function main() {
    showOneArticle();
  }

  return {
    main: main
  };
}(jQuery);

jQuery(document).ready(function() {
  newtab.main();
});
