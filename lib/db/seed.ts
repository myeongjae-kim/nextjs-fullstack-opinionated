
async function seed() {
  /* example seed
  const loginId = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user] = await db
    .insert(users)
    .values([
      {
        loginId: loginId,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log('Initial user created.');
  */
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    Deno.exit(1);
  })
  .finally(() => {
    console.info('Seed process finished. Exiting...');
    Deno.exit(0);
  });
