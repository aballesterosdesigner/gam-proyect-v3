const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const pool = require('../../../database');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const helpers = {};
const hp_logs = require('../../../lib/helpers/LogsAPI/helpers');
const hp_sheets = require('../../../lib/helpers/SheetAPI/hp.sheets');

const fs = require('fs');


/* Mostrar usuarios de un dominio */
helpers.dataUsers = async (oauth2, dominio, req, res) => {
    const admin = google.admin({ version: 'directory_v1', auth: oauth2 });

    var users = admin.users.list({
        domain: dominio
    }).then((result) => {
        return result;
    }).catch((err) => {
        console.log(err);
        return err.code;
    });
    return users;
}


helpers.usersByFields = async (oauth2, domain, fields) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const dat = await service.users.list({
        domain: domain,
        fields: fields
    });

    return dat.data.users;
}


helpers.isNotEnrolledIn2Sv = async (oauth2, data_users, req, res) => {
    var result = new Array;
    for (key in data_users.data.users) {
        if (data_users.data.users[key].isEnrolledIn2Sv == false) {
            result.push(data_users.data.users[key].primaryEmail);
        }
    }
    return result;
}




helpers.activarDobleVerificacion = async (oauth2, email, req, res) => {
    const admin = google.admin({ version: 'directory_v1', auth: oauth2 });
    admin.users.patch({
        userKey: email,
        fields: '*',
        resource: {
            isEnrolledIn2Sv: true,
            isEnforcedIn2Sv: true,
        }
    }).then((success) => {
        console.log('Ha ido bien')
    }).catch((err) => {

        console.log(err);
    });
}
helpers.forzarPass = async (oauth2, users, activado, req, res) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    let result;
    console.log(users);
    await service.users.update({
        userKey: users,
        resource: {
            changePasswordAtNextLogin: activado
        }
    }).then((res) => {
        console.log('success');
    }).catch((err) => {
        console.log(err);
    });


}


helpers.userExist = async (user, domain, oauth2) => {
    //console.log(`[INFO] Se está comprobando si el usuario ${user} existe en el dominio ${domain}`);
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const dat = await service.users.list({ domain: domain, fields: '*' });
    const users = dat.data.users;
    var user_existe = false;
    for (const key in users) {
        if (users[key].primaryEmail === user) {
            user_existe = true;
        }


    }

    return user_existe;
};


helpers.createUsers = async (oauth2, domain, correos, nombres, apellidos, telefonos, sheetId) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var checkCorreos = await helpers.checkIsUndefined(correos);
    var checkNombres = await helpers.checkIsUndefined(nombres);
    var checkApellidos = await helpers.checkIsUndefined(apellidos);
    var checkTelefonos = await helpers.checkIsUndefined(telefonos);
    var d = new Date();
    console.log(correos);
    var fecha = `${d.getUTCDay()}/${d.getUTCMonth()}/${d.getFullYear()}`;
    console.log(fecha);
    var logs = new Array();


    if (checkCorreos === true && checkNombres === true && checkApellidos === true && checkTelefonos === true) {
        for (const i in correos) {
            var checkCorreo = await helpers.checkIsUndefined(correos[i]);
            var checkNombre = await helpers.checkIsUndefined(nombres[i]);
            var checkApellido = await helpers.checkIsUndefined(apellidos[i]);
            var passAl = await helpers.generatePassword(10);
            var tlf = ``;
            if (checkCorreo === true && checkNombre === true && checkApellido === true) {
                var userExist = await helpers.userExist(correos[i][0], domain, oauth2);
                if (userExist != true) {
                    var domainUndefined = await helpers.unValidDomain(correos[i][0].split('@')[1], domain);
                    if (telefonos[i] != undefined) {
                        tlf = telefonos[i][0];
                    }
                    var log = await service.users.insert({
                        resource: {
                            name: {
                                familyName: `${apellidos[i][0]}`,
                                givenName: `${nombres[i][0]}`,
                            },
                            primaryEmail: correos[i][0],
                            password: `${passAl}`,
                            recoveryPhone: ``,
                            phones: [{
                                value: `${tlf}`,
                                type: 'work'
                            }]
                        },
                    }).then(async (res) => {
                        var newUser = {
                            email: res.data.primaryEmail,
                            nombre: nombres[i][0],
                            apellidos: apellidos[i][0],
                            pass: passAl
                        };
                        var newLog = {
                            fecha: d,
                            type: 'Success',
                            motivo: `Se ha insertado correctamente al usuario ${correos[i][0]} con pass ${passAl}`,
                            modulo: 'Users'
                        }

                        await pool.query('INSERT usuarios SET ?', [newUser]);
                        await pool.query('INSERT logs SET ?', [newLog]);

                        //    return hp_logs.insertLogs(res, `El usuario ${correos[i][0]} ha sido creado con contraseña ${passAl}`, 'success');

                    }).catch(async (err) => {

                        var newLog = {
                            fecha: d,
                            type: 'error',
                            motivo: `${correos[i][0]}:${err}`,
                            modulo: 'Users'
                        }
                        await pool.query('INSERT INTO logs SET ?', [newLog]);
                        // return await hp_logs.insertLogs(err);
                    });

                    await logs.push(log);
                } else {
                    var newLog = {
                        fecha: d,
                        type: 'Warning',
                        motivo: `El usuario ${correos[i][0]} Ya existe`,
                        modulo: 'Users'
                    }
                    await pool.query('INSERT INTO logs SET ?', [newLog]);
                    // await fs.appendFile('logsUsersCreate.txt', `El usuario ${correos[i][0]} Ya existe\n`, (err) => { });
                    // logs.push(await hp_logs.insertLogs('', `El usuario ${correos[i][0]} Ya existe`, 'warning'));
                }
            } else {
                var newLog = {
                    fecha: d,
                    type: 'Warning',
                    motivo: `Hay algun campo vacio obligatorio para la fila ${parseInt(i) + 2}`,
                    modulo: 'Users'
                }
                await pool.query('INSERT INTO logs SET ?', [newLog]);
                logs.push(await hp_logs.insertLogs('', `Hay algun campo vacio obligatorio para la fila ${parseInt(i) + 2}`));
            }
        }
    } else {
        var newLog = {
            fecha: d,
            type: 'Warning',
            motivo: `Hay algun campo vacio obligatorio para la fila ${parseInt(i) + 2}`,
            modulo: 'Users'
        }
        console.log(`Hay algun campo vacio obligatorio para la fila ${parseInt(i) + 2}`)
    }
    return logs;
}



