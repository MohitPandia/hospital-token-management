import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    hospitalId?: string;
  }

  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      hospitalId?: string;
    };
  }
}
