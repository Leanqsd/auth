import { DataTypes, where } from 'sequelize';
import { sequelize } from '../config/database.js';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 20]
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 100]
        }
    },
});



export class UserRepository {
    static async create ({email, username, password}){
        try {
            const hashedPassword = bcrypt.hashSync(password, 10);

            const newUser = await User.create({
            email,
            username,
            password: hashedPassword
        });
        return newUser.id
        }catch (error) { throw new Error('error al crear el usuario') }
    }
    static async login ({email, password}){
        const user = await User.findOne({ where: { email } })
        if (!user) throw new Error('email no encontrado')

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('contraseña incorrecta')
        
        return user 
    }
    
}

export class UserValidations {
    static register() {
        return [
            body('email')
                .isEmail().withMessage('Debe ingresar un email válido')
                .custom(async (email) => {
                    const existingUser = await User.findOne({ where: { email } });
                    if (existingUser) {
                        throw new Error('El email ya está en uso');
                    }
                }),
            body('username')
                .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres')
                .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
            body('password')
                .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
                .notEmpty().withMessage('La contraseña no puede estar vacía')
        ];
    }

    static login() {
        return [
            body('email')
                .notEmpty().withMessage('El nombre de usuario no puede estar vacío'),
            body('password')
                .notEmpty().withMessage('La contraseña no puede estar vacía')
        ];
    }
}