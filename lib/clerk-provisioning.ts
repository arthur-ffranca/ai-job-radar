import { clerkClient } from "@clerk/nextjs/server";

export async function ensureClerkUserByEmail(email: string) {
  const client = await clerkClient();
  const existing = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  const existingUser = existing.data?.[0];
  if (existingUser) {
    return existingUser.id;
  }

  const created = await client.users.createUser({
    emailAddress: [email],
    skipPasswordRequirement: true,
    skipPasswordChecks: true,
  });

  return created.id;
}

