import { Application, Request, Response } from "express";
import Boards  from "../models/boards"
import AssignedTo from "../models/assignedUsers"
import Users from "../models/users"
import Columns  from "../models/columns"
import Tasks  from "../models/tasks"
import SubTasks  from "../models/subtasks"
import { authenticateJWT, CustomRequest  } from "../helpers/auth.middleware"; // Importa el middleware

Boards.hasMany(AssignedTo, { foreignKey: "board_id" });
AssignedTo.belongsTo(Boards, { foreignKey: "board_id" });

Users.hasMany(AssignedTo, { foreignKey: "user_id" });
AssignedTo.belongsTo(Users, { foreignKey: "user_id" });

export const BoardsFunctions = (app: Application): void => {

	app.get("/boards", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const {id, tenant_id, created_by } = req;

        if (!tenant_id || !created_by) {
            return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
        }
        try {
            // Obtener todos los tableros
            const boardsValue = await Boards.findAll({ 
                where: { tenant_id },
                include: [{
                    model: AssignedTo,
                    where: { user_id: id }
                }]
             });

            // Para cada tablero, obtener sus columnas, tareas y subtareas
            const boardsData = await Promise.all(boardsValue.map(async (board: any) => {
                const columns = await Columns.findAll({ where: { board_id: board.id } });

                const columnsData = await Promise.all(columns.map(async (column: any) => {
                    const tasks = await Tasks.findAll({ where: { column_id: column.id } });

                    const tasksData = await Promise.all(tasks.map(async (task: any) => {
                        const subtasks = await SubTasks.findAll({ where: { task_id: task.id } });
                        return {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            status: task.status,
                            created_by: task.created_by,
                            tenant_id: task.tenant_id,
                            subtasks: subtasks.map((subtask: any) => ({
                                id: subtask.id,
                                title: subtask.title,
                                isCompleted: subtask.isCompleted,
                                created_by: subtask.created_by,
                                tenant_id: subtask.tenant_id,
                            }))
                        };
                    }));

                    return {
                        id: column.id,
                        name: column.name,
                        created_by: column.created_by,
                        tenant_id: column.tenant_id,
                        tasks: tasksData
                    };
                }));

                return {
                    id: board.id,
                    name: board.name,
                    created_by: board.created_by,
                    tenant_id: board.tenant_id,
                    columns: columnsData
                };
            }));
            const responseData = {
                boards: boardsData
            };
            return res.status(200).json(responseData);
        } catch (error) {
            console.error("Error fetching boards data: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta POST de ejemplo
    app.post("/board/add", authenticateJWT, async (req: CustomRequest, res: Response) => {
        // Asumimos que el cuerpo de la solicitud contiene un objeto JSON con los datos del nuevo tablero
        const {assignedTo, name, columns } = req.body;
        const {id, tenant_id, created_by } = req;

        if (!tenant_id || !created_by) {
            return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
        }
        try {
            // Crear el nuevo tablero
            const newBoard: any = await Boards.create({ name, created_by, tenant_id });
            // Crear las columnas para el nuevo tablero
            const columnPromises = columns.map((column: any) => Columns.create({
                name: column.name,
                board_id: newBoard.id,
                created_by: created_by, 
                tenant_id: tenant_id
            }));
            const createdColumns = await Promise.all(columnPromises);

            // Agrega el id al arreglo assignedTo
            if (Array.isArray(assignedTo) && id) {
                assignedTo.push(id);
            }

            // Elimina los duplicados usando Set
            const uniqueAssignedTo = Array.from(new Set(assignedTo));

            // Mapea el arreglo uniqueAssignedTo para crear los registros en la base de datos
            const usersAssignedToSave = uniqueAssignedTo.map((user: any) => AssignedTo.create({
                board_id: newBoard.id,
                user_id: user,
                owner: user == id ? 1 : 0,
                created_by: created_by,
                tenant_id: tenant_id
            }));

            // Ejecuta todas las promesas para crear los registros
            const createdAssignedUsers = await Promise.all(usersAssignedToSave);

            // Responder con el nuevo tablero y sus columnas
            return res.status(201).json({
                board: newBoard,
                columns: createdColumns
            });
        } catch (error) {
            console.error("Error creating new board: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta PUT para actualizar un tablero existente
    app.put("/board/edit/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const boardId = req.params.id;
        const { name, columns } = req.body;
        const { tenant_id, created_by } = req;

        if (!tenant_id || !created_by) {
            return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
        }
        try {
            // Buscar el tablero existente
            const board: any = await Boards.findByPk(boardId);
            if (!board) {
                return res.status(404).send("Board not found");
            }

            // Actualizar el nombre del tablero
            board.name = name;
            await board.save();

            // Obtener las columnas existentes del tablero
            const existingColumns = await Columns.findAll({ where: { board_id: boardId } });

            // Mapear las columnas existentes por su ID para un acceso rápido
            const existingColumnsMap = new Map(existingColumns.map((column: any) => [column.id, column]));

            // Procesar las columnas enviadas en la solicitud
            const updatedColumns = await Promise.all(columns.map(async (column: any) => {
                if (column.id && existingColumnsMap.has(column.id)) {
                    // Actualizar la columna existente
                    const existingColumn = existingColumnsMap.get(column.id);
                    existingColumn.name = column.name;
                    return existingColumn.save();
                } else {
                    // Crear una nueva columna
                    return Columns.create({
                        name: column.name,
                        board_id: boardId,
                        created_by: created_by, 
                        tenant_id: tenant_id
                    });
                }
            }));

            // Eliminar las columnas que ya no están en la solicitud
            const columnsToDelete = existingColumns.filter((column: any) => 
                !columns.some((col: any) => col.id === column.id)
            );
            await Promise.all(columnsToDelete.map((column: any) => column.destroy()));

            // Responder con el tablero actualizado y sus columnas
            return res.status(200).json({
                board,
                columns: updatedColumns
            });

        } catch (error) {
            console.error("Error updating board: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.delete("/board/delete/:id", authenticateJWT, async (req: Request, res: Response) => {
        const boardId = req.params.id;

        try {
            // Encuentra todas las columnas del tablero
            const columns = await Columns.findAll({ where: { board_id: boardId } });

            // Encuentra todas las tareas y subtareas de cada columna
            const tasksPromises = columns.map(async (column: any) => {
                const tasks = await Tasks.findAll({ where: { column_id: column.id } });
                const subtasksPromises = tasks.map((task: any) => SubTasks.destroy({ where: { task_id: task.id } }));
                await Promise.all(subtasksPromises);
                return Tasks.destroy({ where: { column_id: column.id } });
            });

            // Eliminar todas las tareas y subtareas
            await Promise.all(tasksPromises);

            // Eliminar todas las columnas del tablero
            await Columns.destroy({ where: { board_id: boardId } });

            // Finalmente, eliminar el tablero
            await Boards.destroy({ where: { id: boardId } });

            return res.status(200).json({
                msj: "Board and all associated columns, tasks, and subtasks deleted successfully"
            });

        } catch (error) {
            console.error("Error deleting board: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get("/board/assignedUsers/:board_id", authenticateJWT, async (req: Request, res: Response) => {
        const boardId = req.params.board_id;
        try {
            const users = await AssignedTo.findAll({ 
                include: [
                    {
                      model: Users,
                      attributes: [
                        "id",
                        "first_name",
                        "last_name",
                        "username",
                        "user_image",
                        "email",
                        "phone_number",
                        "rol_id",
                        "status",
                        "created_by",
                        "tenant_id"
                      ],
                    },
                  ],
                where: { board_id: boardId } });
                const responseData = {
                    assignedUsers: users
                };
                return res.status(200).json(responseData);
        } catch (error) {
            console.error("Error changing task status: ", error);
            return res.status(500).send("Internal Server Error");
        }
    })

    // Ruta POST para crear una nueva tarea
    app.post("/task/add", authenticateJWT, async (req: CustomRequest, res: Response) => {
    const { columnId, title, description, status, subtasks } = req.body;
    const { tenant_id, created_by } = req;

    if (!tenant_id || !created_by) {
        return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
    }

    try {
        // Crear la nueva tarea
        const newTask: any = await Tasks.create({
            column_id: columnId,
            title: title,
            description: description,
            status: status,
            created_by: created_by, 
            tenant_id: tenant_id
        });

        // Crear las subtareas para la nueva tarea
        const subtaskPromises = subtasks.map((subtask: any) => SubTasks.create({
            task_id: newTask.id,
            title: subtask.title,
            isCompleted: subtask.isCompleted,
            created_by: created_by, 
            tenant_id: tenant_id
        }));

        const createdSubtasks = await Promise.all(subtaskPromises);

        // Responder con la nueva tarea y sus subtareas
        return res.status(201).json({
            ...newTask.toJSON(),
            subtasks: createdSubtasks
        });
    } catch (error) {
        console.error("Error creating new task: ", error);
        return res.status(500).send("Internal Server Error");
    }
    });

    // Ruta PUT para editar una tarea existente
    app.put("/task/edit/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
        const taskId = req.params.id;
        const { columnId, title, description, status, subtasks } = req.body;
        const { tenant_id, created_by } = req;

        if (!tenant_id || !created_by) {
            return res.sendStatus(403); // Debería ser imposible llegar aquí si el middleware funciona correctamente
        }
        try {
            // Buscar la tarea existente
            const task: any = await Tasks.findByPk(taskId);
            if (!task) {
                return res.status(404).send("Task not found");
            }
    
            // Actualizar la tarea
            task.column_id = columnId;
            task.title = title;
            task.description = description;
            task.status = status;
            await task.save();
    
            // Obtener las subtareas existentes de la tarea
            const existingSubtasks = await SubTasks.findAll({ where: { task_id: taskId } });
    
            // Mapear las subtareas existentes por su ID para un acceso rápido
            const existingSubtasksMap = new Map(existingSubtasks.map((subtask: any) => [subtask.id, subtask]));
    
            // Procesar las subtareas enviadas en la solicitud
            const updatedSubtasks = await Promise.all(subtasks.map(async (subtask: any) => {
                if (subtask.id && existingSubtasksMap.has(subtask.id)) {
                    // Actualizar la subtarea existente
                    const existingSubtask = existingSubtasksMap.get(subtask.id);
                    existingSubtask.title = subtask.title;
                    existingSubtask.isCompleted = subtask.isCompleted;
                    await existingSubtask.save();
                    existingSubtasksMap.delete(subtask.id); // Eliminar del mapa las subtareas actualizadas
                    return existingSubtask;
                } else {
                    // Crear una nueva subtarea
                    return SubTasks.create({
                        task_id: taskId,
                        title: subtask.title,
                        isCompleted: subtask.isCompleted,
                        created_by: created_by,
                        tenant_id: tenant_id
                    });
                }
            }));
    
            // Eliminar las subtareas que ya no están en la solicitud
            const subtasksToDelete = Array.from(existingSubtasksMap.values());
            await Promise.all(subtasksToDelete.map((subtask: any) => subtask.destroy()));

            // Responder con la tarea actualizada y sus subtareas
            const updatedTaskWithSubtasks = {
                ...task.toJSON(),
                subtasks: updatedSubtasks
            };
    
            return res.status(200).json(updatedTaskWithSubtasks);
        } catch (error) {
            console.error("Error editing task: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    //Ruta PUT para cambiar de status a una tarea
    app.put("/task/change-status/:id", authenticateJWT, async (req: Request, res: Response) => {
        const taskId = req.params.id;
        const { status, columnId } = req.body;
    
        try {
            // Buscar la tarea existente
            const task: any = await Tasks.findByPk(taskId);
            if (!task) {
                return res.status(404).send("Task not found");
            }
    
            // Actualizar el estado y la columna de la tarea
            task.status = status;
            task.column_id = columnId;
            await task.save();
    
            // Responder con la tarea actualizada
            return res.status(200).json(task);
        } catch (error) {
            console.error("Error changing task status: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta PUT para cambiar el campo isCompleted de una subtarea
    app.put("/subtask/toggle-completion/:id", authenticateJWT, async (req: Request, res: Response) => {
        const subtaskId = req.params.id;
        const { isCompleted } = req.body;

        try {
            // Buscar la subtarea existente
            const subtask: any = await SubTasks.findByPk(subtaskId);
            if (!subtask) {
                return res.status(404).send("Subtask not found");
            }

            // Actualizar el campo isCompleted de la subtarea
            subtask.isCompleted = isCompleted;
            await subtask.save();

            // Responder con la subtarea actualizada
            return res.status(200).json(subtask);
        } catch (error) {
            console.error("Error changing subtask completion status: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

    // Ruta DELETE para eliminar una tarea junto con sus subtareas
    app.delete("/task/delete/:id", authenticateJWT, async (req: Request, res: Response) => {
        const taskId = req.params.id;

        try {
            // Buscar la tarea existente
            const task: any = await Tasks.findByPk(taskId);
            if (!task) {
                return res.status(404).send("Task not found");
            }

            // Eliminar todas las subtareas asociadas a la tarea
            await SubTasks.destroy({ where: { task_id: taskId } });

            // Eliminar la tarea
            await Tasks.destroy({ where: { id: taskId } });

            // Responder con un mensaje de éxito
            return res.status(200).json("Task and its subtasks deleted successfully");
        } catch (error) {
            console.error("Error deleting task and subtasks: ", error);
            return res.status(500).send("Internal Server Error");
        }
    });

};

