import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health:   http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ No se pudo conectar a MongoDB:', err.message);
    process.exit(1);
  });
