let root = document.getElementById("root");
let tab = document.getElementById("tab");
let childArray = [
  "overview",
  "suggestion",
  "summary-data-list",
  "meta-spec",
  "meta-tag",
  "seo-heading",
  "seo-description",
  "page-quality",
  "media-seo",
  "link-seo",
  "search-preview",
  "server-config",
  "page-speed",
];

function addChildToRootElement() {
  childArray.map((id, i) => {
    // content container
    let active = i !== 0 ? "hidden" : "";
    root.innerHTML += loader(id, active);
    // tab
    let styles = i == 0 ? "active" : "";
    tab.innerHTML += tabButton(id, styles);
  });
}
addChildToRootElement();

function addEventToTabButton() {
  childArray.map((id, i) => {
    let tab = document.getElementById(`tab_${id.replaceAll("-", "_")}`);
    tab.addEventListener("click", (e) => {
      makeActive(e.target.id);
    });
  });
}
addEventToTabButton();

function tabButton(id, styles) {
  let item = `<button  class="tab ${styles}" id='tab_${id.replaceAll(
    "-",
    "_"
  )}'>${id.replaceAll("-", " ")}</button>`;
  return item;
}

function loader(id, styles) {
  let item = `<div class='w-full min-h-[450px] ${styles}' id='${id.replaceAll(
    "-",
    "_"
  )}'>
                    <div class='w-full min-h-[450px] grid grid-rows-6 grid-cols-2 gap-3'>
                        <div class='animate-pulse rounded-lg bg-gray-200 row-span-3'></div>
                        <div class='animate-pulse rounded-lg bg-gray-200 row-span-3'></div>
                        <div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div>
                        <div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div>
                        <div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div>
                    </div>
                </div>`;
  return item;
}

function makeActive(id) {
  childArray.map((child, i) => {
    let button = document.getElementById(`tab_${child.replaceAll("-", "_")}`);
    let div = document.getElementById(child.replaceAll("-", "_"));
    if (`tab_${child.replaceAll("-", "_")}` == id) {
      button.classList.add("active");
      div.classList.remove("hidden");
    } else {
      button.classList.remove("active");
      div.classList.add("hidden");
    }
  });
}

let apiData = null,
  apiMobileData = null,
  apiDesktopData = null;
function getSeoResult() {
  let domain = document.getElementById("url").value;
  let body = new FormData();
  body.append("url", domain);
  body.append("audit-type", "ALL");
  postCall({
    url: "https://api.mojha.com/seo/seo-audit",
    body,
    onSuccess: (data) => (apiData = data),
    onError: (error) => console.log(error),
    onComplete: () => checkAllDataFetched(),
  });
  getCall({
    url: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${domain}&strategy=mobile&category=accessibility&category=best_practices&category=performance&category=seo`,
    onSuccess: (data) => (apiMobileData = data),
    onError: (error) => console.log(error),
    onComplete: () => checkAllDataFetched(),
  });
  getCall({
    url: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${domain}&strategy=desktop&category=accessibility&category=best_practices&category=performance&category=seo`,
    onSuccess: (data) => (apiDesktopData = data),
    onError: (error) => console.log(error),
    onComplete: () => checkAllDataFetched(),
  });
}

