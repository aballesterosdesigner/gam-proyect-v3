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
    var admins = new Array();
    var gestores = new Array();
    var colaboradores = new Array();
    var lectores = new Array();

    var data = new Array();


    for (const i in unidades) {
        var requestId = uuid.v4();

        admins = values_admin[i][0].split(','); 
        gestores = values_gestores[i][0].split(',');
        colaboradores = values_colaboradores[i][0].split(',');
        comentadores = values_comentadores[i][0].split(',');
        lectores = values_lectores[i][0].split(',');

        var roles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
        data.push(admins, gestores, colaboradores, comentadores, lectores);



        service.teamdrives.create({
            resource: {
                name: unidades[i]
            },
            requestId: requestId,
            fields: '*'
        }).then(async (result) => {
            var type_rol = '';

            // Añadimos los administradores
            for (const j in data) {
                switch (data[j].length) {
                    case 0:

                        break;

                    default:
                        for (const z in data[j]) {
                            await service.permissions.create({
                                fileId: result.data.id,
                                supportsTeamDrives: true,
                                resource: {
                                    role: roles[j],
                                    type: 'user',
                                    emailAddress: data[j][z]
                                }
                            }).then((suc) => {
                                console.log('tutto benne')
                            }).catch((er) => {
                                console.log(er);
                            });

                        }
                        break;
                }


            }

        }).finally(() => {
            // req.flash('success', 'Se han creado todas las unidades y sus respectivos permisos');
            // res.redirect('/profile/create_drive_units');
        })
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
