"use client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    });
};
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {toast} from "sonner";

import FormField from "./FormField";
import {useRouter} from "next/navigation";

const AuthForm = ({type}:{type : FormType}) => {
    const formSchema = authFormSchema(type);
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email:"",
            password: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if(type === "sign-up"){
                toast.success('Account created successfully, please sign-in');
                router.push('/sign-in');}
            else{
                toast.success('Signed In successfully!');
                router.push('/');}

        }catch(err){
            console.log(err);
            toast.error(`There was an error ${err}`);
        }
    }
    const isSignIn = type ==='sign-in';

    return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card-border lg:min-w-[566px]">
                    <div className="flex flex-col gap-6 card py-14 px-10">
                        <div className="flex flex-row gap-2 justify-center">
                            <Image src="/logo.svg" alt="logo" height={32} width={38} />
                            <h2 className="text-primary-100">Student Feedback System</h2>
                        </div>

                        <h3>Check and submit reviews and feedbacks.</h3>


                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}
                                  className="w-full space-y-6 mt-4 form">
                                {!isSignIn && (
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        label="Name"
                                        placeholder="Your Name"
                                        type="text"
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    label="Email"
                                    placeholder="Your email address"
                                    type="email"
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    label="Password"
                                    placeholder="Enter your password"
                                    type="password"
                                />


                                <Button className="btn" type="submit">
                                    {isSignIn ? "Sign In" : "Create an Account"}
                                </Button>
                            </form>
                        </Form>

                        <p className="text-center">
                            {isSignIn ? "No account yet?" : "Have an account already?"}
                            <Link
                                href={!isSignIn ? "/sign-up" : "/sign-in"}
                                className="font-bold text-user-primary ml-1"
                            >
                                {!isSignIn ? "Sign In" : "Sign Up"}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

    )
}
export default AuthForm
