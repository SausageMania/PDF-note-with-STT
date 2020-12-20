function hide_memo(){
    var form = document.getElementById("form_hide");

    page_num.setAttribute("value", pageNum);
    form.appendChild(page_num);
    form.appendChild(pdfName);

    form.submit();
}
