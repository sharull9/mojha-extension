let root = document.getElementById("root");
let tab = document.getElementById("tab");
let childArray = [
  "overview",
  "suggestion",
  "summary",
  "meta-spec",
  "seo-analysis",
  "page-quality",
  "server-config",
  "page-speed",
  "optimisation",
];

function addChildToRootElement() {
  childArray.map((id, i) => {
    root.innerHTML += container(id);

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
  let item = `<a href="#${id.replaceAll(
    "-",
    "_"
  )}" class="tab ${styles} capitalize text-sm" id='tab_${id.replaceAll(
    "-",
    "_"
  )}'>${id.replaceAll("-", " ")}</a>`;
  return item;
}

function container(id) {
  let item = `<section class='w-full' id='${id.replaceAll(
    "-",
    "_"
  )}'></section>`;
  return item;
}

function makeActive(id) {
  childArray.map((child, i) => {
    let button = document.getElementById(`tab_${child.replaceAll("-", "_")}`);
    if (`tab_${child.replaceAll("-", "_")}` == id) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
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
    clearInterval(myInterval);
    document.getElementById("loading-message").remove();
    console.log(apiData);
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
    createSeoAnalysis(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createPageQuality(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createPageSpeed(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createServerConfig(
      apiData,
      apiMobileData.lighthouseResult,
      apiDesktopData.lighthouseResult
    );
    createOptimisation(
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
  let div = document.getElementById("summary");
  div.classList.add("grid", "grid-cols-1", "gap-5");
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
    item += `<li><div class="flex text-base gap-1"><span class="material-symbols-outlined ${status} align-text-top"> ${icon}</span> ${escapeHTML(
      dataArray[i]
    )}</div></li>`;
  }
  return `<div class="border rounded-lg min-h-[120px] flex flex-col"><div><p class="font-semibold px-4 py-2 border-b">${heading}</p></div><ul class="px-4 pt-2 pb-4 space-y-2">${item}</ul></div>`;
}

function createResultOverview(data, mobileAudit, desktopAudit) {
  let div = document.getElementById("overview");
  div.classList.remove("grid");
  // div.classList.add("flex", "flex-col", "gap-3");
  div.innerHTML = `
  <div class='mb-2'><h2 class='text-xl font-semibold'>Overview</h2></div>
  <div class='grid grid-cols-2 gap-3'>
    <div class='grid grid-cols-2 gap-3 grid-rows-[auto_auto_auto]' id='website'>
    </div>
    <div>
      <div class='' id='seo-score'></div>
      
    </div>
  </div>
    
    `;
  // `<div class='grid grid-cols-3 gap-3 col-span-2' id='website-overview'></div>
  // <div class='grid grid-cols-3 gap-3 col-span-2' id='website-performance'></div>
  // <div class='grid grid-cols-2 gap-3 col-span-2' id='seo-score'></div>`;

  seoScore(data.overview);
  websiteOverviewComponent(data);
  pageMetrix(desktopAudit);
}

function websiteOverviewComponent(data) {
  let div = document.getElementById("website");
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
    "Back Links",
    data.authority.links,
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
        ? "text-green-400"
        : "text-yellow-500"
      : "text-red-400";
  let item = `<div class="relative flex w-7/12 mx-auto">
                    <svg viewBox="0 0 36 36" class="w-full">
                      <path class="stroke-2 fill-transparent duration-300 transition-all ${status}" style='stroke-linecap: round;' stroke-dasharray="${data.seoScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                    </svg>
                    <div class="absolute w-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center ${textStatus}">
                      <span class="text-base text-black">SEO Score</span>
                      <p class="text-3xl font-semibold">${data.seoScore}%</p>
                    </div>
                  </div>
                  <div class='flex flex-col gap-3 justify-center'>
                    <div class='flex flex-col gap-1'>
                      <div class='flex justify-between items-center gap-2'>
                        <p class='text-sm'>Passed</p>
                        <p>${data.passed}%</p>
                      </div>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                        <div class='bg-green-400 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: ${data.passed}%;'></div>
                      </div>
                    </div>
                    
                    <div class='flex flex-col gap-1'>
                      <div class='flex justify-between items-center gap-2'>
                        <p class='text-sm'>Need Improvement</p>
                        <p>${data.needImprovement}%</p>
                      </div>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                       <div class='bg-yellow-500 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: ${data.needImprovement}%;'></div>
                      </div>
                    </div>

                    <div class='flex flex-col gap-1'>
                      <div class='flex justify-between items-center gap-2'>
                        <p class='text-sm'>Have to Fixed</p>
                        <p>${data.mustFix}%</p>
                      </div>
                      <div class='relative bg-gray-100 rounded-lg h-2 overflow-hidden'>
                       <div class='bg-red-600 absolute top-0 left-0 right-0 h-full rounded-lg' style='width: ${data.mustFix}%;'></div>
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
  let div = document.getElementById("website");

  let performanceScore = Math.round(categories["performance"].score * 100);
  let performaceStatus =
    performanceScore > 50
      ? performanceScore > 80
        ? "text-green-400"
        : "text-yellow-500"
      : "text-red-400";

  div.innerHTML += getOverviewComponent(
    "Performance",
    performanceScore,
    performaceStatus
  );
  div.innerHTML += getOverviewComponent(
    "Page Load Time",
    audits["speed-index"].displayValue
  );
  // div.innerHTML += getOverviewComponent(
  //   "Page size",
  //   audits["speed-index"].displayValue
  // );
  div.innerHTML += getOverviewComponent(
    "Requests",
    audits["network-requests"].details.items.length
  );
}

function getOverviewComponent(heading, value, styles = "text-black") {
  let item = `<div class='border rounded-lg flex flex-col py-3 px-1 justify-center items-center hover:scale-105 transition-all duration-100 hover:bg-blue-100/20 cursor-pointer'>
                    <div class='text-2xl font-semibold ${styles}'>${value}</div>
                    <div class='text-sm text-center'>${heading}</div>
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
  <div class='font-bold my-2 text-xl'>
  <p>Meta Specification</p>
  </div>
  <div id='specification_meta'></div>
  <div class='font-bold mt-6 mb-2 text-xl'>
  <p>Meta Tags</p>
  </div>
  <div id='tags_meta' class='rounded-lg border overflow-hidden grid grid-cols-4'></div>
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
  let item = `<div class="flex flex-col border rounded-lg mb-3"> <div class="flex flex-row px-4 py-2 border-b"> <p class="font-semibold">${heading}</p> </div> <div class="px-4 pt-2 pb-4"> <ul class=""> <li>`;
  if (type == "title") {
    item += `<div class="mb-1 font-bold text-xl">${data}</div>`;
  } else if (type == "tag") {
    let listItem = "";
    if (data !== "") {
      data.split(", ")?.forEach((element) => {
        listItem += `<div class="border rounded-lg px-2 py-1"> ${element} </div>`;
      });
      item += `<div class="flex flex-wrap mb-1">${listItem}</div>`;
    }
  }
  item += ` <div class="${status} flex text-base gap-1"> <span class="material-symbols-outlined align-text-top"> ${icon} </span> ${analysis} </div> </li> </ul> </div> </div>`;
  return item;
}

function getMetatagList(tag, value) {
  let item = `<div class="font-semibold text-gray-800 px-3 py-2 text-sm truncate bg-gray-200"> ${tag} </div> <div class="font-bold text-sm truncate px-3 py-2 col-span-3"> <p class="">${value}</p> </div>`;
  return item;
}

function createSeoAnalysisContainer() {
  let item = `<div class='flex flex-col gap-3'>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Heading Analysis</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='heading-analysis' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Image Analysis</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='image-analysis' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Link Analysis</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='link-analysis' class='space-y-1 text-base'></ul>
                  </div>
                </div>
              </div>`;
  document.getElementById("seo_analysis").innerHTML = item;
}

function createSeoAnalysis(data, mobileAudit, desktopAudit) {
  createSeoAnalysisContainer();
  let headingAnalysis = document.getElementById("heading-analysis");
  headingAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["heading-order"].title,
    desktopAudit.audits["heading-order"].score
  );
  headingAnalysis.innerHTML += createAnalysisSummary(
    data.heading.analysis,
    data.heading.score
  );

  let imageAnalysis = document.getElementById("image-analysis");
  imageAnalysis.innerHTML += createAnalysisSummary(
    data.imageContent.analysis.text,
    data.imageContent.analysis.score
  );
  imageAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["image-aspect-ratio"].title,
    desktopAudit.audits["image-aspect-ratio"].score
  );
  imageAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["image-size-responsive"].title,
    desktopAudit.audits["image-size-responsive"].score
  );
  imageAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["unsized-images"].title,
    desktopAudit.audits["unsized-images"].score
  );

  let linkAnalysis = document.getElementById("link-analysis");
  linkAnalysis.innerHTML += createAnalysisSummary(
    data.linkContent.duplicateLink.analysis,
    data.linkContent.duplicateLink.score
  );
  linkAnalysis.innerHTML += createAnalysisSummary(
    data.linkContent.duplicateText.analysis,
    data.linkContent.duplicateText.score
  );
  linkAnalysis.innerHTML += createAnalysisSummary(
    data.linkContent.genericAnchorText.analysis,
    data.linkContent.genericAnchorText.score
  );
  linkAnalysis.innerHTML += createAnalysisSummary(
    data.linkContent.internalLink.analysis,
    data.linkContent.internalLink.score
  );
  linkAnalysis.innerHTML += createAnalysisSummary(
    data.linkContent.externalLink.analysis,
    data.linkContent.externalLink.score
  );
}

function createAnalysisSummary(analysis, score) {
  let status = score == 1 ? "text-green-400" : "text-red-500";
  let icon = score == 1 ? "check_circle" : "error";
  let item = `<li class="flex items-start gap-1"> <span class="material-symbols-outlined ${status}"> ${icon} </span> ${escapeHTML(
    analysis
  )} </li>`;
  return item;
}

function createPageQuality(data, mobileAudit, desktopAudit) {
  createPageQualityContainer();

  let content = document.getElementById("pq-content");
  content.innerHTML += createAnalysisSummary(
    desktopAudit.audits["html-has-lang"].title,
    desktopAudit.audits["html-has-lang"].score
  );
  content.innerHTML += createAnalysisSummary(
    desktopAudit.audits["html-lang-valid"].title,
    desktopAudit.audits["html-lang-valid"].score
  );
  content.innerHTML += createAnalysisSummary(
    data.content.word.analysis,
    data.content.word.score
  );
  content.innerHTML += createAnalysisSummary(
    data.content.stopWord.analysis,
    data.content.stopWord.score
  );
  content.innerHTML += createAnalysisSummary(
    data.content.pageSize.analysis,
    data.content.pageSize.score
  );
  content.innerHTML += createAnalysisSummary(
    data.content.boldAndStrongTag.analysis,
    data.content.boldAndStrongTag.score
  );

  let frame = document.getElementById("pq-frame");
  frame.innerHTML += createAnalysisSummary(
    data.content.frameset.analysis,
    data.content.frameset.score
  );
  frame.innerHTML += createAnalysisSummary(
    data.content.iframe.analysis,
    data.content.iframe.score
  );

  let socialNetwork = document.getElementById("pq-social-network");
  socialNetwork.innerHTML += createAnalysisSummary(
    data.content.iframe.analysis,
    data.content.iframe.score
  );
}

function createPageQualityContainer() {
  let item = `<div class='flex flex-col gap-3'>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Content</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='pq-content' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Frames</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='pq-frame' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Social Networks</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='pq-social-network' class='space-y-1 text-base'></ul>
                  </div>
                </div>
              </div>`;
  document.getElementById("page_quality").innerHTML = item;
}

function createPageSpeed(data, mobileAudit, desktopAudit) {
  createPageSpeedContainer();
  pageLoadSpeed(data, mobileAudit, desktopAudit);

  let speedAnalysis = document.getElementById("ps-speed-analysis");
  speedAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["server-response-time"].displayValue,
    desktopAudit.audits["server-response-time"].score
  );
  speedAnalysis.innerHTML += createAnalysisSummary(
    data.server.compression.analysis,
    data.server.compression.score
  );
  speedAnalysis.innerHTML += createAnalysisSummary(
    data.protocol.http2.analysis,
    data.protocol.http2.score
  );
  speedAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["render-blocking-resources"].title +
      " (" +
      desktopAudit.audits["render-blocking-resources"].displayValue +
      ")",
    desktopAudit.audits["render-blocking-resources"].score
  );

  measuredMetrics(data, mobileAudit, desktopAudit);
  networkRequestList(data, mobileAudit, desktopAudit);
}

function createPageSpeedContainer() {
  let item = `<div class='flex flex-col gap-3'>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Page Load Speed</p>
                  </div>
                  <div class='px-4 py-2'>
                    <ul id='ps-page-load-speed' class='space-y-1 text-base'></ul>
                  </div>
                  <div class='flex gap-2 px-4 py-2 border-t'><p>Total time:</p> <p id='page-load-total-time' class='text-blue-800'></p></div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Speed Analysis</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='ps-speed-analysis' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Measured Metrics</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='ps-measured-metrics' class='space-y-1 text-base'></ul>
                  </div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-semibold'>
                    <p>Network Requests Diagram</p>
                  </div>
                  <div class='px-4 pt-2 pb-4'>
                    <ul id='ps-network-requests-diagram' class='space-y-1 text-base'></ul>
                  </div>
                </div>
              </div>`;
  document.getElementById("page_speed").innerHTML = item;
}

function pageLoadSpeed(data, mobileAudit, desktopAudit) {
  let pageSpeedLoad = document.getElementById("ps-page-load-speed");

  let pageRenderTime =
    desktopAudit.audits["interactive"].numericValue -
    desktopAudit.audits["first-contentful-paint"].numericValue;
  let firstResponseTime =
    desktopAudit.audits["server-response-time"].numericValue;
  let resourceLoadTime =
    desktopAudit.audits["render-blocking-resources"].numericValue;
  let totalTime = firstResponseTime + resourceLoadTime + pageRenderTime;
  let items = [
    ["First response", firstResponseTime],
    ["Resources Loaded", resourceLoadTime],
    ["Page Rendered", pageRenderTime],
  ];
  let startPoint = 0;

  pageSpeedLoad.innerHTML += "";
  items.forEach(([title, value]) => {
    let currentEnd = (value / totalTime) * 100;
    pageSpeedLoad.innerHTML += getGraphList(
      title,
      `${parseFloat(value / 1000).toFixed(1)}ms`,
      startPoint,
      currentEnd
    );
    startPoint += currentEnd;
  });

  document.getElementById("page-load-total-time").innerHTML += `${parseFloat(
    totalTime / 1000
  ).toFixed(2)} sec`;
}

function getGraphList(title, value, startTime, endTime, color = "primary") {
  let item = ` <div class="items-center gap-1 grid grid-cols-12 text-sm">
    <div class="col-span-3">
      <p class="mb-0 truncate font-medium">${title}</p>
    </div>
    <div class="relative col-span-7 h-2 bg-gray-100 w-full rounded-lg overflow-hidden">
      <div class="absolute w-full h-2 bg-blue-700 top-0 bottom-0" style="width: ${endTime}%; left: ${startTime}%; opacity: 0.75;">
      </div>
    </div>
    <div class="col-span-2">
      <p class="text-end font-medium">${value}</p>
    </div>
  </div>`;
  return item;
}

function measuredMetrics(data, mobileAudit, desktopAudit) {
  let div = document.getElementById("ps-measured-metrics");

  let firstContentfulPaintDV =
    desktopAudit.audits["first-contentful-paint"].displayValue;
  let largestContentfulPaintDV =
    desktopAudit.audits["largest-contentful-paint"].displayValue;
  let speedIndexDV = desktopAudit.audits["speed-index"].displayValue;
  let totalBlockingTimeDV =
    desktopAudit.audits["total-blocking-time"].displayValue;
  let cumulativeLayoutShiftDV =
    desktopAudit.audits["cumulative-layout-shift"].displayValue;
  let timeToInteractiveDV = desktopAudit.audits["interactive"].displayValue;

  div.innerHTML += getGraphList(
    "FCP (First Contentful Paint)",
    firstContentfulPaintDV,
    0,
    10
  );
  div.innerHTML += getGraphList(
    "LCP (Largest Contentful Paint)",
    largestContentfulPaintDV,
    0,
    60
  );
  div.innerHTML += getGraphList("SI (Speed Index)", speedIndexDV, 0, 80);
  div.innerHTML += getGraphList(
    "TBT (Total Blocking Time)",
    totalBlockingTimeDV,
    0,
    10
  );
  div.innerHTML += getGraphList(
    "CLS (Cumulative Layout Shift)",
    cumulativeLayoutShiftDV,
    0,
    0
  );
  div.innerHTML += getGraphList(
    "TTI (Time to Interactive)",
    timeToInteractiveDV,
    0,
    70
  );
}

function networkRequestList(data, mobileAudit, desktopAudit) {
  let networkRequestDiagram = document.getElementById(
    "ps-network-requests-diagram"
  );
  let arrayItems = desktopAudit.audits["network-requests"].details.items;
  let itemsLength =
    desktopAudit.audits["network-requests"].details.items.length;
  let totalTime = 0;

  for (let itemIndex = 0; itemIndex < itemsLength; itemIndex++) {
    if (arrayItems[itemIndex].finished == true) {
      if (totalTime < arrayItems[itemIndex].networkEndTime) {
        totalTime = arrayItems[itemIndex].networkEndTime;
      }
    } else {
      if (totalTime < arrayItems[itemIndex].networkRequestTime) {
        totalTime = arrayItems[itemIndex].networkRequestTime;
      }
    }
  }
  for (let i = 0; i < itemsLength; i++) {
    let currentStart = (arrayItems[i].networkRequestTime / totalTime) * 100;
    let currentEnd = (arrayItems[i].networkEndTime / totalTime) * 100;
    let requestTime =
      arrayItems[i].networkEndTime - arrayItems[i].networkRequestTime;
    networkRequestDiagram.innerHTML += getGraphList(
      arrayItems[i].url,
      formatTimeForRequest(requestTime),
      currentStart,
      currentEnd
    );
  }
}

function formatTimeForRequest(requestTime) {
  if (requestTime < 1000) {
    return parseFloat(requestTime).toFixed(1) + "ms";
  } else if (requestTime > 1000) {
    return parseFloat(requestTime / 1000).toFixed(1) + "s";
  } else if (requestTime > 1000 * 60) {
    return parseFloat(requestTime / (1000 * 60)).toFixed(1) + "min";
  }
}

function createServerConfig(data, mobileAudit, desktopAudit) {
  createServerConfigContainer();
  let serverAnalysis = document.getElementById("server-analysis");

  serverAnalysis.innerHTML = createAnalysisSummary(
    desktopAudit.audits["http-status-code"].title,
    desktopAudit.audits["http-status-code"].score
  );
  serverAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["is-on-https"].title,
    desktopAudit.audits["is-on-https"].score
  );
  serverAnalysis.innerHTML += createAnalysisSummary(
    desktopAudit.audits["redirects"].title,
    desktopAudit.audits["redirects"].score
  );
  serverAnalysis.innerHTML += createAnalysisSummary(
    data.wwwRedirection.analysis,
    data.wwwRedirection.score
  );

  let serverLists = document.getElementById("server-list");
  serverLists.innerHTML += getServerList(data.httpHeader.header);
}

