import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export type UserRow = {
  id?: number;
  email?: string;
  password_hash?: string;
  hospital_id?: number;
  hospital_name?: string;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await sql`
    SELECT u.id, u.email, u.password_hash, u.hospital_id, h.name as hospital_name
    FROM users u
    JOIN hospitals h ON h.id = u.hospital_id
    WHERE u.email = ${email}
    LIMIT 1
  `;
  return (rows[0] as UserRow) ?? null;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createHospitalAndUser(
  hospitalName: string,
  email: string,
  password: string,
  contact?: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows: hospitalRows } = await sql`
    INSERT INTO hospitals (name, contact) VALUES (${hospitalName}, ${contact ?? null})
    RETURNING id
  `;
  const hospitalId = (hospitalRows[0] as { id?: number } | undefined)?.id;
  if (!hospitalId) throw new Error("Failed to create hospital");

  await sql`
    INSERT INTO users (email, password_hash, hospital_id)
    VALUES (${email}, ${passwordHash}, ${hospitalId})
  `;
  return { hospitalId };
}
