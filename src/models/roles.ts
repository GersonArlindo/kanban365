import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const Roles = db.define('tbl_roles',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    rol_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rol_description: {
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

export default Roles;