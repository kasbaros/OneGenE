var ourButton = document.getElementById("btn");
var ourButton2 = document.getElementById("btn2");

var x = document.getElementById("txt1");
var y = document.getElementById("txt2");

ourButton.addEventListener("click", searchDataString);
ourButton2.addEventListener("click", searchDataString);

function searchDataString(){
    var values = $(x).val();
    var result = JSON.stringify(values);
    alert(result);
	
}


function setForm(value) {

    if(value == 'form1'){
        document.getElementById('form1').style='display:block;';
        document.getElementById('form2').style='display:none;';
    }
    else {

        document.getElementById('form2').style = 'display:block;';
        document.getElementById('form1').style = 'display:none;';
    }}

