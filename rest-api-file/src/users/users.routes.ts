import express, { Request, Response } from "express";
import { UnitUser } from "./users.interface"; // Assuming UnitUser is your user interface
import { StatusCodes } from "http-status-codes"; // For better status code management
import * as database from "./users.database"; // Import database functions

export const userRouter = express.Router();

// GET /users - Get all users
userRouter.get("/users", async (req: Request, res: Response): Promise<any> => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "No users found at this time." });
        }

        return res.status(StatusCodes.OK).json(allUsers);
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching users." });
    }
});

// GET /user/:id - Get user by ID
userRouter.get("/user/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const user: UnitUser | null = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

// POST /register - Register a new user
userRouter.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide a valid email." });
        }

        const user = await database.findByEmail(email);

        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "This email has already been registered." });
        }

        const newUser = await database.create(req.body);

        return res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

// POST /login - User login
userRouter.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }

        const user = await database.findByEmail(email);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided." });
        }

        const comparePassword = await database.comparePassword(email, password);

        if (!comparePassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Incorrect Password" });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

// PUT /user/:id - Update user
userRouter.put('/user/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters." });
        }

        const getUser = await database.findOne(req.params.id);

        if (!getUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
        }

        const updateUser = await database.update(req.params.id, req.body);

        return res.status(StatusCodes.OK).json({ updateUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});

// DELETE /user/:id - Delete user
userRouter.delete('/user/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id;

        const user = await database.findOne(id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "User does not exist" });
        }

        await database.remove(id);

        return res.status(StatusCodes.OK).json({ msg: "User deleted" });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    }
});