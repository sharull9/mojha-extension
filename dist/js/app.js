console.log('heelo');



let root = document.getElementById('root');
let tab = document.getElementById('tab');
let childArray = ['overview', 'suggestion', 'summary', 'meta-spec', 'meta-tag', 'seo-heading', 'seo-description', 'page-quality', 'media-seo', 'link-seo', 'search-preview', 'server-config', 'page-speed']

function addChildToRootElement() {

    childArray.map((id, i) => {
        // content container
        let active = i !== 0 ? "hidden" : ''
        root.innerHTML += loader(id, active)

        // tab
        let styles = i == 0 ? "active" : ''
        tab.innerHTML += tabButton(id, styles);
    })


}

addChildToRootElement()


function addEventToTabButton() {
    childArray.map((id, i) => {
        let tab = document.getElementById(`tab_${id.replaceAll('-', '_')}`)
        tab.addEventListener('click', (e) => {
            makeActive(e.target.id)
        })
    })
}

addEventToTabButton()


function tabButton(id, styles) {
    let item = `<button  class="tab ${styles}" id='tab_${id.replaceAll('-', '_')}'>${id.replaceAll('-', ' ')}</button>`
    return item
}



function loader(id, styles) {
    let item = `<div class='w-full h-[488px] grid grid-rows-6 grid-cols-2 gap-2 ${styles}' id='${id.replaceAll('-', '_')}'><div class='animate-pulse rounded-lg bg-gray-200 row-span-3'></div><div class='animate-pulse rounded-lg bg-gray-200 row-span-3'></div><div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div><div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div><div class='animate-pulse col-span-2 rounded-lg bg-gray-200'></div></div>`
    return item;
}


function makeActive(id) {
    childArray.map((child, i) => {
        let button = document.getElementById(`tab_${child.replaceAll('-', '_')}`)
        let div = document.getElementById(child.replaceAll('-', '_'))
        console.log(div, button);
        if (`tab_${child.replaceAll('-', '_')}` == id) {
            button.classList.add('active')
            div.classList.remove('hidden')
        } else {
            button.classList.remove('active')
            div.classList.add('hidden')
        }

    })
}
