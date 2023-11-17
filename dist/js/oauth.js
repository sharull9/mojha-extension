
window.onload = function () {
    let token = null;
    document.getElementById('login').addEventListener('click', function () {
        chrome.identity.getAuthToken({ interactive: true }, function (accessToken) {
            token = accessToken
            let init = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                'contentType': 'json'
            };
            console.log(accessToken);
        });
        chrome.identity.getProfileUserInfo(function (callback) {
            console.log(callback);
        });
    });
    document.getElementById('signOut').addEventListener('click', () => {
        chrome.identity.clearAllCachedAuthTokens()
    })
};