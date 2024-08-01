declare module "next-auth/react" {
    export function useSession(): any;
    export function signIn(provider: string, options: any): Promise<any>;
  }