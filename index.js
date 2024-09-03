import express from 'express';
import cors from 'cors';
import { body, validationResult} from 'express-validator';
import { sequelize } from './src/config/database.js';
import jwt from 'jsonwebtoken'
import { User } from './src/models/user-model.js';
import { UserRepository } from './src/models/user-model.js';
import { UserValidations } from './src/models/user-model.js';
import { authenticateToken } from './src/middleware/auth.js';


const app = express();

const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.get('/', authenticateToken, (req, res) =>{
    res.json({user: req.user})
});

app.post('/login', UserValidations.login(), async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body
    try {
        const user = await UserRepository.login({ email, password })
        const token = jwt.sign({ id: user.id, email: user.email}, "palabra-secreta", { expiresIn: '1h'})
        res.send({ user, token })
    }catch(error){
        res.status(401).send(error.message)
    }
});
app.post('/register', UserValidations.register(), async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password} = req.body

    try {
        const id = await UserRepository.create({ email, username, password })
        res.send({ id })
    }catch (error) {
        res.status(400).send(error.message)
    }
});
app.post('/logout', (req, res)=>{});




//conexion con la base de datos:
(async () => {
    try{
        await sequelize.authenticate();
        console.log('CONEXION CON DB EXITOSA');
    }catch(error){
        console.log(`ERROR EN LA CONEXION CON DB ${error}`)
    }
})();

//sincronizacion con el modelo:
(async () =>{
    try{
        await sequelize.sync({force: false});
        console.log('MODELO SINCRONIZADO EXITOSAMENTE');
    }catch(error){
        console.log('ERROR AL SINCRONIZAR MODELO');
    }
})();

app.listen(port, () =>{
    console.log(`SERVIDOR CORRIENDO EN EL PUERTO ${port}`);
});