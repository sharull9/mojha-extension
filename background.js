chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (tabs) {
  let tabUrl = tabs[0].url;
  document.getElementById("site_link").innerHTML = tabUrl;
  document.getElementById("site_link").dataset.url = tabUrl;
  document.getElementById("site_link").setAttribute("href", tabUrl);
  document.getElementById("url").value = tabUrl;

  fetch('https://mojha.com/user/details')
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })

  getSeoResult()
});

// var googleAuth = new OAuth2("google", {
//   client_id: "289577304485",
//   client_secret: "289577304485-q9tc9dqj8jr0j8u71ud8epipskm8pmtr.apps.googleusercontent.com",
//   api_scope: "https://www.googleapis.com/auth/tasks",
// });

// googleAuth.authorize(function () {
//   // Ready for action
// });
