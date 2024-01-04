window.onload = function() {
    chrome.cookies.getAll({domain: 'depop.com'}, function(cookies) {
      var cookieInfo = '';
      var _userId;
      var _bearerToken;
      for(var i=0; i<cookies.length; i++) {
        cookieInfo += cookies[i].name + ' = ' + cookies[i].value + '<br>';
        if (cookies[i].name === 'user_id') {
            window._userId = cookies[i].value;
            console.log(_userId)
        }
        if (cookies[i].name === 'access_token') {
            window._bearerToken = cookies[i].value;
            console.log(_bearerToken)
        }
      }
      document.getElementById('cookies').innerHTML = cookieInfo;

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {_userId: _userId, _bearerToken: _bearerToken});
      });

    });
    
  };