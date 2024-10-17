import { User } from '../models/userModel.js';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { isAdmin } from '../middleware/auth.js';

export class UserRepository {
    // Método para registrar un usuario
    static async create({ email, username, password, role = 'user' }) {
        try {
            // Hashear la contraseña
            const hashedPassword = bcrypt.hashSync(password, 10);
            
            // Crear el nuevo usuario
            const newUser = await User.create({
                email,
                username,
                password: hashedPassword,
                role
            });

            return newUser.id;  // Retorna el ID del nuevo usuario
        } catch (error) {
            throw new Error('Error al crear el usuario: ' + error.message);
        }
    }

    // Método para hacer login
    static async login({ email, password }) {
        try {
            // Buscar el usuario por email
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('Email no encontrado');
            }

            // Verificar la contraseña
            const isValid = bcrypt.compareSync(password, user.password);
            if (!isValid) {
                throw new Error('Contraseña incorrecta');
            }

            return user;  // Si las credenciales son válidas, retorna el usuario
        } catch (error) {
            throw new Error('Error en el login: ' + error.message);
        }
    }

    // Método para buscar un usuario por su ID
    static async findById(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error('Error al buscar el usuario: ' + error.message);
        }
    }
}

export class UserValidations {
    // Validaciones para el registro de usuarios
    static register() {
        return [
            body('email')
                .isEmail().withMessage('Debe ingresar un email válido')
                .custom(async (email) => {
                    // Verifica si el email ya está en uso
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

    // Validaciones para el login de usuarios
    static login() {
        return [
            body('email')
                .notEmpty().withMessage('El campo de email no puede estar vacío')
                .isEmail().withMessage('Debe ingresar un email válido'),
            body('password')
                .notEmpty().withMessage('La contraseña no puede estar vacía')
        ];
    }
}

const testUser = await User.create({
    email: "usertest@gmail.com",
    username: "usuariotester",
    password: "password123", 
    role: "admin" 
});