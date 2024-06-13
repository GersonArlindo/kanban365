import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const Users = db.define('tbl_users',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    first_name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    username:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_image:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone_number:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    rol_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    password:{
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

export default Users;