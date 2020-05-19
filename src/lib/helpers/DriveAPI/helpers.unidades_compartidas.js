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

    var lectores = new Array();
    var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
    let ids = new Array();
    var data = new Array();
    console.log(values_admin[0]);

    for (const i in unidades) {
        var requestId = uuid.v4();
        // console.log(values_admin);
        if (values_admin != undefined) {
            for (const j in values_admin[i]) {
                //Introducimos cada miembro de la unidad como array ejemplo [miembrosUnidad1][MiembrosUnidad2]
                admins[i] = values_admin[i][j].replace(/ /g, "").split(",");
                // console.log(values_admin);
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

        var id = service.teamdrives.create({
            resource: {
                name: unidades[i]
            },
            requestId: requestId
        }).then((result) => {
            var log 
            log = {
                date: `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
                type:'error',
                ubicacion:'/profile/create_shared_units',
                description:err.errors[0].reason,
                solution:list_errors['errors']['create_shared_drives'][`${err.errors[0].reason}`]['solution'],
                user:nom_usuario
            }
            return result.data.id;
        }).catch((err) => {
            console.log(err);
        });

        ids.push(await id);
    }



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
                    resource: {
                        role: rol,
                        type: 'user',
                        emailAddress: nom_usuario
                    }
                }).then((success) => {
                    var log = new Array();
                    var d = new Date();
                    log = {
                        date: `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
                        type: 'success',
                        ubicacion:'',
                        description:`Se ha insertado correctamente al usuario ${nom_usuario} en ${nom_unidades}`

                    }
                    logs.push(log);

                }).catch((err) => {
                    console.log(list_errors);
                    var d = new Date();
                    var log = new Array();
                    log = {
                        date: `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}:${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
                        type:'error',
                        ubicacion:'/profile/create_shared_units',
                        description:err.errors[0].reason,
                        solution:list_errors['errors']['create_shared_drives'][`${err.errors[0].reason}`]['solution'],
                        user:nom_usuario
                    }
                    logs.push(log);
                });
            }

        }
    }

    switch (logs.length) {
        case 0:
            req.flash('success', 'Se han creado correctamente las unidades compartidas');
            res.redirect('/profile/create_drive_units');

        break;

        default:
        console.log(logs);
            res.render('partials/logs', { logs: logs });

        break;
    }

    

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
