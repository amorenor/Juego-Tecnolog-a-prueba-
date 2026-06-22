import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definida. Configura el archivo .env');
  }

  mongoose.set('strictQuery', false);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  const host = mongoose.connection.host;
  const dbName = mongoose.connection.name;
  console.log(`✅ MongoDB conectado → ${host} / ${dbName}`);
}
