"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import nexodusImage from "../../public/nexodus.png";
import "../styles/login.scss";
import StarBorder from '../components/StarBorder/StarBorder';
import ShinyText from '../components/ShinyText/ShinyText';

function LogIn() {
    const [loginStatus, setLoginStatus] = useState<string>("Log In");

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        fetch("/api/proxy/crud", { method: "GET" }).then((response) => {
            if (response.status === 200) {
                window.location.href = "/";
            }
        });
    }, [])

    const ValidateAndSend = () => {
        const email: string | undefined = emailRef.current?.value;
        const password: string | undefined = passwordRef.current?.value;

        if (errRef.current) {
            errRef.current.textContent = "";
        }

        if(email && password) {
            LoginRequest(email, password);
        }
    }

    const LoginRequest = async (email: string, password: string) => {
        setLoginStatus("Pending...");
        const request = await fetch("/api/proxy/auth",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            }
        );

        if (request.status === 401) {
            if (errRef.current) {
                errRef.current.textContent = "Incorrect login credentials.";
            }
        } else if (request.status === 200) {
            window.location.href = "/";
        }
        setLoginStatus("Log In");
    }

    return (
        <main>
            <Image src={nexodusImage}
                width={300}
                height={300}
                draggable={false}
                alt="Logo of Nexodus" />
            <h1 className="heading">Log In</h1>
            <form>
                <label htmlFor="uEmail">Email</label>
                <input type="text" name="uEmail" id="uEmail" ref={emailRef} required />
                <label htmlFor="uPassword">Password</label>
                <input type="password" name="uPassword" id="uPassword" ref={passwordRef} required />
                <p ref={errRef} className="error"></p>
                <StarBorder
                    as="button"
                    className="custom-class"
                    color="#21A698"
                    speed="5s"
                    disabled={loginStatus === "Pending..."}
                    onClick={(e) => {
                        e.preventDefault();
                        ValidateAndSend();
                    }}
                >
                    <ShinyText text={loginStatus} disabled={false} speed={5} className='benefits' />
                </StarBorder>
            </form>
        </main>
    )
}

export default LogIn;