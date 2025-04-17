'use client';
import React from "react";
import { useRouter } from 'next/navigation'
import ShinyText from "./ShinyText/ShinyText";
import StarBorder from "./StarBorder/StarBorder";

type HeaderProps = {
    isLoggedIn: boolean;
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
    const router = useRouter();

    if (!isLoggedIn) {
        return (
            <header className="">
                <div className="headerDiv">
                    <StarBorder
                        as="button"
                        className="crudButton"
                        color="#21A698"
                        speed="5s"
                        onClick={() => router.push('/signup')}
                    >
                        <ShinyText text="Sign Up" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                    <StarBorder
                        as="button"
                        className="crudButton"
                        color="#21A698"
                        speed="5s"
                        onClick={() => router.push('/login')}
                    >
                        <ShinyText text="Log In" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                </div>
            </header>
        );
    } else {
        return (
            <header>
                <div className="headerDiv">
                    <StarBorder
                        as="button"
                        className="crudButton logOut"
                        color="#21A698"
                        speed="5s"
                        onClick={() => {
                            fetch("/api/proxy/logout").then((response) => {
                                if (response.status === 200) {
                                    window.location.reload();
                                }
                            });
                        }
                        }
                    >
                        <ShinyText text="Log Out" disabled={false} speed={5} className='buttonText' />
                    </StarBorder>
                </div>
            </header>
        );
    }
};

export default Header;