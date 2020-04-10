const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};

/* Mostrar usuarios de un dominio */
helpers.dataUsers = async (oauth2, dominio, req, res) => {
    const admin = google.admin({ version: 'directory_v1', auth: oauth2 });

    var users = admin.users.list({
        domain:dominio
    }).then((result)=>{
       return result;
    }).catch((err)=>{
        console.log(err);
        return err.code;
    });

    return users;
}


helpers.isNotEnrolledIn2Sv = async (oauth2,data_users,req,res) =>{
    var result = new Array;
    for(key in data_users.data.users){
         if(data_users.data.users[key].isEnrolledIn2Sv == false){
            result.push(data_users.data.users[key].primaryEmail);
        }
    }
    return result;
 }




helpers.activarDobleVerificacion = async (oauth2, email,req,res) => {
    const admin = google.admin({ version:'directory_v1', auth: oauth2 });
    admin.users.patch({
        userKey:email,
        fields:'*',
        resource:{
            isEnrolledIn2Sv:true,
            isEnforcedIn2Sv:true,
        }        
    }).then((success)=>{
        console.log('Ha ido bien')
    }).catch((err)=>{

        console.log(err);
    });
}




module.exports = helpers;