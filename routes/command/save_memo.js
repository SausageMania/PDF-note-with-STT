function save_memo(data_title, data_memo){
    var form = document.getElementById("form_memo");
    var title = document.createElement("input");
    var memo = document.createElement("input");

    var title_data = btoa(encodeURIComponent(data_title));
    var memo_data = btoa(encodeURIComponent(data_memo));

    title.setAttribute("type", "hidden");
    title.setAttribute("name", "title");
    title.setAttribute("value", title_data);

    page_num.setAttribute("value", pageNum);
    posX.setAttribute("value", edit_width);
    posY.setAttribute("value", edit_height);

    var memo_content = edit_width + "/" + edit_height + "/" + pageNum + "/" + data_memo;
    memo_content = btoa(encodeURIComponent(memo_content));

    memo.setAttribute("type", "hidden");
    memo.setAttribute("name", "memo");
    memo.setAttribute("value", memo_content);

    form.appendChild(pdfName);
    form.appendChild(title);
    form.appendChild(memo);
    form.appendChild(page_num);
    form.appendChild(posX);
    form.appendChild(posY);


    form.submit();
}