function createServerConfigContainer() {
  let item = `<div class='flex gap-3 flex-col'>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-medium'>Server Analysis</div>
                  <div class='px-4 pt-2 pb-4' id='server-analysis'></div>
                </div>
                <div class='border rounded-lg'>
                  <div class='px-4 py-2 border-b font-medium'>Server Redirection List</div>
                  <div class='overflow-hidden' id='server-list'></div>
                </div>
              </div>`;

  document.getElementById("server_config").innerHTML = item;
}

function getServerList(headers) {
  let listValue = Object.entries(headers);
  let item = "";
  listValue.forEach(([key, value], i) => {
    let spaceBetweenItems = "";
    if (!isNaN(Number(key))) {
      if (i != 0) {
        spaceBetweenItems = "mt-5";
        item += `<div class="flex flex-col justify-center items-center mt-5"> <span class="material-symbols-outlined text-blue-700 text-2xl">arrow_downward</span> <p class='text-sm'>Redirected to</p> </div>`;
      }
      item += `<div class="${spaceBetweenItems} divide-y">`;
      let valueItem = Object.entries(value);
      valueItem.forEach(([title, description]) => {
        item += `<div class="grid grid-cols-6 text-sm font-medium"> <div class="bg-gray-100 col-span-2 capitalize px-4 py-2"> ${title} </div> <div class="col-span-4 px-4 py-2"> <p>${description}</p> </div> </div>`;
      });
      item += `</div>`;
    }
  });
  return item;
}

