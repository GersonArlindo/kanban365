import { Sequelize } from "sequelize";

const db = new Sequelize('u995115440_kanban365', 'u995115440_kanban365', 'R>MA9![O!5Mx', {
    host: 'srv1006.hstgr.io',
    //port: 3307,
    dialect: 'mysql',
    logging: false,
    define: {
        timestamps: false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}); 

export default db;