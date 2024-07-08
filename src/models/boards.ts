import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const Boards = db.define('tbl_boards', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_created: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tenant_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

export default Boards;