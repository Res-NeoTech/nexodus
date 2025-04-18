"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import nexodusImage from "../../public/nexodus.png";
import "../styles/signup.scss";
import StarBorder from '../components/StarBorder/StarBorder';
import ShinyText from '../components/ShinyText/ShinyText';

function SignUp() {
    // Inputs
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const rPasswordRef = useRef<HTMLInputElement>(null);

    //Error displays
    const usernameErrRef = useRef<HTMLParagraphElement>(null);
    const emailErrRef = useRef<HTMLParagraphElement>(null);
    const passwordErrRef = useRef<HTMLParagraphElement>(null);
    const rPasswordErrRef = useRef<HTMLParagraphElement>(null);

    const [signStatus, setSignStatus] = useState<string>("Sign Up");

    useEffect(() => {
        fetch("/api/proxy/crud", { method: "GET" }).then((response) => {
            if (response.status === 200) {
                window.location.href = "/";
            }
        });
    }, [])

    const ValidateAndSend = () => {
        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        const name: string | undefined = usernameRef.current?.value;
        const email: string | undefined = emailRef.current?.value;
        const password: string | undefined = passwordRef.current?.value;
        const rPassword: string | undefined = rPasswordRef.current?.value;

        let hasError = false;

        if (usernameErrRef.current && emailErrRef.current && passwordErrRef.current && rPasswordErrRef.current) {
            usernameErrRef.current.textContent = "";
            emailErrRef.current.textContent = "";
            passwordErrRef.current.textContent = "";
            rPasswordErrRef.current.textContent = "";
        }

        if (name && (name.length > 50 || name.length <= 3)) {
            if (usernameErrRef.current) {
                usernameErrRef.current.textContent = "Username must be at least 4 and max 50 characters long.";
            }
            hasError = true;
        }

        // Validate password
        if (password && PASSWORD_REGEX.test(password) === false) {
            if (passwordErrRef.current) {
                passwordErrRef.current.textContent = "Password is invalid";
            }
            hasError = true;
        }

        // Validate repeated password
        if (rPassword && password && rPassword !== password) {
            if (rPasswordErrRef.current) {
                rPasswordErrRef.current.textContent = "Passwords do not match!";
            }
            hasError = true;
        }

        if (!hasError && name && email && password) {
            SignUpRequest(name, email, password);
        }
    };

    const SignUpRequest = async (username: string, email: string, password: string) => {
        setSignStatus("Pending...");
        const request = await fetch("/api/proxy/crud",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: username, email, password })
            }
        );

        if (request.status === 409) {
            if (emailErrRef.current) {
                emailErrRef.current.textContent = "This email is already in use.";
            }
        } else if (request.status === 201) {
            window.location.href = "/";
        } else if (request.status === 400) {
            const data = await request.json();
            if (data.error === "Email is not valid.") {
                if (emailErrRef.current) {
                    emailErrRef.current.textContent = "This email is invalid.";
                }
            }
        }
        setSignStatus("Sign Up");
    }

    return (
        <main>
            <Image src={nexodusImage}
                width={300}
                height={300}
                draggable={false}
                alt="Logo of Nexodus" />
                <h1 className="heading">Sign up</h1>
            <section className="signSection">
                <div className="leftContent">
                    <h4>Create a free account for following benefits:</h4>
                    <ShinyText text="- Chat history. Everything is on your account, no matter the device." disabled={false} speed={10} className='benefits' />
                    <ShinyText text="- Advanced search. Enjoy a more precise and advanced search function." disabled={false} speed={7} className='benefits' />
                    <ShinyText text="- More features to come! Stay tuned. Create an account now!" disabled={false} speed={9} className='benefits' />
                </div>
                <div className="rightContent">
                    <form>
                        <label htmlFor="uName">Username</label>
                        <input type="text" name="uName" id="uName" ref={usernameRef} required />
                        <p ref={usernameErrRef} className="error"></p>
                        <label htmlFor="uEmail">Email</label>
                        <input type="text" name="uEmail" id="uEmail" ref={emailRef} required />
                        <p ref={emailErrRef} className="error"></p>
                        <label htmlFor="uPassword">Password</label>
                        <input type="password" name="uPassword" id="uPassword" ref={passwordRef} required />
                        <p ref={passwordErrRef} className="error"></p>
                        <ShinyText text="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." disabled={false} speed={6} className='passwordExigence' />
                        <label htmlFor="uRPassword">Repeat password</label>
                        <input type="password" name="uRPassword" id="uRPassword" ref={rPasswordRef} required />
                        <p ref={rPasswordErrRef} className="error"></p>
                        <StarBorder
                            as="button"
                            className="custom-class"
                            color="#21A698"
                            speed="5s"
                            disabled={signStatus === "Pending..."}
                            onClick={(e) => {
                                e.preventDefault();
                                ValidateAndSend();
                            }}
                        >
                            <ShinyText text={signStatus} disabled={false} speed={5} className='benefits' />
                        </StarBorder>
                    </form>
                </div>
            </section>
        </main>
    );
}

export default SignUp;