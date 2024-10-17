import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { body, validationResult } from 'express-validator';
import { sequelize } from './src/config/database.js';
import jwt from 'jsonwebtoken';
import { UserRepository, UserValidations } from './src/controllers/userController.js';
import { authenticateToken, isAdmin, isSuperUser } from './src/middleware/auth.js';
import { PaymentRepository } from './src/controllers/paymentController.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limita el tamaño a 50MB
}));

// Ruta de prueba
app.get('/', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Registrar usuarios (admin crea usuarios comunes)
app.post('/register', UserValidations.register(), authenticateToken, isAdmin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, username, password, role } = req.body;

    try {
        const id = await UserRepository.create({ email, username, password, role });
        res.send({ id });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Login de usuarios
app.post('/login', UserValidations.login(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await UserRepository.login({ email, password });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, "palabra-secreta", { expiresIn: '1h' });
        res.send({ user, token });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

// Subir recibos de pago (solo admins)
app.post('/upload', authenticateToken, isAdmin, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No se subió ningún archivo.');
    }

    const file = req.files.file;

    // Verifica que el archivo sea PDF
    if (file.mimetype !== 'application/pdf') {
        return res.status(400).send('Solo se permiten archivos PDF.');
    }

    const uploadPath = path.join(__dirname, 'uploads', file.name);

    file.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
        res.send('Archivo subido correctamente.');
    });
});

// Registrar pagos (solo admins)
app.post('/payments', authenticateToken, isAdmin, async (req, res) => {
    const { userId, amount, date } = req.body;
    try {
        const payment = await PaymentRepository.create({ userId, amount, date });
        res.send(payment);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Ver pagos de usuario (usuarios comunes)
app.get('/payments', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const payments = await PaymentRepository.getUserPayments(userId);
        res.send(payments);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Descargar recibos (usuarios comunes)
app.get('/download/:filename', authenticateToken, async (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);

    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404).send('Archivo no encontrado.');
    }
});

// Conexión a la base de datos
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión con la base de datos exitosa');
    } catch (error) {
        console.log(`Error en la conexión con la base de datos: ${error}`);
    }
})();

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});