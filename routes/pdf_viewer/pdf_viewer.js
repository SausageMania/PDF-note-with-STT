var pdf_width, pdf_height;
var topbar = document.getElementById("top-bar");
var topbar_width;
var first_scale = true;
var ratio, w_ratio = 0, h_ratio = 0;

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    console.log(document.body.getBoundingClientRect().height);
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0px";
    console.log(document.body.getBoundingClientRect().height);
}

var url = '<%=pdf%>';
url = url.replace(/&amp;/gi,"&");
let pdfDoc = null,
    pageNum = parseInt("<%=pageNum%>"),
    pageIsRendering = false,
    pageNumIsPending = null;

let scale = 1,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num).then(page => {
        // Set scale
        var viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        w_ratio = (screen_width / canvas.width).toFixed(1);
        h_ratio = (screen_height/ canvas.height).toFixed(1);
        ratio = w_ratio > h_ratio ? h_ratio : w_ratio;
        if(first_scale){
            scale = ratio;
            first_scale = false;
        }
        console.log(scale);

        viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector('#page-num').textContent = num;
        page_num.value = pageNum;
        console.log(page_num);

        divX = pdf_render.offsetLeft;
        divY = pdf_render.offsetTop;
        pdf_height = pdf_render.getBoundingClientRect().height;
        pdf_width = pdf_render.getBoundingClientRect().width;

        topbar_width = topbar.getBoundingClientRect().width
        topbar.style.width = topbar_width + "px";

    });
};

const enlargePage = () =>{
    scale = parseFloat(scale) + 0.1;
    pdfDoc.getPage(pageNum).then(page => {
        // Set scale

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderCtx = {
            canvasContext: ctx,
            viewport
        };


        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector('#page-num').textContent = pageNum;
        page_num.value = pageNum;

        divX = pdf_render.offsetLeft;
        divY = pdf_render.offsetTop;
        pdf_height = pdf_render.getBoundingClientRect().height;
        pdf_width = pdf_render.getBoundingClientRect().width;

        if(topbar_width < pdf_width){
            topbar.style.width = pdf_width + "px";
        }
    });

    console.log(topbar.style.width);
};

const reducePage = () =>{
    if(scale>0.11)
        scale -= 0.1;
    pdfDoc.getPage(pageNum).then(page => {
        // Set scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        // Output current page
        document.querySelector('#page-num').textContent = pageNum;
        page_num.value = pageNum;

        divX = pdf_render.offsetLeft;
        divY = pdf_render.offsetTop;
        pdf_height = pdf_render.getBoundingClientRect().height;
        pdf_width = pdf_render.getBoundingClientRect().width;

        console.log(topbar_width + " " + pdf_width);
        if(topbar_width > pdf_width){
            topbar.style.width = topbar_width + "px";
        }
        else
            topbar.style.width = pdf_width + "px";
    });
}

// Check for pages rendering
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show Prev Page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    page_num.value = pageNum;
    console.log(page_num);
    queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    page_num.value = pageNum;
    console.log(page_num);
    queueRenderPage(pageNum);
};

// Get Document
pdfjsLib
    .getDocument(url)
    .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
})
    .catch(err => {
        // Display error
        const div = document.createElement('div');
        div.className = 'error';
        div.appendChild(document.createTextNode(err.message));
        document.querySelector('body').insertBefore(div, canvas);
        // Remove top bar
        document.querySelector('.top-bar').style.display = 'none';
    });

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
document.querySelector('#enlarge-page').addEventListener('click', enlargePage);
document.querySelector('#reduce-page').addEventListener('click', reducePage);
