import bcrypt from "bcryptjs";
import { Result } from "@/lib/types";

/**
 * Generates a secure cryptographic hash from a plain text password using bcryptjs.
 * Wraps the execution inside a try-catch block to guarantee graceful failure logging.
 *
 * @param password - The raw plain text password string to be securely hashed.
 * @param salt - The cost factor determining hashing rounds (default: 10) or a pre-generated salt string.
 * @returns A promise resolving to a success result envelope containing the hashed string,
 *          or a failure result envelope if an exception occurs during the process.
 */
export async function hashPassword(
  password: string,
  salt: number | string = 10,
): Promise<Result<string>> {
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    return { success: true, data: hashedPassword };
  } catch (error) {
    console.error("[PASSWORD] Hash error.\n", error);
    return { success: false };
  }
}

/**
 * Safely compares a raw plain text password against an existing cryptographic bcrypt hash.
 * Protects the application server runtime by encapsulating bcrypt validation internal errors.
 *
 * @param password - The incoming raw plain text password input from the user.
 * @param hash - The verified cryptographic password hash stored inside the database.
 * @returns A promise resolving to a success result envelope containing a boolean validation match,
 *          or a failure result envelope if the comparison fails to execute completely.
 */
export async function comparePassword(password: string, hash: string): Promise<Result<boolean>> {
  try {
    const comparisonResult = await bcrypt.compare(password, hash);
    return { success: true, data: comparisonResult };
  } catch (error) {
    console.error("[PASSWORD] Compare error.\n", error);
    return { success: false };
  }
}
