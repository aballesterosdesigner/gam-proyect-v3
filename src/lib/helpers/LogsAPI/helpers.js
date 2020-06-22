const helpers = {};


helpers.insertLogs = async(res)=>{
    var log = {};
    // Res puede ser el error o el array de éxito
    if(res.errors){
         log = {
            "Razon":res.errors[0]["message"],
            "Code:":res.code,
            "type":"error",
            "Url":res.config.url
        }
    }else{
        log = {
           "Type":"success",
           "Razon":"Ha salido todo bien"
        }
    }

    return log;
}



module.exports = helpers;