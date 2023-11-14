chrome.tabs.query({ lastFocusedWindow: true, active: true }, function (tabs) {
  let tabUrl = tabs[0].url.split("/")[2];
  // document.getElementById("siteUrl").innerHTML = tabUrl;
  // document.getElementById("siteLink").setAttribute("href", tabUrl);
  // document.getElementById("next").innerHTML = window.innerWidth;
  console.log(tabs[0].url);
});
