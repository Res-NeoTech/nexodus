import React from "react";

const CheckboxSearch = ({ checked, setChecked }: { checked: boolean; setChecked: (checked: boolean) => void }) => {
    return (
        <button className="search" onClick={() => setChecked(!checked)}>
            {checked ? "Online" : "Offline"}
        </button>
    );
};

export default CheckboxSearch;
