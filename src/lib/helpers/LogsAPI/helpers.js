const helpers = {};

helpers.insertLogs = async(res,txt)=>{
    // Res puede ser el error o el array de éxito
    if(res.errors){
         var log = {
            "Razon":`${res.errors[0]["message"]} > ${txt}`,
            "Code:":res.code,
            "Type":"error",
            "Url":res.config.url
        }
        return log;
    }else{
        var log = {
           "Type":"success",
           "Razon":txt
        }
        return log;
    }

}


















module.exports = helpers;