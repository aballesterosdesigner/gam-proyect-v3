const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../../../credentials.json');
const hp_sheets = require('../SheetAPI/hp.sheets');
const hp_generales = require('../../helpers');
const hp_logs = require('../../../lib/helpers/LogsAPI/helpers');

const helpers = {};





helpers.createGroupsSheets = async (oauth2, miembros, grupos, req, res) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const { domain } = req.body;
    const listGroups = await helpers.listGroups(oauth2, domain);
    var state = {
        create_groups: {
            state: false,
            logs: new Array()
        },
        insert_members: {
            state: false,
            logs: new Array()
        }
    }
    var groups = new Array();

    for (const i in grupos) {
        if (grupos[i] != undefined) {
            groups.push(grupos[i][0]);
            var exist = await helpers.checkIfExist(grupos[i][0], oauth2, domain);
            if (exist == true) {
                //El grupo existe.
                var id = helpers.obtenerIdGrupoByName(oauth2, grupos[i][0], domain);
                if (miembros[i][0] != undefined) {
                    console.log(`Hay usuarios para insertar en ${grupos[i][0]}`);
                    var arrMiembros = miembros[i][0].replace(/ /g, "").split(",");
                    for (const j in arrMiembros) {
                        if (arrMiembros[j] != undefined) {
                            state.insert_members.state = true;
                            //console.log(`Se va a añadir al usuario ${arrMiembros[j]} en ${grupos[i][0]}`);
                            await service.members.insert({
                                groupKey: grupos[i][0],
                                resource: {
                                    email: arrMiembros[j]
                                }
                            }).then((result) => {
                                state.insert_members.logs.push(arrMiembros[j]);
                            }).catch((err) => {
                                console.log(err.errors[0]["reason"]);
                            });
                        }
                    }
                } else {
                    console.log('Undefined')
                }
                console.log(await id);

            } else {
                // console.log(`No existe ${grupos[i][0]}`);
                await service.groups.insert({
                    resource: {
                        name: grupos[i][0].split(',')[0],
                        email: grupos[i][0]
                    }
                }).then((result) => {
                    console.log(result.data.name);
                    state.create_groups.state = true;
                    state.create_groups.logs.push(result.data.name);
                }).catch((err) => {

                })
            }
        }
    }
    if (state.create_groups.state == true) {
        console.log(state.create_groups.logs);
        req.flash('logs', state.create_groups.logs);
        //res.redirect('/profile/create_groups');
    }
    if (state.insert_members.state == true) {
        req.flash('logs', state.insert_members.logs);
        //res.redirect('/profile/create_groups');
    }
}


helpers.obtenerIdGrupoByName = async (oauth2, email, domain) => {

    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const groups = await service.groups.list({ domain: domain });
    var id = '';
    for (const i in groups.data.groups) {
        if (email == groups.data.groups[i].email) {
            id = groups.data.groups[i].id;
        }
    }
    return id;
}
helpers.checkIfExist = async (grupo, oauth2, domain) => {
    var res = false;
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });

    const groupsData = await service.groups.list({ domain: domain });
    if (groupsData.data.groups === undefined) {
    } else {
        for (const i in groupsData.data.groups) {
            if (grupo == groupsData.data.groups[i].email) {
                res = true;
            }
        }
    }
    return res;
}
helpers.listGroups = async (oauth2, domain) => {
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    const groups = await service.groups.list({ domain: domain });
    var data = new Array();

    for (const i in groups.data.groups) {
        var aux = new Array();
        aux.push(groups.data.groups[i].name, groups.data.groups[i].id);
        data.push(aux);
    }
    return data;
}
module.exports = helpers;


helpers.createGroups = async (oauth2,grupos)=>{
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var logs = new Array();
    if(grupos != undefined){
        for(const i in grupos){
           if(grupos[i][0]!=undefined){
                var log = await service.groups.insert({
                    resource: {
                        name: grupos[i][0].split(',')[0],
                        email: grupos[i][0]
                    }
                }).then((result) => {
                    return hp_logs.insertLogs(result,`Se ha creado el grupo ${grupos[i][0]}`);
                }).catch((err) => {
                    if(err.errors[0]["reason"] === "duplicate"){
                        return hp_logs.insertLogs(err,`El grupo ${grupos[i][0]} no se ha creado puesto que ya existe`);
                    }
                    return hp_logs.insertLogs(err,`Ha habido un error ${err.errors[0]["reason"]}`);
                });
                logs.push(log);
           }
        }
    }else{
        console.log(`La columna de los grupos está vacia`)
    }
    return logs;
}


helpers.insertMember = async(oauth2,grupos,miembros)=>{
    const service = google.admin({ version: 'directory_v1', auth: oauth2 });
    var logs = new Array();
   for(const i in grupos){
    var arrMiembros = miembros[i][0].replace(/ /g, "").split(",");
    //console.log(`Se van a insertasr en ${grupos[i][0]}`);
    for(const j in miembros[i]){
        var arrMiembros = miembros[i][j].replace(/ /g, "").split(",");
        for (const j in arrMiembros) {
            console.log(arrMiembros[j])
            
            var log = await service.members.insert({
                groupKey: grupos[i][0],
                resource: {
                    email: arrMiembros[j].replace("\n","")
                }   
            }).then((result) => {
                return hp_logs.insertLogs(result,`Se ha insertado el usuario ${arrMiembros[j]}`);
            }).catch((err) => {
                return hp_logs.insertLogs(err);
            }); 
            logs.push(log);
        }
    }
}
return logs;
}





//     console.log(listGroups);


            //     var grupo = grupos[i][0];
            //     var nombre = grupos[i][0].split('@')[0];
            //     var nombreUpper = nombre.charAt(0).toUpperCase() + nombre.slice(1);

            //     console.log(`${grupo} se creará con nombre ${nombre}`);
            //     service.groups.insert({
            //         resource:{
            //             name:nombreUpper,
            //             email:grupo
            //         }
            //     }).then((result)=>{
            //         if(miembros[i]!=undefined){
            //             /* Se podrán crear */
            //             var aux = miembros[i][0].split(',');
            //             for(const j in aux){
            //                 console.log(aux[j]);
            //                 service.members.insert({
            //                     groupKey:result.data.id,
            //                     resource:{
            //                         email:aux[j]
            //                     }
            //                 }).then(()=>{
            //                     console.log('Insertando...');
            //                 })
            //             }
            //         }else{
            //             console.log('No se ha podido crear');
            //         }
            //     }) 