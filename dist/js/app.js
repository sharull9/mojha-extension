console.log('heelo');



let root = document.getElementById('root');

function addChildToRootElement() {
    let childArray = ['overview', 'suggestion', 'summary', 'meta-spec', 'meta-tag', 'seo-heading', 'seo-description', 'page-quality', 'media-seo', 'link-seo', 'search-preview', 'server-config', 'page-speed']

    childArray.map((child) => {
        let div = document.createElement("div")
        div.style.height = "50px"
        // div.innerHTML = loader(child)
        div.innerHTML = tabButton(child)
        div.id = child
        root.appendChild(div);
    })
}

addChildToRootElement()



// function loader() {
//     let item = `<div class="max-w-sm animate-pulse h-10 bg-gray-400 rounded-lg"></div>`
//     return item
// }

function tabButton(title) {
    let item = `<div class="max-w-sm animate-pulse h-10 bg-gray-400 rounded-lg">${title}</div>`
    return item
}