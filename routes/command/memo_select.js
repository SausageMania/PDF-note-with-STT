function memo_select(data_number){
    var form = document.getElementById("form_select");
    var num = document.createElement("input");

    num.setAttribute("type", "hidden");
    num.setAttribute("name", "num");
    num.setAttribute("value", data_number);

    form.appendChild(pdfName);
    form.appendChild(num);

    form.submit();
}
