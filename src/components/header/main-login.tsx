import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { UserCircle2, Settings } from "lucide-react";

export default function SignInSignOutHeader() {
  const { user } = useUser();
  return (
    <main>
      <header className="flex h-16 items-center justify-end gap-4 bg-gray-200 p-4">
        <SignedOut>
          <SignInButton>
            <Button variant="outline" className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton forceRedirectUrl={"sign-up"}>
            <Button className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              Sign up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          {user && (
            <div className="text-sm font-medium text-gray-700">
              Hello, {user.firstName}!
            </div>
          )}
          <UserButton>
            <UserButton.UserProfilePage
              label="Additional Settings"
              url="additional-settings"
              labelIcon={<Settings className="h-4 w-4" />}
            >
              <EditProfileForm />
            </UserButton.UserProfilePage>
          </UserButton>

          <AdminStatus />
        </SignedIn>
      </header>
    </main>
  );
}
