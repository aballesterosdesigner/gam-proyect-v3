const bcrypt = require('bcryptjs');
const helpers = {};
const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library');
const { OAuth2Client } = require('google-auth-library');
const credentials = require('../../credentials.json');
helpers.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (e) {
    console.log(e)
  }
};


helpers.obtenerClientesDominio = async (oauth2, domain, google) => {
  var res = new Array();
  const service = google.admin({ version: 'directory_v1', auth: oauth2 });
  const clientes = service.users.list({
    domain: domain
  });

  /* Recorremos la variable clientes que contendrá todos los datos de usuario y introducimos
    dentro un array su email
  */
  for (const key in (await clientes).data.users) {
    var cliente = [];
    cliente.push(await (await clientes).data.users[key].primaryEmail);
    res.push(cliente);
  }
  /* Devolvemos como salida res que será un array que contenga el email de los clientes */
  return res;
}

helpers.forzarCambioPass = (oauth2, clientes, req, res,encendido) => {

  const service = google.admin({ version: 'directory_v1', auth: oauth2 });
  var success_data = "";
  for (const key in clientes) {
    service.users.update({
      userKey: clientes[key],
      resource: {
        changePasswordAtNextLogin: encendido
      }
    }).then((success) => {
      console.log('el usuario' + clientes[key] + 'se ha forzado');
      req.flash('success','Se han forzadeo todos');
      res.redirect('/profile/change_password')
    }).catch((err) => {
      
    });
  }







  // res.redirect('/profile/change_password');
}
helpers.obtenerEventosAuditoria = async (auth, id, google) => {


  /* Obtenemos los eventos según la id obtenida
    si gil-gibernau tiene una id C0233x por ejemplo, se obtendrán los eventos relaccionados con esta id
  */
  let evento, fecha_evento, email_usuario, type_event, name_event;
  var datos = new Array();
  const service = google.admin({ version: 'reports_v1', auth: auth });
  const eventos = service.activities.list({
    auth: auth,
    userKey: 'all',
    customerId: id,
    applicationName: 'user_accounts'
  });
  const data = await (await eventos).data;



  for (let i = 0; i < data.items.length; i++) {
    var dato = new Array();
    fecha_evento = data.items[i].id.time;
    email_usuario = data.items[i].actor.email;
    type_event = data.items[i].events[0].type;
    name_event = data.items[i].events[0].name;
    /* Si el tipo de evento es password_change introduciremos los datos de los clientes
      email del cliente, la fecha en la que se ha producido el evento, el tipo de evento y el nombre de evento
    */
    if (type_event == "password_change") {
      dato.push(fecha_evento, email_usuario, type_event, name_event);
      datos.push(dato);
    }

  }


  return datos;
}

helpers.obtenerIdCliente = async (oauth2, domain, google) => {
  // var id = await obtenerCustomerId(oauth2, domain);
  const service = google.reseller({ version: 'v1', auth: oauth2 });
  const clientes = service.subscriptions.list({
    maxResults: '100', /* Número máximo de resultados */
    customerNamePrefix: domain
  });
  
  console.log(await clientes);



  return await (await clientes).data.subscriptions[0].customerId;

}
helpers.repetidos = (eventos, clientes) => {
  var encuentra = false;
  var res = new Array();
  for (var i = 0; i < clientes.length; i++) {
    encuentra = false;
    for (var j = 0; j < eventos.length; j++) {
      if (clientes[i] == eventos[j]) {
        encuentra = true;
        break;
      }
    }
    if (!encuentra) {
      res.push(clientes[i]);
    }
  }
  if (encuentra) { }

  return res;


}
helpers.compararRestanteArrays = (oauth2, eventos, clientes) => {
  var encuentra = false;
  var res = new Array();
  for (var i = 0; i < clientes.length; i++) {
    encuentra = false;
    for (var j = 0; j < eventos.length; j++) {
      if (clientes[i] == eventos[j][1]) {
        encuentra = true;
        break;
      }
    }
    if (!encuentra) {
      res.push(clientes[i][0]);
    }
  }
  if (encuentra) { }

  return res;

}
helpers.restarFechas = async (fecha) => {
  let fecha1 = new Date(fecha);
  let fecha2 = new Date();
  let resta = fecha2.getTime() - fecha1.getTime()
  var dias = Math.round(resta / (1000 * 60 * 60 * 24));
  return dias;
}
helpers.usuariosRecientesChangePass = async (oauth2, datos, domain, google, num_dias) => {
  var d = new Date();
  var mes = d.getMonth();
  var day = d.getDate();
  var res = new Array();
  var cambios = new Array();
  var fecha_actual = d.getFullYear() + '-' + mes + '-' + day;
  var han_forzado = new Array();
  var aux = new Array();
  var test = new Array();
  var clientes = helpers.obtenerClientesDominio(oauth2, domain, google);

  for (const key in datos) {
    var fecha = datos[key][0].split('T')[0];

    let fecha1 = new Date(fecha);
    let fecha2 = new Date();
    let resta = fecha2.getTime() - fecha1.getTime()
    var dias = Math.round(resta / (1000 * 60 * 60 * 24));
    var data = new Array();

    test.push(`${datos[key][1]}-${dias}`);

    if (dias >= num_dias) {
      //cambió la contraseña hace "x" días
      aux.push(datos[key][1]);
    } else {
      res.push(datos[key][1]);
    }



  }
  // 
  data = helpers.repetidos(res, aux);
  var uniqs = data.filter(function (item, index, array) {
    return array.indexOf(item) === index;
  });

  
  return uniqs;
}


helpers.obtenerValoresSheet = (auth, google, sheetId, range) => {
  const service = google.sheets({ version: 'v4', auth });
  var data = service.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range
  });
  return data;
}

helpers.crearUnidadesCompartidas = async (auth, service, datos, req, res) => {
  var id_unidad = "";
  service.teamdrives.create({
    resource: {
      name: datos.nombre_unidad
    },
    requestId: datos.requestId,
    fields: '*'
  }).then((success) => {

    helpers.introducirRolesUnidadesCompartidas(auth, service, datos, success.data.id, req, res)
  });
}




helpers.introducirRolesUnidadesCompartidas = (auth, service, datos, id_file, req, res) => {
  console.log(datos)
  service.permissions.create({
    fileId: id_file,
    supportsTeamDrives: true,
    supportsAllDrive: true,
    domain: 'demo.hispacolextech.com',
    resource: {
      type: 'user',
      emailAddress: datos.email,
      role: datos.rol,
    }
  }).then((success) => {
    req.flash('success', `Se ha creado correctamente ${datos.nombre_unidad} y se ha añadido correctamente a ${datos.email} como ${datos.rol}`)
    res.redirect('/profile/create_drive_units');
  })
}

helpers.obtenerAuth = (req) => {
  const auth = new GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.reports.audit.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/apps.order',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/admin.directory.group'
    ]
  });

  const oauth2 = new OAuth2Client(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );

  oauth2.credentials = req.user.token;
  oauth2.setCredentials({
    access_token: req.user.token,
    refresh_token: req.user.refreshToken
  });

  return oauth2;
}
module.exports = helpers;
