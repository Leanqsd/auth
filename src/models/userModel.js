import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Definición del modelo de Usuario
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
    role: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    }
});
