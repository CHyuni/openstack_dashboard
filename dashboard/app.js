const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerOptions');
const authRoutes = require('./routes/auth');
const novaRoutes = require('./routes/nova');
const glanceRoutes = require('./routes/glance')

app.use(cors());
app.use(express.json());
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api/auth', authRoutes);
app.use('/api/nova', novaRoutes);
app.use('/api/glance', glanceRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
