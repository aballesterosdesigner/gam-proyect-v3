const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const uuid = require('uuid');
const list_errors = require('../../json_resources/list_errors.json');
const helpers = {};
const hp_logs = require('../LogsAPI/helpers');
var fs = require('fs');
helpers.crearUnidades = async (oauth2, unidades, req, res) => {


    const service = google.drive({ version: 'v3', auth: oauth2 });
    for (const i in unidades) {
        var requestId = uuid.v4();
        var UnitName = unidades[i];
        if (await helpers.unidadExiste(oauth2, UnitName) != true) {
            var logs = await service.teamdrives.create({
                resource: {
                    name: UnitName

                },
                requestId: requestId
            }).then(async (res) => {
                fs.appendFile('logs.txt', `[SUCCESS]: La unidad "${UnitName}" ha sido creada\n`, (err) => {});
            });
        } else {
            fs.appendFile('logs.txt', `[WARNING]: La unidad "${UnitName}" ya existe\n`, (err) => {});
        }
    }
}



helpers.crearUnidadesSheet = async (oauth2, unidades, values_admin, values_gestores, values_colaboradores, values_comentadores, values_lectores, req, res) => {
    const fs = require('fs');






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
    var fecha = `${d.getDay()}/${d.getMonth()}/${d.getUTCFullYear()}-${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}:${d.getMilliseconds()}`;

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
            const permissions = await service.permissions.list({
                fileId: id_unidad,
                fields: 'permissions(id,emailAddress)',
                supportsTeamDrives: true,

            }).then(async (res) => {
                for (const key in res.data.permissions) {
                    if (res.data.permissions[key].emailAddress != 'a.ballesteros@demo.hispacolextech.com') {
                        var log = await service.permissions.delete({
                            fileId: id_unidad,
                            supportsTeamDrives: true,
                            permissionId: res.data.permissions[key].id
                        }).then(async (res) => {

                        }).catch(async (err) => {
                            console.log(err);
                        })
                    }
                }



            }).finally(async () => {
                var on = true;
                if (on != false) {
                    for (const i in data) {
                        var rol = roles[i];


                        for (const j in data[i]) {


                            var nom_unidades = unidades[j];
                            var id = ids[j];
                            for (const k in data[i][j]) {
                                var nom_usuario = data[i][j][k];
                                var log = await service.permissions.create({
                                    fileId: id_unidad,
                                    supportsTeamDrives: true,
                                    sendNotificationEmail: false,
                                    resource: {
                                        role: rol,
                                        type: 'user',
                                        emailAddress: nom_usuario
                                    }
                                }).then((success) => {
                                    fs.appendFile('logs.txt', `[SUCCESS] ${fecha}: Se está volviendo a insertar el usuario ${nom_usuario} con rol ${rol} en la unidad ${nom_unidades}\n`, function (err) {
                                        if (err) throw err;
                                        console.log('File is created successfully.');
                                    });
                                }).catch((err) => {
                                    if (err.errors[0]["reason"] === "cannotShareTeamDriveWithNonGoogleAccounts") {
                                        fs.appendFile('logs.txt', `[ERROR] ${fecha}: Usuario no añadido: El usuario ${nom_usuario} en la unidad ${nom_unidades} no existe con rol ${rol}\n`, function (err) {
                                            if (err) throw err;
                                            console.log('File is created successfully.');
                                        });
                                    }
                                });
                            }

                        }
                    }
                }



            }).catch((err) => {
                console.log(err);
            });






        } else {

            var id = await service.teamdrives.create({
                resource: {
                    name: unidades[i]
                },
                requestId: requestId
            }).then(async (result) => {
                fs.appendFile('logs.txt', `[SUCCESS] ${fecha}: Se ha creado la unidad ${unidades[i]}\n`, function (err) {
                    if (err) throw err;
                    console.log('File is created successfully.');
                });

                console.log(`Se ha insertado la unidad ${unidades[i]}`);
                for (const i in data) {
                    var rol = roles[i];
                    for (const j in data[i]) {
                        var nom_unidades = unidades[j];
                        var id = ids[j];
                        for (const k in data[i][j]) {
                            var nom_usuario = data[i][j][k];
                            await service.permissions.create({
                                fileId: result.data.id,
                                supportsTeamDrives: true,
                                sendNotificationEmail: false,
                                resource: {
                                    role: rol,
                                    type: 'user',
                                    emailAddress: nom_usuario
                                }
                            }).then((success) => {
                                fs.appendFile('logs.txt', `[SUCCESS] ${fecha}: El usuario ${nom_usuario} Se ha insertado con rol ${rol} en la unidad ${nom_unidades}\n`, function (err) {
                                    if (err) throw err;
                                    console.log('File is created successfully.');
                                });

                                console.log(``)
                            }).catch((err) => {
                                if (err.errors[0].reason === "cannotShareTeamDriveWithNonGoogleAccounts") {
                                    fs.appendFile('logs.txt', `[ERROR] ${fecha}:El usuario ${nom_usuario} no existe, localizado en la unidad ${nom_unidades} con rol ${rol}\n`, function (err) {
                                        if (err) throw err;
                                        console.log('File is created successfully.');
                                    });

                                }

                            });
                        }

                    }
                }
            }).catch((err) => {
                //No se ha insertado la unidad
                console.log(`No se ha insertado la unidad ${unidades[i]}`);
            })

            ids.push(await id);
        }

    }



    if (unidad_existe != true) {

        // logs.push(log_permissions);

    }

    // console.log(logs);
    // res.render('logs/main',{logs:logs});



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
                type: 'global',
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
        for (const j in permissions.data[i]) {
            console.log(permissions.data[i].id)
        }

    }
    return res;
}
helpers.addRol = async (oauth2, unidades, rol, array, req, res) => {
    console.log(`Creando a los ${rol}`);
    const service = google.drive({ version: 'v3', auth: oauth2 });
    for (var i in unidades) {
        var idUnidad = await helpers.obtainIdByName(oauth2, unidades[i]);
        if(array[0]!=undefined){
            if(array[0][i] === undefined){
            }else{
                  for (var j in array[0][i]) {
               console.log(`En la unidad ${unidades[i]} con Id: ${idUnidad} se van a añadir los ${rol}: ${array[0][i][j]}`);
               await service.permissions.create({
                   fileId: idUnidad,
                   supportsTeamDrives: true,
                   sendNotificationEmail: false,
                   resource: {
                       role: rol,
                       type: 'user',
                       emailAddress: array[0][i][j]
                   }
               })
                   .then(async(res) => {
                       fs.appendFile('logs.txt', `[SUCCESS]: El usuario ${array[0][i][j]} se ha creado correctamente\n`, (err) => {});
                   })
                   .catch((err) => {   
                       fs.appendFile('logs.txt', `[ERROR]: Creando al usuario ${array[0][i][j]}: ${err.errors[0].reason}\n`, (err) => {});
                   })  
           } 
            }
        }
//         console.log(await array[0][i]===undefined);
        
      
    }
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


helpers.controlUndefined = async (values) => {
    if (values === undefined) {
        return true;
    }
    return false;
}

helpers.splitArray = (array) => {
    var res = new Array();
    for (const i in array) {
        if (array[i].length != 0) {
            for (const j in array[i]) {
                if (array[i][j] != undefined) {
                    res.push(array[i][j].replace(/ /g, "").split(","));
                } else {
                    var aux = new Array();
                    res.push(aux);
                }
            }

        } else {
            var aux = new Array();
            res.push(aux);
        }
    }

    return res;


}

helpers.deleteAllRoles = async (IdUnidad, emailAddress, oauth2, rol, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });

    const permissions = await service.permissions.list({
        fileId: IdUnidad,
        fields: '*',
        supportsTeamDrives: true,
        useDomainAdminAccess: true
    });

    for (var i in permissions.data.permissions) {
        if (permissions.data.permissions[i].emailAddress != 'a.ballesteros@demo.hispacolextech.com' && permissions.data.permissions[i].role === rol) {
            await service.permissions.delete({
                permissionId: permissions.data.permissions[i].id,
                fileId: IdUnidad,
                fields: '*',
                useDomainAdminAccess: false,
                supportsTeamDrives: true,
                emailAddress: permissions.data.permissions[i].emailAddress
            }).then((res) => {
                console.log(`Se han eliminado ${permissions.data.permissions[i].emailAddress}`)
            }).catch((err) => {
                console.log(err);
            });
        }

    }

}


