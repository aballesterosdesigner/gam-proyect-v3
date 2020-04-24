$(window).on('load',()=>{
    $(".loader").fadeOut("slow");
});
$( "#seeSheetId" ).click(function() {
    var value = $("#sheetId").val();
    var sheetUrl = `https://docs.google.com/spreadsheets/d/${value}/edit#gid=0`
    window.open(sheetUrl, '_blank');
});
$( "#seeDomain" ).click(function() {
    var value = $("#nm-domain").val();
    var opcion = $("#opcion").val();
    var listUsers = "";
    switch (opcion) {
        case "users":
             listUsers = `https://admin.google.com/ac/users?dn=${value}`;
        break;
        case "groups":
            listUsers = `https://admin.google.com/ac/groups?dn=${value}`;
        break;
        case "security":
            listUsers=`https://admin.google.com/${value}/AdminHome?hl=es&dn=hispajuris.es#SecuritySettings:`;
        break;
        case "apps":
            listUsers=`https://admin.google.com/ac/apps?dn=${value}`;
        break;
    
        default:
             listUsers = `https://admin.google.com/ac/home?dn=${value}`;
        break;
    
    }
    window.open(listUsers, '_blank');
});
