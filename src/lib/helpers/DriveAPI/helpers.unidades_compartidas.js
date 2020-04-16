const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const uuid = require('uuid');

const helpers = {};

helpers.crearUnidades = (oauth2, requestId, unidad, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.teamdrives.create({
        resource: {
            name: unidad,
        },
        requestId: requestId,
        fields: '*'
    }).then((success) => {
        req.flash('success', `Se ha creado la unidad correctamente ${unidad}`);
        res.redirect('/profile/create_drive_units');
    }).catch((err) => {
        console.log(err);
    });
}

helpers.crearUnidadesSheet = async (oauth2, unidades, values_admin, values_gestores, values_colaboradores, values_comentadores, values_lectores, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    var admins = Array();
    var gestores = new Array();
    var colaboradores = new Array();
    var lectores = new Array();
    var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
    let ids = new Array();
    var data = new Array();
    // console.log(values_admin[0]);

    for (const i in unidades) {
        var requestId = uuid.v4();
        // console.log(values_admin);
        if(values_admin !=undefined){
            for (const j in values_admin[i]) {                
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                admins[i] = values_admin[i][j].replace(/ /g, "").split(",");
                // console.log(values_admin);
            }
        }else{
            admins.push('vasio');
        }


        if(values_gestores !=undefined){
            for (const j in values_gestores[i]) {                
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                gestores[i] = values_gestores[i][j].replace(/ /g, "").split(",");
                // console.log(values_admin);
            }
        }
      
        
        
        
        data.push(admins,gestores);
        //En la posicion 0 de data irá admins[i] que contendrá los arrays de cada unidad
    
        



    //     var id = service.teamdrives.create({
    //         resource: {
    //             name: unidades[i]
    //         },
    //         requestId: requestId
    //     }).then((result) => {
    //         return result.data.id;
    //     }).catch((err)=>{
    //         console.log(err);
    //     });

    //     ids.push(await id);
    // }
    
    // for (const i in data) {
    //     for (const j in data[i]) {
    //         for (z in data[i][j]) {
    //             // console.log(data[i][j][z]);
    //             await service.permissions.create({
    //                 fileId: ids[i],
    //                 supportsTeamDrives: true,
    //                 resource: {
    //                     role: roles[i],
    //                     type: 'user',
    //                     emailAddress: data[i][j][z]
    //                 }
    //             }).then((result) => {
    //                 console.log(`Se ha añadido a ${data[i][j][z]} en la unidad con id ${ids[i]} y rol ${roles[i]}`);
    //             }).finally(()=>{
    //                 req.flash('success','Se han insertado las unidades compartidas correctamente');
    //                 res.redirect('/profile/create_drive_units');
    //             })
    //         }

    //     }


    }


    console.log(data);













}



helpers.addRolesSheet = async (oauth2, arr, id, type) => {

    const service = google.drive({ version: 'v3', auth: oauth2 });

    for (const key in arr) {
        service.permissions.create({
            fileId: id,
            supportsTeamDrives: true,
            resource: {
                role: type,
                type: 'user',
                emailAddress: arr[key]
            }
        })
    }


}
helpers.borrarUnidades = (oauth2, requestId, unidad, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.teamdrives.delete({
        teamDriveId: unidad,
        requestId: requestId,
        fields: '*'
    }).then((success) => {
        req.flash('success', `Se ha borrado la unidad correctamente ${unidad}`);
        res.redirect('/profile/create_drive_units');
    }).catch((err) => {
        console.log(err);
    });
}





helpers.obtenerDatosUnidades = async (oauth2, parametro) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    var aux = new Array();
    var data = service.teamdrives.list({
        "fields": parametro

    }).then((res) => {
        for (const i in res.data.teamDrives) {
            for (const j in res.data.teamDrives[i]) {
                aux.push(res.data.teamDrives[i][j]);
            }
        }
        return aux;
    });
    return data
}


helpers.addRol = async (oauth2, rol, idUnidad, email, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    service.permissions.create({
        fileId: idUnidad,
        supportsTeamDrives: true,
        resource: {
            role: rol,
            type: 'user',
            emailAddress: email
        }
    }).then((result) => {
        req.flash('success', `Se insertado a ${email} con rango ${rol}`)
        res.redirect('/profile/create_drive_units')
    })
}







module.exports = helpers;
