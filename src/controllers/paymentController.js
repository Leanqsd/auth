import { Payment } from '../models/paymentModel.js'; // Asegúrate de importar el modelo correcto
import { body } from 'express-validator';

export class PaymentRepository {
    static async createPayment(req, res) {
        const { userId, amount, receipt } = req.body;

        try {
            const payment = await Payment.create({
                userId,
                amount,
                receipt, // Asumiendo que receipt es el nombre del archivo o una referencia
            });
            res.status(201).json({ id: payment.id });
        } catch (error) {
            res.status(400).send(error.message);
        }
    }

    static async getPayments(req, res) {
        const userId = req.user.id; // Obtén el ID del usuario del token

        try {
            const payments = await Payment.findAll({ where: { userId } });
            res.json(payments);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    static async getPayment(req, res) {
        const { id } = req.params;

        try {
            const payment = await Payment.findByPk(id);
            if (!payment) return res.sendStatus(404);
            res.json(payment);
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
}

// Validaciones de pago
export class PaymentValidations {
    static create() {
        return [
            body('userId').notEmpty().withMessage('El ID de usuario es obligatorio'),
            body('amount').isNumeric().withMessage('El monto debe ser un número'),
            body('receipt').notEmpty().withMessage('El recibo es obligatorio'),
        ];
    }
}