helpers.insertAlias = async (oauth2, correos, alias, sheetId) => {
    var logs = new Array();
    var d = new Date();
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    for (const i in correos) {
        var checkAlias = await helpers.checkIsUndefined(alias);
        if (checkAlias === true) {
            if (alias[i] != undefined) {
                var aux_alias = new Array();
                if (alias[i][0] != undefined) {

                    aux_alias = alias[i][0].replace(/ /g, "").split(",");
                }
                for (const j in aux_alias) {
                    var log = await service.users.aliases.insert({
                        userKey: correos[i][0],
                        resource: { alias: aux_alias[j] }
                    }).then(async (result_alias) => {
                        var newLog = {
                            fecha: d,
                            type: 'Success',
                            motivo: ` Se ha insertado a ${correos[i]} El alias ${aux_alias[j]}`,
                            modulo: 'Alias'
                        }
                        await pool.query('INSERT INTO logs SET ?', [newLog]);

                        //El alias se ha insertado correctamente
                        await fs.appendFile('logsAlias.txt', `[Success] Se ha insertado a ${correos[i]} El alias ${aux_alias[j]} \n`, (err) => { });
                        return hp_logs.insertLogs(result_alias, `Se ha insertado el alias ${aux_alias[j]} al usuario ${correos[i][0]}`, 'success');

                    }).catch(async (err) => {
                        var newLog = {
                            fecha: d,
                            type: 'Error',
                            motivo: ` El alias ${aux_alias[j]} no ha sido creado en el usuario ${correos[i][0]} ${err.errors[0]["reason"]}`,
                            modulo: 'Alias'
                        }
                        await pool.query('INSERT INTO logs SET ?', [newLog]);
                        switch (err.errors[0]["reason"]) {
                            case 'duplicate':
                                fs.appendFile('logsAlias.txt', `[Warning] El alias ${aux_alias[j]} no ha sido creado en el usuario ${correos[i][0]} ${err.errors[0]["reason"]}\n`, (err) => { });
                                return hp_logs.insertLogs('', `El alias ${aux_alias[j]} no ha sido creado en el usuario ${correos[i][0]} ${err.errors[0]["reason"]}`, 'warning');
                                break;

                            default:
                                fs.appendFile('logsAlias.txt', `[ERROR]: El alias ${aux_alias[j]} no ha sido creado en ${correos[i][0]}${err.errors[0]["reason"]}\n`, (err) => { });
                                return hp_logs.insertLogs(err, `[ERROR]: El alias ${aux_alias[j]} no ha sido creado en ${correos[i][0]} ${err.errors[0]["reason"]}`);
                                break;
                        }

                    });


                }
            }
        } else {
            var newLog = {
                fecha: d,
                type: 'Warning',
                motivo: `La columna de alias no puede estar vacia en la fila ${parseInt(i) + 2}`,
                modulo: 'Alias'
            }
            await pool.query('INSERT INTO logs SET ?', [newLog]);
            // fs.appendFile('logsAlias.txt', `[Warning] La columna de alias no puede estar vacia en la fila ${parseInt(i)+2}\n`, (err) => { });

        }
    }
    return logs;
}
helpers.checkIsUndefined = async (array) => {
    if (array === undefined) {
        return false;
    } else {
        if (array[0] === undefined) {
            return false;
        }
        return true;


    }
}

helpers.obtenerFecha = async () => {
    var d = new Date();
    var fecha = `${d.getUTCDay()}/${d.getUTCMonth()}/${d.getFullYear()}`;
    return fecha;
}

helpers.unValidDomain = async (value, domain) => {
    if (value === domain) {
        return false;
    } else {
        return true;
    }
}

helpers.obtainById = async (id, oauth2, domain) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var usuario = '';
    const usuarios = await service.users.list({ domain: domain });
    for (const i in usuarios.data.users) {
        if (usuarios.data.users[i].id === id) {
            usuario = usuarios.data.users[i].primaryEmail;
        }
    }

    return usuario;
}

helpers.generatePassword = async (longitud) => {

    var caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789";
    var contraseña = "";
    for (i = 0; i < longitud; i++) contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    return contraseña;

}



module.exports = helpers;


// Como escribir
//await hp_sheets.write(oauth2,sheetId,'A',[[d]],'Logs');