helpers.userIsCreated = async (emailAddress, IdUnidad, oauth2) => {
}

helpers.obtenerIdPermission = async (emailAddress, IdUnidad, rol, oauth2) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    const permissions = await service.permissions.list({
        fileId: IdUnidad,
        fields: 'permissions(id,emailAddress,role)',
        supportsTeamDrives: true
    });

    for (var i in permissions.data.permissions) {
        if (permissions.data.permissions[i].emailAddress === emailAddress) {
            return permissions.data.permissions[i].id;
        }


    }
}
helpers.writeLogs = async (msg) => {
 
}
helpers.updateRole = async (oauth2, IdUnidad, permissionId, role, emailAddress, req, res) => {
    const service = google.drive({ version: 'v3', auth: oauth2 });
    if (role === "organizer") {
        helpers.deleteAllRoles(IdUnidad, emailAddress, oauth2, role, req, res)
    } else {
        await service.permissions.update({
            fileId: IdUnidad,
            permissionId: permissionId,
            auth: oauth2,
            supportsTeamDrives: true,
            fields: '*',
            useDomainAdminAccess: true,
            resource: {
                role: role
            }
        }).then(() => {
            console.log('Updateado correctamente')
        });
    }

}

// return permissions.data.permissions;





module.exports = helpers;