let messageIndex = 0;
let messages = [
  "Analyzing Website Details...",
  "Analyzing Website Content...",
  "Analyzing Meta Title...",
  "Analyzing Meta Description...",
  "Analyzing HTTP Status...",
  "Analyzing Doctype...",
  "Analyzing Robots.txt...",
  "Analyzing Redirects...",
  "Analyzing Images...",
  "Analyzing Links...",
  "Analyzing Plugins...",
  "Analyzing Page Speed...",
];
function loadinMessage() {
  let item = `<div class="loader-2 w-2/6 mx-auto"></div>
              <div id='message' class='flex mt-2 items-center justify-center'></div>`;
  document.getElementById("loading-message").innerHTML = item;
  messages.map((message, i) => {
    let status = i !== messageIndex ? "hidden" : "";
    document.getElementById(
      "message"
    ).innerHTML += `<div class='${status} transition-all duration-200'>${message}</div>`;
  });
}
loadinMessage();

const myInterval = setInterval(() => {
  messageIndex++;
  let children = document.getElementById("message").children;
  for (var i = 0; i < children.length; i++) {
    if (i === messageIndex) {
      children[i].classList.remove("hidden");
    } else {
      children[i].classList.add("hidden");
    }
  }
}, 4000);

function createOptimisation(data, mobileAudit, desktopAudit) {
  let cssTotal = 0;
  let jsTotal = 0;
  let imageTotal = 0;
  desktopAudit.audits["network-requests"].details.items.forEach((item) => {
    if (item.mimeType != null && item.mimeType != undefined) {
      if (item.mimeType == "text/css") {
        cssTotal += item.transferSize;
      }
      if (item.mimeType == "application/javascript") {
        jsTotal += item.transferSize;
      }
      if (item.mimeType?.includes("image") == true) {
        imageTotal += item.transferSize;
      }
    }
  });

  cssTotal = Math.round(cssTotal / 1024);
  jsTotal = Math.round(jsTotal / 1024);
  imageTotal = Math.round(imageTotal / 1024);

  let cssMinification = Math.round(
    cssTotal -
      desktopAudit.audits["unminified-css"].details?.overallSavingsBytes / 1024
  );
  let jsMinification = Math.round(
    jsTotal -
      desktopAudit.audits["unminified-javascript"].details
        ?.overallSavingsBytes /
        1024
  );
  let cssOptimisation = Math.round(
    cssMinification -
      desktopAudit.audits["unused-css-rules"].details?.overallSavingsBytes /
        1024
  );
  let jsOptimisation = Math.round(
    jsMinification -
      desktopAudit.audits["unused-javascript"].details?.overallSavingsBytes /
        1024
  );
  let imageOptimisation = Math.round(
    imageTotal -
      desktopAudit.audits["uses-optimized-images"].details
        ?.overallSavingsBytes /
        1024
  );

  let cssSavePercentage = (100 * cssOptimisation) / cssTotal;
  let jsSavePercentage = (100 * jsOptimisation) / jsTotal;
  let imageSavePercentage = (100 * imageOptimisation) / imageTotal;

  let listItem = [
    [
      "html",
      "HTML Optimization",
      {
        originalValue: cssTotal,
        minificationValue: cssMinification,
        compressionValue: cssOptimisation,
        chartValue: cssSavePercentage,
      },
    ],
    [
      "css",
      "CSS Optimization",
      {
        originalValue: cssTotal,
        minificationValue: cssMinification,
        compressionValue: cssOptimisation,
        chartValue: cssSavePercentage,
      },
    ],
    [
      "javascript",
      "JavaScript Optimization",
      {
        originalValue: jsTotal,
        minificationValue: jsMinification,
        compressionValue: jsOptimisation,
        chartValue: jsSavePercentage,
      },
    ],
    [
      "image",
      "Image Optimization",
      {
        originalValue: imageTotal,
        minificationValue: jsMinification,
        compressionValue: imageOptimisation,
        chartValue: imageSavePercentage,
      },
    ],
  ];

  let optimisation = document.getElementById("optimisation");
  optimisation.classList.add("grid", "grid-cols-2", "gap-3");
  listItem.forEach(
    ([
      id,
      title,
      { originalValue, minificationValue, compressionValue, chartValue },
    ]) => {
      chartValue = Math.round(100 - chartValue);
      optimisation.innerHTML += createOptimisationCard({
        id,
        title,
        chartColor: "circle-success",
        chartValue,
        originalValue,
        minificationValue,
        compressionValue,
      });
    }
  );
}

