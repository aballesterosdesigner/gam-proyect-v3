$(window).on('load',()=>{
    $(".loader").fadeOut("slow");
});
$( "#seeSheetId" ).click(function() {
    var value = $("#sheetId").val();
    var sheetUrl = `https://docs.google.com/spreadsheets/d/${value}/edit#gid=0`
    window.open(sheetUrl, '_blank');

});
