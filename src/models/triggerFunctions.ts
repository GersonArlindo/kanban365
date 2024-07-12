import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const TriggerFunctions = db.define('tbl_trigger_functions',{
    id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_created: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

const AssociatedTriggerFunctions = db.define('tbl_associated_trigger_functions',{
    id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    trigger_id:{
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    trigger_link:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    status:{
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    date_created: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

export {TriggerFunctions, AssociatedTriggerFunctions};
