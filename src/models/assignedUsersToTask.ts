import { DataTypes } from "sequelize";
import db from "../db/connection.db";

const AssignedToTask = db.define('tbl_task_users', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
  }, {
    timestamps: false
  });

export default AssignedToTask;