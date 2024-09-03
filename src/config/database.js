import { Sequelize } from "sequelize";

export const sequelize = new Sequelize('myapp', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})