import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import QueryProvider from "@/components/QueryProvider";
import { isAuthenticated } from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";



const Layout = async ({ children }: { children: ReactNode }) => {

    const isUserAuthenticated = await isAuthenticated();
    if(!isUserAuthenticated){ redirect('/sign-in');}
    return (
        <QueryProvider>
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
                    <h2 className="text-primary-100">Student Feedback System</h2>
                </Link>
            </nav>

            {children}
        </div>
        </QueryProvider>
    );
};

export default Layout;
