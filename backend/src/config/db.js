import { Sequelize } from 'sequelize';

const {
  DB_SERVER,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_PORT = '1433',
} = process.env;

if (!DB_SERVER || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error('❌ Variables de Azure SQL faltantes. Configura en .env:');
  console.error('   DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD');
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_SERVER,
  port: Number(DB_PORT),
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: false,
      requestTimeout: 30000,
    },
  },
});

export async function connectDB() {
  await sequelize.authenticate();
  // alter: true actualiza columnas nuevas sin borrar datos existentes
  await sequelize.sync({ alter: true });
  console.log(`✅ Azure SQL conectado → ${DB_SERVER} / ${DB_NAME}`);
}

export default sequelize;
