import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const GHLApiKey = db.define('tbl_ghl_api_keys',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    api_key: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.NUMBER,
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

export default GHLApiKey;