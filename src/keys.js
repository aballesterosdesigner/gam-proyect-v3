
module.exports = {
    database: {
        connectionLimit: 30,
        //host: process.env.DATABASE_HOST || '34.74.95.171',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || 'AntonioHTC@2020',
        database: process.env.DATABASE_NAME || 'interfaz_db',
        /* Abir para hacer el */
        socketPath: `/cloudsql/gam-sql-demo-278414:us-east1:db-gam-demo`
    }
};