function checkAllDataFetched() {
  if (apiData !== null && apiMobileData !== null && apiDesktopData !== null) {
    console.log(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createResultSummary(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createResultOverview(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createSuggestion(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createMetaSpecification(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
  }
}

function getCall({
  url,
  queryParams = "",
  headers,
  onSuccess,
  onError,
  onComplete,
}) {
  fetch(url + queryParams, {
    method: "GET",
    cache: "force-cache",
    headers: {
      ...headers,
    },
  })
    .then((response) => response.json())
    .then((data) => onSuccess(data))
    .catch((error) => onError(error))
    .finally(() => (onComplete ? onComplete() : null));
}

function postCall({
  url,
  queryParams,
  headers,
  body,
  onSuccess,
  onError,
  onComplete,
}) {
  if (!body instanceof FormData) body = JSON.stringify(body);
  url = queryParams ? url + queryParams : url;

  fetch(url, {
    method: "POST",
    cache: "force-cache",
    body,
    headers: {
      ...headers,
    },
  })
    .then((response) => response.json())
    .then((data) => onSuccess(data))
    .catch((error) => onError(error))
    .finally(() => (onComplete ? onComplete() : null));
}

function escapeHTML(unsafeText) {
  let div = document.createElement("div");
  div.innerText = unsafeText;
  return div.innerHTML;
}

function createResultSummary(data, mobileAudit, desktopAudit) {
  let div = document.getElementById("summary_data_list");
  div.classList.add("grid", "grid-cols-1", "gap-3");
  div.innerHTML = getSummaryComponent(
    "Domain Age",
    [data.domain.domainAge, data.domain.analysis],
    [data.domain.score, data.domain.score]
  );
  div.innerHTML += getSummaryComponent(
    "Title",
    [
      desktopAudit.audits["document-title"].title,
      data.meta.analysis.title.analysis,
    ],
    [
      desktopAudit.audits["document-title"].score,
      data.meta.analysis.title.score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Meta Description",
    [
      desktopAudit.audits["meta-description"].title,
      data.meta.analysis.description.analysis,
    ],
    [
      desktopAudit.audits["meta-description"].score,
      data.meta.analysis.description.score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "SSL Certificate",
    [desktopAudit.audits["is-on-https"].title],
    [desktopAudit.audits["is-on-https"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Server Response Time",
    [desktopAudit.audits["server-response-time"].displayValue],
    [desktopAudit.audits["server-response-time"].score]
  );
  div.innerHTML += getSummaryComponent(
    "HTTP/2 Protocol",
    [data.protocol.http2.analysis],
    [data.protocol.http2.score]
  );
  div.innerHTML += getSummaryComponent(
    "Render Blocking Resources",
    [
      desktopAudit.audits["render-blocking-resources"].title +
        " (" +
        desktopAudit.audits["render-blocking-resources"].displayValue +
        ")",
    ],
    [desktopAudit.audits["render-blocking-resources"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Favicon",
    [data.favicon.analysis],
    [data.favicon.score]
  );
  div.innerHTML += getSummaryComponent(
    "HTTP Status code",
    [desktopAudit.audits["http-status-code"].title],
    [desktopAudit.audits["http-status-code"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Doctype",
    [desktopAudit.audits["doctype"].title, data.doctype.position.analysis],
    [desktopAudit.audits["doctype"].score, data.doctype.position.score]
  );
  div.innerHTML += getSummaryComponent(
    "Compression",
    [data.server.compression.analysis],
    [data.server.compression.score]
  );
  div.innerHTML += getSummaryComponent(
    "Console Error",
    [desktopAudit.audits["errors-in-console"].title],
    [desktopAudit.audits["errors-in-console"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Links",
    [
      data.linkContent.duplicateLink.analysis,
      data.linkContent.duplicateText.analysis,
      data.linkContent.genericAnchorText.analysis,
    ],
    [
      data.linkContent.duplicateLink.score,
      data.linkContent.duplicateText.score,
      data.linkContent.genericAnchorText.score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Permission on Start",
    [
      desktopAudit.audits["geolocation-on-start"].title,
      desktopAudit.audits["notification-on-start"].title,
    ],
    [
      desktopAudit.audits["geolocation-on-start"].score,
      desktopAudit.audits["notification-on-start"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Images",
    [
      desktopAudit.audits["image-aspect-ratio"].title,
      desktopAudit.audits["image-size-responsive"].title,
      desktopAudit.audits["unsized-images"].title,
    ],
    [
      desktopAudit.audits["image-aspect-ratio"].score,
      desktopAudit.audits["image-size-responsive"].score,
      desktopAudit.audits["unsized-images"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Image Alt",
    [data.imageContent.analysis.text],
    [data.imageContent.analysis.score]
  );
  div.innerHTML += getSummaryComponent(
    "Allowed Input",
    [desktopAudit.audits["paste-preventing-inputs"].title],
    [desktopAudit.audits["paste-preventing-inputs"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Crawlable / Indexing",
    [
      desktopAudit.audits["is-crawlable"].title,
      desktopAudit.audits["crawlable-anchors"].title,
    ],
    [
      desktopAudit.audits["is-crawlable"].score,
      desktopAudit.audits["crawlable-anchors"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Google Analytics",
    [data.googleAnalytics.analysis],
    [data.googleAnalytics.score]
  );
  div.innerHTML += getSummaryComponent(
    "Language",
    [
      desktopAudit.audits["html-has-lang"].title,
      desktopAudit.audits["html-lang-valid"].title,
    ],
    [
      desktopAudit.audits["html-has-lang"].score,
      desktopAudit.audits["html-lang-valid"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Fonts",
    [
      desktopAudit.audits["font-size"].title,
      desktopAudit.audits["font-display"].title,
    ],
    [
      desktopAudit.audits["font-size"].score,
      desktopAudit.audits["font-display"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Plugins",
    [desktopAudit.audits["plugins"].title],
    [desktopAudit.audits["plugins"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Mobile Taps",
    [desktopAudit.audits["tap-targets"].title],
    [desktopAudit.audits["tap-targets"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Heading",
    [desktopAudit.audits["heading-order"].title],
    [desktopAudit.audits["heading-order"].score]
  );
  div.innerHTML += getSummaryComponent(
    "&lt;h1&gt; Tag",
    [data.heading.analysis],
    [data.heading.score]
  );
  div.innerHTML += getSummaryComponent(
    "Viewport",
    [desktopAudit.audits["viewport"].title],
    [desktopAudit.audits["viewport"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Robots.txt",
    [desktopAudit.audits["robots-txt"].title],
    [desktopAudit.audits["robots-txt"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Color contrast",
    [desktopAudit.audits["color-contrast"].title],
    [desktopAudit.audits["color-contrast"].score]
  );
  div.innerHTML += getSummaryComponent(
    "DOM",
    [
      desktopAudit.audits["dom-size"].title,
      desktopAudit.audits["visual-order-follows-dom"].title,
    ],
    [
      desktopAudit.audits["dom-size"].score,
      desktopAudit.audits["visual-order-follows-dom"].score,
    ]
  );
  div.innerHTML += getSummaryComponent(
    "Canonical",
    [desktopAudit.audits["canonical"].title],
    [desktopAudit.audits["canonical"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Browser APIs",
    [desktopAudit.audits["deprecations"].title],
    [desktopAudit.audits["deprecations"].score]
  );
  div.innerHTML += getSummaryComponent(
    "Redirect",
    [desktopAudit.audits["redirects"].title],
    [desktopAudit.audits["redirects"].score]
  );
  div.innerHTML += getSummaryComponent(
    "www & non-www Redirect",
    [data.wwwRedirection.analysis],
    [data.wwwRedirection.score]
  );
  div.innerHTML += getSummaryComponent(
    "Frameset",
    [data.content.frameset.analysis],
    [data.content.frameset.score]
  );
  div.innerHTML += getSummaryComponent(
    "Iframe",
    [data.content.iframe.analysis],
    [data.content.iframe.score]
  );
  div.innerHTML += getSummaryComponent(
    "Charset",
    [data.content.charset.analysis],
    [data.content.charset.score]
  );
  div.innerHTML += getSummaryComponent(
    "Sitemap",
    [data.siteMap.analysis],
    [data.siteMap.score]
  );
}

function getSummaryComponent(heading, dataArray, statusArray) {
  let item = "";
  for (i = 0; i < dataArray.length; i++) {
    let status = statusArray[i] == 0 ? "text-red-400" : "text-green-400";
    let icon = statusArray[i] == 0 ? "error" : "check_circle";
    item += `<li><div class="flex text-base gap-1"><span class="material-symbols-outlined ${status} align-text-top pt-1"> ${icon}</span> ${escapeHTML(
      dataArray[i]
    )}</div></li>`;
  }
  return `<div class="border rounded-lg min-h-[120px] flex flex-col"><div><p class="font-semibold px-4 py-2 border-b">${heading}</p></div><ul class="px-4 pt-2 pb-4 space-y-2">${item}</ul></div>`;
}

function createResultOverview(data, mobileAudit, desktopAudit) {
  let div = document.getElementById("overview");
  div.classList.remove("grid");
  div.classList.add("flex", "flex-col", "gap-3");
  div.innerHTML = `<div class='grid grid-cols-2 gap-3 col-span-2' id='seo-score'></div>
    <div class='grid grid-cols-3 gap-3 col-span-2' id='website-overview'></div>
    <div class='grid grid-cols-2 gap-3 col-span-2' id='website-performance'></div>`;

  seoScore(data.overview);
  websiteOverviewComponent(data);
  pageMetrix(desktopAudit);
}

function websiteOverviewComponent(data) {
  let div = document.getElementById("website-overview");
  div.innerHTML = getOverviewComponent(
    "Domain Authority",
    data.authority.domainAuthority,
    "text-blue-600"
  );
  div.innerHTML += getOverviewComponent(
    "Page Authority",
    data.authority.pageAuthority,
    "text-blue-600"
  );
  div.innerHTML += getOverviewComponent(
    "Rank",
    data.authority.mozRank,
    "text-blue-600"
  );
}

function createSuggestion(data, mobileAudit, desktopAudit) {
  document.getElementById("suggestion").innerHTML =
    "<div class='w-full flex flex-col border rounded-lg'><p class='text-2xl text-blue-500 p-3 border-b font-semibold'>Task list for SEO improvement</p><ul class='list-none space-y-3 p-3' id='improventment'></ul></div>";
  data.scopeOfImprovement.forEach((improvement) => {
    document.getElementById("improventment").innerHTML += getTaskList(
      improvement.suggestion,
      improvement.priority
    );
  });
}

function seoScore(data) {
  let div = document.getElementById("seo-score");
  let status =
    data.seoScore > 50
      ? data.seoScore > 80
        ? "stroke-green-400"
        : "stroke-yellow-500"
      : "stroke-red-400";
  let textStatus =
    data.seoScore > 50
      ? data.seoScore > 80
        ? "stroke-green-400"
        : "stroke-yellow-500"
      : "stroke-red-400";
  let item = `<div class="relative flex w-8/12 mx-auto">
                    <svg viewBox="0 0 36 36" class="w-full">
                      <path class="stroke-2 fill-transparent duration-300 transition-all ${status}" style='stroke-linecap: round;' stroke-dasharray="${data.seoScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                    </svg>
                    <div class="absolute w-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center ${textStatus}">
                      <span class="text-base text-black">SEO Score</span>
                      <p class="text-3xl font-semibold">${data.seoScore}%</p>
                    </div>
                  </div>
                  <div class='flex flex-col gap-4 justify-center'>
                    <div class='flex flex-col gap-1'>
                      <p>Passed</p>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                        <div class='bg-green-400 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: 20%;'></div>
                      </div>
                    </div>
                    
                    <div class='flex flex-col gap-1'>
                      <p>Need Improvement</p>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                       <div class='bg-yellow-500 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: 20%;'></div>
                      </div>
                    </div>

                    <div class='flex flex-col gap-1'>
                      <p>Have to Fixed</p>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                       <div class='bg-red-600 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: 20%;'></div>
                      </div>
                    </div>
                  </div>
                  `;
  div.innerHTML = item;
}

function getTaskList(heading, priority) {
  let status =
    priority == "HIGH"
      ? "bg-red-50"
      : priority == "MEDIUM"
      ? "bg-yellow-50"
      : "bg-green-50";
  let badgeText =
    priority == "HIGH"
      ? "text-red-500"
      : priority == "MEDIUM"
      ? "text-yellow-500"
      : "text-green-500";
  let item = `<li>
                <div class='flex items-center justify-between p-2 border rounded-lg ${status}'>
                  <div class="flex-grow-1"> <p class="mb-0 "> ${heading} </p> </div>
                  <div class="inline rounded-lg px-2 py-1 ${badgeText}"> ${priority} </div>
                </div>
               </li>`;
  return item;
}

function pageMetrix(desktopAudit) {
  let audits = desktopAudit.audits;
  let categories = desktopAudit.categories;
  let div = document.getElementById("website-performance");

  let performanceScore = Math.round(categories["performance"].score * 100);
  let performaceStatus =
    performanceScore > 50
      ? performanceScore > 80
        ? "text-green-400"
        : "text-yellow-500"
      : "text-red-400";

  div.innerHTML = getOverviewComponent(
    "Performance",
    performanceScore,
    performaceStatus
  );
  div.innerHTML += getOverviewComponent(
    "Page Load Time",
    audits["speed-index"].displayValue
  );
  div.innerHTML += getOverviewComponent(
    "Page size",
    audits["speed-index"].displayValue
  );
  div.innerHTML += getOverviewComponent(
    "Requests",
    audits["network-requests"].details.items.length
  );
}

getSeoResult();

function getOverviewComponent(heading, value, styles = "text-black") {
  let item = `<div class='border rounded-lg flex flex-col p-3 items-center'>
                    <div class='text-4xl font-semibold ${styles}'>${value}</div>
                    <div class='text-base'>${heading}</div>
                </div>`;
  return item;
}

function createMetaSpecification(data, mobileAudit, desktopAudit) {
  let metaAnalysis = [
    [
      "Page Title",
      data.meta.analysis.title.text,
      data.meta.analysis.title.analysis,
      data.meta.analysis.title.score,
      "title",
    ],
    [
      "Page Description",
      data.meta.analysis.description.text,
      data.meta.analysis.description.analysis,
      data.meta.analysis.description.score,
      "title",
    ],
    [
      "Crawlability",
      "",
      data.meta.analysis.robots.analysis,
      data.meta.analysis.robots.score,
      "",
    ],
    [
      "Keywords",
      data.meta.analysis.keywords.text,
      data.meta.analysis.keywords.analysis,
      data.meta.analysis.keywords.score,
      "tag",
    ],
    // ["Canonical Url", data.meta.analysis.keywords.text, data.meta.analysis.keywords.analysis, data.meta.analysis.keywords.score, ""],
    [
      "Language",
      data.language.lang.text,
      data.language.lang.analysis,
      data.language.lang.score,
      "tag",
    ],
    // ["Alternate Links", data.language.lang.text, data.language.lang.analysis, data.language.lang.score, "tag"],
    [
      "Charset encoding",
      data.content.charset.text,
      data.content.charset.analysis,
      data.content.charset.score,
      "tag",
    ],
    // ["Doctype", data.content.charset.text, data.content.charset.analysis, data.content.charset.score, "title"],
    // ["Favicon", data.content.charset.text, data.content.charset.analysis, data.content.charset.score, "title"]
  ];

  document.getElementById("meta_spec").innerHTML = `<div>
  <div id='specification_meta'></div>
  <div id='tags_meta'></div>
  </div>`;

  let div = document.getElementById("specification_meta");

  metaAnalysis.forEach((analysis) => {
    div.innerHTML += getMetaSpecification(
      analysis[0],
      analysis[1],
      analysis[2],
      analysis[3],
      analysis[4]
    );
  });

  let div2 = document.getElementById("tags_meta");
  Object.entries(data.meta.metaTags).forEach(([tag, value]) => {
    div2.innerHTML += getMetatagList(tag, value);
  });
}

function getMetaSpecification(heading, data, analysis, score, type) {
  let status = score == 0 ? "text-red-500" : "text-green-500";
  let icon = score == 0 ? "error" : "check_circle";
  let item = `<div class="flex flex-col border rounded-lg mb-3 p-2"> <div class="flex flex-row px-4 py-2"> <p class="flex-sm-grow-1 mb-0 font-bold">${heading}</p> </div> <div class=""> <ul class=""> <li>`;
  if (type == "title") {
    item += `<div class="mb-1 fs-16 lh-xs fw-semibold">${data}</div>`;
  } else if (type == "tag") {
    let listItem = "";
    if (data !== "") {
      data.split(", ")?.forEach((element) => {
        listItem += `<div class="border rounded-lg p-2 m-1"> ${element} </div>`;
      });
      item += `<div class="flex flex-wrap mb-1">${listItem}</div>`;
    }
  }
  item += ` <div class="${status} flex text-base gap-1"> <span class="material-symbols-outlined align-text-top pt-1"> ${icon} </span> ${analysis} </div> </li> </ul> </div> </div>`;
  return item;
}

function getMetatagList(tag, value) {
  let item = `<div class="flex flex-col flex-md-row border-bottom"> <div class="font-bold p-3 py-2 bg-gray-200"> ${tag} </div> <div class="font-bold p-3 py-2"> <p class="mb-0">${value}</p> </div> </div>`;
  return item;
}
