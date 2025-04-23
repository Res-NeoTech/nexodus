import React from "react";
import Image from "next/image";
import webIcon from "../../public/web.png";
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

const CheckboxSearch = ({ checked, setChecked }: { checked: boolean; setChecked: (checked: boolean) => void }) => {
    return (
        <>
            <Tooltip id="webSearch" style={{ borderRadius: 10, backgroundColor: "black" }}/>
            <button data-tooltip-id="webSearch" data-tooltip-content={`Search: ${checked ? "On" : "Off"}`} className={`search ${checked ? "active" : ""}`} onClick={() => setChecked(!checked)}>
                <Image src={webIcon}
                    width={32}
                    height={32}
                    draggable={false}
                    alt="Web Search Icon" />
            </button>
        </>
    );
};

export default CheckboxSearch;
