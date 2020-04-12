module.exports = {
    database: {
        "connectTimeout": 20000,
        host: process.env.DATABASE_HOST || '35.192.122.221',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || 'AntonioHTC@2019',
        database: process.env.DATABASE_NAME || 'interfaz_db',
        // Abrir para el deploy
        // socketPath: `/cloudsql/gam-project-5a5-clr-gyw:us-central1:root`
    }
};