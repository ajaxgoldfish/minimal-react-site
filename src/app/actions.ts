'use server';

import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { User } from "@/db/entity/User";

export async function getUsers() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");

      const userRepository = AppDataSource.getRepository(User);
      const userCount = await userRepository.count();
      if (userCount === 0) {
        console.log("No users found. Seeding database...");
        await userRepository.save([
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
          { name: "Charlie", age: 35 },
        ]);
        console.log("Database has been seeded.");
      }
    }
    
    const users = await AppDataSource.manager.find(User);
    console.log("Fetched users:", users);
    return JSON.parse(JSON.stringify(users)); // Serialize users to be sent to the client
  } catch (error) {
    console.error("Error during data source operation:", error);
    // On subsequent calls after a failed initialization, it might be necessary to reset
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    return [];
  }
} 