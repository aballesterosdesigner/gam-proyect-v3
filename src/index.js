/**
 * Reading Environment Variables
 */
const dotenv = require('dotenv');
dotenv.config();


const app = require('./app');
app.use((error, req, res, next) => {
    console.log(error.name)
    switch (error.name) {
        case "UnauthorizedError":
            console.log("UnauthorizedError = ", error.message)
            res.status(401).redirect('/401.html');
            break

        case "ENOENT":

            break
        case "InternalServerError":
            console.log("InternalServerError = ", error.message)
            res.status(500).send('whatever')
            break

        case "Error":
            res.status(500).send(error.message)
            break;
        default:
    }
})

app.listen(app.get('port'));
console.log('Server is in port', app.get('port'));