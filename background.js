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

