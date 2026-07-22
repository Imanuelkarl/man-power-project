import { User } from '../generated/prisma/client.js';
import { CreateUserInput, UserModel } from '../models/user.model.js';

export type UserResponse = Omit<
	User,
	'password_hash' | 'id' | 'userId' | 'created_at' | 'updated_at'
> & {
	created_at: string;
	updated_at: string;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password_hash'>>;

export class UserService {
	static sanitizeUser(user: User): UserResponse {
		const { password_hash, id, userId, created_at, updated_at, ...safeUser } = user;

		return {
			...safeUser,
			created_at: created_at.toISOString(),
			updated_at: updated_at.toISOString(),
		};
	}

	static async findById(id: number): Promise<UserResponse | null> {
		const user = await UserModel.findById(id);
		return user ? this.sanitizeUser(user) : null;
	}

	static async findByUserId(userId: string): Promise<UserResponse | null> {
		const user = await UserModel.findByUserId(userId);
		return user ? this.sanitizeUser(user) : null;
	}

	static async findByEmail(email: string): Promise<UserResponse | null> {
		const user = await UserModel.findByEmail(email);
		return user ? this.sanitizeUser(user) : null;
	}

	static async findAll(): Promise<UserResponse[]> {
		const users = await UserModel.findAll();
		return users.map((user) => this.sanitizeUser(user));
	}

	static async update(id: number, data: UpdateUserInput): Promise<UserResponse> {
		const user = await UserModel.update(id, data);
		return this.sanitizeUser(user);
	}

	static async delete(id: number): Promise<UserResponse> {
		const user = await UserModel.delete(id);
		return this.sanitizeUser(user);
	}
}
