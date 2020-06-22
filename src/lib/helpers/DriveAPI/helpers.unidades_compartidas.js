const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const uuid = require('uuid');
const list_errors = require('../../json_resources/list_errors.json');
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
    var comentadores = new Array();
    var logs = new Array();
    var d = new Date();
    var lectores = new Array();
    var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
    let ids = new Array();
    var data = new Array();

    for (const i in unidades) {
        var requestId = uuid.v4();
        // console.log(values_admin);
        if (values_admin != undefined) {
            for (const j in values_admin[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                admins[i] = values_admin[i][j].replace(/ /g, "").split(",");
            }
        } else {
            admins.push('vasio');
        }


        if (values_gestores != undefined) {
            for (const j in values_gestores[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                gestores[i] = values_gestores[i][j].replace(/ /g, "").split(",");
            }
        }


        if (values_colaboradores != undefined) {
            for (const j in values_colaboradores[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                colaboradores[i] = values_colaboradores[i][j].replace(/ /g, "").split(",");
            }
        }










        if (values_comentadores != undefined) {
            for (const j in values_comentadores[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                comentadores[i] = values_comentadores[i][j].replace(/ /g, "").split(",");
            }
        }


        if (values_lectores != undefined) {
            for (const j in values_lectores[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                lectores[i] = values_lectores[i][j].replace(/ /g, "").split(",");
            }
        }

        data[0] = admins;
        data[1] = gestores;
        data[2] = colaboradores;
        data[3] = comentadores;
        data[4] = lectores;

        //En la posicion 0 de data irá admins[i] que contendrá los arrays de cada unidad
        var unidad_existe = await helpers.unidadExiste(oauth2, unidades[i]);


        /* Si la unidad existe no la crearemos */
        if (unidad_existe == true) {
            var id_unidad = await helpers.obtainIdByName(oauth2, unidades[i][0]);
            var log = helpers.createLog('warning', `Ya existe la unidad compartida ${unidades[i][0]}`, '', '');
            logs.push(log);

            
            const permissions = await service.permissions.list({
                fileId: id_unidad,
                fields: '*',
                supportsTeamDrives: true,
            
            }).then((res)=>{
                for (const key in res.data.permissions) {
                    if(res.data.permissions[key].role!="organizer"){
                         service.permissions.delete({
                             fileId:id_unidad,
                             supportsTeamDrives:true,
                             permissionId:res.data.permissions[key].id
                         }).then(()=>{
                         
                
                         }).catch((err)=>{
                            var log = helpers.createLog('error', `Ya ha sido eliminado o no se puede eliminar ${res.data.permissions[key].emailAddresss}`, 'sadasd', '');
                            logs.push(log);
                
                         })
                      
                    }
                }
            }).finally(async()=>{


                for (const i in data) {
                    var rol = roles[i];
                    for (const j in data[i]) {
                        var nom_unidades = unidades[j];
                        var id = ids[j];
                        for (const k in data[i][j]) {
                            var nom_usuario = data[i][j][k];
                            await service.permissions.create({
                                fileId: id_unidad,
                                supportsTeamDrives: true,
                                sendNotificationEmail: false,
                                resource: {
                                    role: rol,
                                    type: 'user',
                                    emailAddress: nom_usuario
                                }
                            }).then((success) => {
                                var fecha = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                var log = helpers.createLog('success', `Se ha insertado correctamente al usuario ${nom_usuario} en ${nom_unidades}`, '', '');
                                logs.push(log);

                            }).catch((err) => {
                                // console.log(list_errors);
                                var fecha = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                var log = helpers.createLog(fecha, 'error', err.errors[0].reason, list_errors['errors']['create_shared_drives'][`${err.errors[0].reason}`]['solution'], nom_usuario);
                                logs.push(log);
                            });
                        }
        
                    }
                }



            });




            

        } else {
            var id = service.teamdrives.create({
                resource: {
                    name: unidades[i]
                },
                requestId: requestId
            }).then((result) => {
                var log = helpers.createLog('success', `Se ha creado correctamente ${unidades[i][0]}`, '', '');
                logs.push(log);
                return result.data.id;
            }).catch((err) => {
                console.log(err);
            });

            ids.push(await id);
        }

    }



    if (unidad_existe != true) {
        for (const i in data) {
            var rol = roles[i];
            for (const j in data[i]) {
                var nom_unidades = unidades[j];
                var id = ids[j];
                for (const k in data[i][j]) {
                    var nom_usuario = data[i][j][k];
                    await service.permissions.create({
                        fileId: id,
                        supportsTeamDrives: true,
                        sendNotificationEmail: false,
                        resource: {
                            role: rol,
                            type: 'user',
                            emailAddress: nom_usuario
                        }
                    }).then((success) => {
                        var fecha = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                        var log = helpers.createLog('success', `Se ha insertado correctamente al usuario ${nom_usuario} en ${nom_unidades}`, '', '');
                        logs.push(log);

                    }).catch((err) => {
                        // console.log(list_errors);
                        var fecha = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                        var log = helpers.createLog(fecha, 'error', err.errors[0].reason, list_errors['errors']['create_shared_drives'][`${err.errors[0].reason}`]['solution'], nom_usuario);
                        logs.push(log);
                    });
                }

            }
        }
    }

    switch (logs.length) {
        case 0:
            req.flash('success', 'Se han creado correctamente las unidades compartidas');
            res.redirect('/profile/create_drive_units');

            break;

        default:
            res.render('partials/logs', { logs: logs });
            break;
    }



}

helpers.unidadExiste = async (oauth2, name) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    var existe = false;
    const drives = await service.teamdrives.list({
        fields: 'teamDrives(name)'
    });
    for (const i in drives.data.teamDrives) {
        if (drives.data.teamDrives[i].name == name) {
            existe = true;
        }
    }

    return existe;
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
    })
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

/*
    var usuarios_unidades =  ['C1','C2','C3']


*/

helpers.obtainIdByName = async (oauth2, name) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    const drives = await service.teamdrives.list({ fields: 'teamDrives(name,id)' });
    var res = '';
    // console.log(drives.data);
    for (const i in drives.data) {
        for (const j in drives.data[i]) {
            var id = drives.data[i][j].id;
            var drive = drives.data[i][j].name;
            /* Si el nombre de la unidad es igual al nombre de la unidad a comparar obtenemos el id */
            if (drive == name) {
                res = id;
            }
        }
    }

    return res;

}

helpers.listPermissions = async (oauth2, fileId) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    var res = new Array();
    const permissions = await service.permissions.list({
        fileId: fileId,
        fields: '*',
        supportsTeamDrives: true,
    });

    for (const i in permissions.data) {
        for(const j in permissions.data[i]){
            console.log(permissions.data[i].id)
        }
        
    }
    return res;
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


helpers.createLog = (type, description, solution, user) => {
    var d = new Date();

    var fecha = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    var log = {
        date: fecha,
        type: type,
        description: description,
        solution: '',
        user: ''
    }


    return log;

}





module.exports = helpers;
