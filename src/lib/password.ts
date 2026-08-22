import bcrypt from "bcryptjs";

type PasswordResult<TOutputData extends string | boolean> = Promise<
  | {
      success: true;
      data: TOutputData;
    }
  | {
      success: false;
      message?: string;
    }
>;

export async function hashPassword(
  password: string,
  salt: number | string = 10,
): PasswordResult<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, salt);
    return { success: true, data: hashedPassword };
  } catch (error) {
    console.error("[PASSWORD] Hash error.\n", error);
    return { success: false };
  }
}

export async function comparePassword(password: string, hash: string): PasswordResult<boolean> {
  try {
    const comparisonResult = await bcrypt.compare(password, hash);
    return { success: true, data: comparisonResult };
  } catch (error) {
    console.error("[PASSWORD] Compare error.\n", error);
    return { success: false };
  }
}
