import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Definición del modelo de Pago
export const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    receipt: {
        type: DataTypes.STRING, // O tipo adecuado según cómo manejes el archivo
        allowNull: false,
    },
});