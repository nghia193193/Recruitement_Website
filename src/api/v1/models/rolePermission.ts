import mongoose, { Schema } from "mongoose";
const Shema = mongoose.Schema;

const rolePermissionSchema = new Schema(
    {
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },
        permissionId: {
            type: Schema.Types.ObjectId,
            ref: "Permission",
            required: true
        }
    }
);

export const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);