function createOptimisationCard({
  id,
  title,
  message,
  chartValue,
  originalValue,
  minificationValue,
  compressionValue,
}) {
  let minificationLabel = "After Minification";
  let status =
    chartValue > 30
      ? chartValue > 70
        ? "stroke-red-400"
        : "stroke-yellow-500"
      : "stroke-green-400";
  let textStatus =
    chartValue > 30
      ? chartValue > 70
        ? "text-red-400"
        : "text-yellow-500"
      : "text-green-400";

  if (chartValue > 0) chartValue = "-" + chartValue;

  if (id == "image") {
    minificationLabel = "After Resize";
  }
  let item = `<div class='rounded-lg overflow-hidden border'>
        <div class="p-2 border-b bg-blue-600/20">
          <p class="text-center font-medium text-sm">${title}</p>
        </div>
        <div class="relative flex w-8/12 mx-auto py-3 text-base">
          <svg viewBox="0 0 36 36" class="w-full">
            <path class="stroke-2 fill-transparent duration-300 transition-all ${status}" style='stroke-linecap: round;' stroke-dasharray="${chartValue}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
          </svg>
          <div class="absolute w-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center ${textStatus}">
            <p class='text-black'>Optimisation</p>
            <p class="text-3xl font-semibold">${chartValue}%</p>
          </div>
        </div>
        <div class="p-2 bg-blue-300">
          <p class="text-center">Optimisation upto ${
            compressionValue ? compressionValue : minificationValue
          } kB</p>
        </div>
        <div class='flex flex-col border divide-y text-sm'>
          <div class="grid grid-cols-5">
            <p class="col-span-3 p-2 text-black">Original</p>
            <p class="col-span-2 p-2 text-right">${originalValue} kB</p>
          </div>`;
  if (minificationValue != undefined && minificationValue != null) {
    item += `<div class="grid grid-cols-5">
                <p class="col-span-3 p-2 text-black">${minificationLabel}</p>
                <p class="col-span-2 p-2 text-right">${minificationValue} kB</p>
              </div>`;
  }
  if (compressionValue != undefined && compressionValue != null) {
    item += `<div class="grid grid-cols-5">
              <p class="col-span-3 p-2 text-black">After Compression</p>
              <p class="col-span-2 p-2 text-right">${compressionValue} kB</p>
            </div>`;
  }

  item += `</div></div>`;
  return item;
}

const sections = document.querySelectorAll("section[id]");
document.getElementById("root").addEventListener("scroll", navHighlighter);

function navHighlighter() {
  let scrollY = document.getElementById("root").scrollTop;
  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    const sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelector(`#tab_${sectionId}`).classList.add("active");
    } else {
      document.querySelector(`#tab_${sectionId}`).classList.remove("active");
    }
  });
}

function generatePDF() {
  const url = document.getElementById("url").value;
  document.getElementById("report_url").innerText = url;
  let currentTime = new Date().toDateString();
  document.getElementById("report_generated").innerText = currentTime;

  const element = document.getElementById("pdf_result");
  const pagebreak = { mode: "css" };
  const filename = "mojha-seo-result.pdf";
  const enableLinks = true;
  const jsPDF = {
    orientation: "landscape",
    unit: "px",
    format: [1366, 768],
    compressPDF: false,
    x: 5,
    y: 5,
    html2canvas: {
      useCORS: true,
    },
  };
  html2pdf()
    .from(element)
    .set({
      filename,
      pagebreak,
      enableLinks,
      jsPDF,
    })
    .save();
}

document.getElementById("pdf_download").onclick = generatePDF;
